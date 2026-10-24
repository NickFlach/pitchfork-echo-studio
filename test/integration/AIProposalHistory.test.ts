import test from 'node:test';
import assert from 'node:assert/strict';
import { Wallet } from 'ethers';
import dotenv from 'dotenv';
dotenv.config({ quiet: true });

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
async function call(wallet: string, payload: unknown, proof: object = {}) {
  assert.ok(url && key, 'App connection configured');
  const response = await fetch(`${url}/functions/v1/proposal-history`, {
    method: 'POST', headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ wallet, payload, ...proof }),
  });
  return { status: response.status, data: await response.json() };
}
async function signed(wallet: Wallet, payload: unknown) {
  const challenge = await call(wallet.address, payload);
  assert.equal(challenge.status, 200);
  const proof = { challengeId: challenge.data.challengeId, signature: await wallet.signMessage(challenge.data.message) };
  return { ...(await call(wallet.address, payload, proof)), proof };
}

test('Every analyzed proposal persists and is returned in wallet history', async () => {
  const wallet = Wallet.createRandom();
  const other = Wallet.createRandom();
  const payload = { action: 'analyze', title: 'Community oversight test proposal', description: 'Create a rotating community committee to review treasury spending and publish monthly reports.', priority: 'balanced', risk: 'medium' };
  const saved = await signed(wallet, payload);
  assert.equal(saved.status, 200, saved.data.error);
  const id = saved.data.proposal.id;
  assert.ok(id);
  assert.equal(saved.data.proposal.title, payload.title);
  const history = await signed(wallet, { action: 'history' });
  assert.equal(history.status, 200);
  assert.equal(history.data.proposals.find((p: { id: string }) => p.id === id)?.analysis.summary, saved.data.proposal.analysis.summary);
  await test('Recorded vote persists and changing it leaves exactly one vote', async () => {
    assert.equal((await signed(wallet, { action: 'vote', proposalId: id, choice: 'for' })).status, 200);
    assert.equal((await signed(wallet, { action: 'vote', proposalId: id, choice: 'against' })).status, 200);
    const readback = await signed(wallet, { action: 'history' });
    const proposal = readback.data.proposals.find((p: { id: string }) => p.id === id);
    assert.equal(proposal.ai_proposal_votes.choice, 'against');
  });
  await test('Another wallet cannot read or vote on private analyses', async () => {
    const history = await signed(other, { action: 'history' });
    assert.equal(history.status, 200);
    assert.equal(history.data.proposals.some((p: { id: string }) => p.id === id), false);
    assert.equal((await signed(other, { action: 'vote', proposalId: id, choice: 'for' })).status, 404);
  });
  await test('A wallet signature cannot be replayed or used by another wallet', async () => {
    assert.equal((await call(wallet.address, payload, saved.proof)).status, 401);
    const challenge = await call(wallet.address, { action: 'history' });
    const forged = await call(wallet.address, { action: 'history' }, { challengeId: challenge.data.challengeId, signature: await other.signMessage(challenge.data.message) });
    assert.equal(forged.status, 401);
  });
});