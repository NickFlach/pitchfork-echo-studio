import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3.23.8';
import { buildCorsHeaders } from '../_shared/cors.ts';
import { walletAddress, payloadHash, validWalletProof } from '../_shared/proposal-wallet.ts';
import { forumPayload, forumMessage } from '../_shared/forum-wallet.ts';
const read = z.object({ action: z.literal('list'), search: z.string().trim().max(200).default(''), sort: z.enum(['newest', 'top']).default('newest'), offset: z.number().int().min(0).max(100000).default(0), wallet: walletAddress.optional() });
const detail = z.object({ action: z.literal('detail'), threadId: z.string().uuid(), offset: z.number().int().min(0).max(100000).default(0), wallet: walletAddress.optional() });
const write = z.object({ wallet: walletAddress, payload: forumPayload, challengeId: z.string().uuid().optional(), signature: z.string().max(2000).optional() });
serve(async req => {
  const headers = { ...buildCorsHeaders(req), 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
  const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { headers, status });
  if (req.method === 'OPTIONS') return new Response(null, { headers });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    const body = await req.json();
    const url = Deno.env.get('SUPABASE_URL');
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !key) return json({ error: 'Forum unavailable' }, 503);
    const db = createClient(url, key);
    const decorate = async (posts: any[], wallet?: string) => {
      if (!posts.length) return [];
      let ids = new Set<string>();
      if (wallet) {
        const { data, error } = await db.from('forum_upvotes').select('post_id').eq('wallet_address', wallet).in('post_id', posts.map(p => p.id));
        if (error) throw error;
        ids = new Set((data || []).map(v => v.post_id));
      }
      return posts.map(p => ({ ...p, has_upvoted: ids.has(p.id) }));
    };
    if (body.action === 'list') {
      const parsed = read.safeParse(body);
      if (!parsed.success) return json({ error: 'Invalid search' }, 400);
      const { search, sort, offset, wallet } = parsed.data;
      let query = db.from('forum_post_summaries').select('*', { count: 'exact' }).is('thread_id', null);
      if (search) query = query.ilike('title', `%${search.replace(/[%_\\]/g, '\\$&')}%`);
      if (sort === 'top') query = query.order('upvotes', { ascending: false });
      const { data, count, error } = await query.order('created_at', { ascending: false }).order('id').range(offset, offset + 19);
      if (error) throw error;
      return json({ posts: await decorate(data || [], wallet), total: count || 0 });
    }
    if (body.action === 'detail') {
      const parsed = detail.safeParse(body);
      if (!parsed.success) return json({ error: 'Invalid thread' }, 400);
      const { threadId, offset, wallet } = parsed.data;
      const { data: thread, error: threadError } = await db.from('forum_post_summaries').select('*').eq('id', threadId).is('thread_id', null).maybeSingle();
      if (threadError) throw threadError;
      if (!thread) return json({ error: 'Thread not found' }, 404);
      const { data, count, error } = await db.from('forum_post_summaries').select('*', { count: 'exact' }).eq('thread_id', threadId).order('created_at').order('id').range(offset, offset + 49);
      if (error) throw error;
      const decorated = await decorate([thread, ...(data || [])], wallet);
      return json({ thread: decorated[0], replies: decorated.slice(1), total: count || 0 });
    }
    const parsed = write.safeParse(body);
    if (!parsed.success) return json({ error: 'Invalid forum post or vote' }, 400);
    const { wallet, payload, challengeId, signature } = parsed.data;
    const hash = await payloadHash(payload);
    if (!challengeId || !signature) {
      const { count, error: rateError } = await db.from('forum_wallet_challenges').select('id', { head: true, count: 'exact' }).eq('wallet_address', wallet).gt('expires_at', new Date().toISOString());
      if (rateError) throw rateError;
      if ((count || 0) >= 30) return json({ error: 'Too many pending requests. Please wait five minutes.' }, 429);
      const { data, error } = await db.from('forum_wallet_challenges').insert({ wallet_address: wallet, action: payload.action, payload_hash: hash }).select().single();
      if (error) throw error;
      return json({ challengeId: data.id, message: forumMessage(data) });
    }
    const { data: c } = await db.from('forum_wallet_challenges').select().eq('id', challengeId).maybeSingle();
    if (!c || c.wallet_address !== wallet || c.action !== payload.action || c.payload_hash !== hash || Date.parse(c.expires_at) <= Date.now() || !validWalletProof(forumMessage(c), signature, wallet)) return json({ error: 'Wallet signature is invalid or expired' }, 401);
    const { data: consumed, error: consumeError } = await db.from('forum_wallet_challenges').delete().eq('id', challengeId).select('id');
    if (consumeError || !consumed?.length) return json({ error: 'Signature already used' }, 401);
    if (payload.action === 'upvote') {
      const { data: post, error: postError } = await db.from('forum_posts').select('id').eq('id', payload.postId).maybeSingle();
      if (postError) throw postError;
      if (!post) return json({ error: 'Post not found' }, 404);
      const result = payload.active
        ? await db.from('forum_upvotes').upsert({ post_id: payload.postId, wallet_address: wallet }, { onConflict: 'post_id,wallet_address', ignoreDuplicates: true })
        : await db.from('forum_upvotes').delete().eq('post_id', payload.postId).eq('wallet_address', wallet);
      if (result.error) throw result.error;
      return json({ active: payload.active });
    }
    if (payload.action === 'reply') {
      const { data: thread, error } = await db.from('forum_posts').select('id').eq('id', payload.threadId).is('thread_id', null).maybeSingle();
      if (error) throw error;
      if (!thread) return json({ error: 'Thread not found' }, 404);
    }
    const { data, error } = await db.from('forum_posts').insert({ wallet_address: wallet, body: payload.body, title: payload.action === 'thread' ? payload.title : null, thread_id: payload.action === 'reply' ? payload.threadId : null }).select().single();
    if (error) throw error;
    return json({ post: data });
  } catch (error) {
    console.error('forum request failed', error);
    return json({ error: 'Could not load or save the forum. Please try again.' }, 500);
  }
});
