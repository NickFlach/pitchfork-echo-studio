import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3.23.8';
import { buildCorsHeaders } from '../_shared/cors.ts';
import { walletAddress, requestPayload, payloadHash, challengeMessage, validWalletProof } from '../_shared/proposal-wallet.ts';

const envelope = z.object({ wallet: walletAddress, payload: requestPayload, challengeId: z.string().uuid().optional(), signature: z.string().max(2000).optional() });
serve(async req => {
  const headers = { ...buildCorsHeaders(req), 'Content-Type': 'application/json' };
  const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers });
  if (req.method === 'OPTIONS') return new Response(null, { headers });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    const body = envelope.safeParse(await req.json());
    if (!body.success) return json({ error: 'Invalid request' }, 400);
    const { wallet, payload, challengeId, signature } = body.data;
    const url = Deno.env.get('SUPABASE_URL');
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !key) return json({ error: 'Storage unavailable' }, 503);
    const db = createClient(url, key);
    const hash = await payloadHash(payload);
    if (!challengeId || !signature) {
      const { data, error } = await db.from('ai_wallet_challenges').insert({ wallet_address: wallet, action: payload.action, payload_hash: hash }).select().single();
      if (error) throw error;
      return json({ challengeId: data.id, message: challengeMessage(data) });
    }
    const { data: challenge } = await db.from('ai_wallet_challenges').select().eq('id', challengeId).single();
    if (!challenge || challenge.wallet_address !== wallet || challenge.payload_hash !== hash || challenge.action !== payload.action || Date.parse(challenge.expires_at) <= Date.now() || !validWalletProof(challengeMessage(challenge), signature, wallet)) return json({ error: 'Wallet signature is invalid or expired' }, 401);
    const { data: consumed, error: consumeError } = await db.from('ai_wallet_challenges').delete().eq('id', challengeId).select('id');
    if (consumeError || !consumed?.length) return json({ error: 'Signature already used' }, 401);
    if (payload.action === 'history') {
      const { data, error } = await db.from('ai_proposal_analyses').select('*, ai_proposal_votes(choice, updated_at)').eq('wallet_address', wallet).order('created_at', { ascending: false });
      if (error) throw error;
      return json({ proposals: data });
    }
    if (payload.action === 'vote') {
      const { data: proposal } = await db.from('ai_proposal_analyses').select('id').eq('id', payload.proposalId).eq('wallet_address', wallet).single();
      if (!proposal) return json({ error: 'Proposal not found for this wallet' }, 404);
      const { data, error } = await db.from('ai_proposal_votes').upsert({ proposal_id: payload.proposalId, wallet_address: wallet, choice: payload.choice, updated_at: new Date().toISOString() }).select().single();
      if (error) throw error;
      return json({ vote: data });
    }
    // Forward a verified analysis request internally; never accept client-supplied AI results.
    const response = await fetch(`${url}/functions/v1/analyze-proposal`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ ...payload, wallet }),
    });
    return new Response(await response.text(), { status: response.status, headers });
  } catch (error) {
    console.error('proposal-history request failed', error);
    return json({ error: 'Could not complete the request. Please try again.' }, 500);
  }
});