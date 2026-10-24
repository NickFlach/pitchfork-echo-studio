import test from 'node:test';
import assert from 'node:assert/strict';
import { Wallet } from 'ethers';
import dotenv from 'dotenv';
dotenv.config({ quiet: true });
const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
async function call(body: unknown) {
  assert.ok(url && key);
  const response = await fetch(`${url}/functions/v1/forum`, { method: 'POST', headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return { status: response.status, data: await response.json() };
}
async function signed(wallet: ReturnType<typeof Wallet.createRandom>, payload: unknown) {
  const c = await call({ wallet: wallet.address, payload });
  assert.equal(c.status, 200, JSON.stringify(c.data));
  const proof = { challengeId: c.data.challengeId, signature: await wallet.signMessage(c.data.message) };
  return { ...await call({ wallet: wallet.address, payload, ...proof }), proof };
}
test('Forum threads, replies and upvotes persist with verified wallet ownership', async t => {
  const wallet = Wallet.createRandom();
  const other = Wallet.createRandom();
  const payload = { action: 'thread', title: `Forum integration ${crypto.randomUUID()}`, body: 'A public discussion about community governance.' };
  const saved = await signed(wallet, payload);
  assert.equal(saved.status, 200, saved.data.error);
  const id = saved.data.post.id;
  await t.test('Public thread reads back with its signed author', async () => {
    const result = await call({ action: 'detail', threadId: id });
    assert.equal(result.status, 200);
    assert.equal(result.data.thread.body, payload.body);
    assert.equal(result.data.thread.wallet_address, wallet.address.toLowerCase());
  });
  let replyId: string;
  await t.test('Another wallet can reply and its reply reads back', async () => {
    const reply = await signed(other, { action: 'reply', threadId: id, body: 'Include transparent community reporting.' });
    assert.equal(reply.status, 200);
    replyId = reply.data.post.id;
    const result = await call({ action: 'detail', threadId: id });
    assert.equal(result.data.total, 1);
    assert.equal(result.data.thread.reply_count, 1);
    assert.equal(result.data.replies[0].wallet_address, other.address.toLowerCase());
    assert.equal(result.data.replies[0].body, 'Include transparent community reporting.');
  });
  await t.test('Repeated upvotes count once per wallet and removal cannot remove another vote', async () => {
    const vote = { action: 'upvote', postId: id, active: true };
    assert.equal((await signed(wallet, vote)).status, 200);
    assert.equal((await signed(wallet, vote)).status, 200);
    let result = await call({ action: 'detail', threadId: id, wallet: wallet.address });
    assert.equal(result.data.thread.upvotes, 1);
    assert.equal(result.data.thread.has_upvoted, true);
    await signed(other, vote);
    await signed(wallet, { ...vote, active: false });
    result = await call({ action: 'detail', threadId: id, wallet: wallet.address });
    assert.equal(result.data.thread.upvotes, 1);
    assert.equal(result.data.thread.has_upvoted, false);
    assert.equal((await call({ action: 'detail', threadId: id, wallet: other.address })).data.thread.has_upvoted, true);
  });
  await t.test('Replies can be upvoted independently', async () => {
    assert.equal((await signed(wallet, { action: 'upvote', postId: replyId, active: true })).status, 200);
    const result = await call({ action: 'detail', threadId: id });
    assert.equal(result.data.replies[0].upvotes, 1);
    assert.equal(result.data.thread.upvotes, 1);
  });
  await t.test('Signatures cannot be replayed, forged or used for a different payload', async () => {
    assert.equal((await call({ wallet: wallet.address, payload, ...saved.proof })).status, 401);
    const c = await call({ wallet: wallet.address, payload });
    assert.equal((await call({ wallet: wallet.address, payload, challengeId: c.data.challengeId, signature: await other.signMessage(c.data.message) })).status, 401);
    assert.equal((await call({ wallet: wallet.address, payload: { ...payload, body: 'Changed post' }, challengeId: c.data.challengeId, signature: await wallet.signMessage(c.data.message) })).status, 401);
  });
  await t.test('A reply cannot be a thread parent and nonexistent posts cannot receive votes', async () => {
    assert.equal((await signed(wallet, { action: 'reply', threadId: replyId, body: 'Invalid nested reply' })).status, 404);
    assert.equal((await signed(wallet, { action: 'upvote', postId: crypto.randomUUID(), active: true })).status, 404);
  });
  await t.test('Search returns the saved thread', async () => {
    const result = await call({ action: 'list', search: payload.title });
    assert.equal(result.status, 200);
    assert.equal(result.data.posts[0].id, id);
  });
});
