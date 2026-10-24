import { supabase } from '@/integrations/supabase/client';
export interface ForumPost {
  id: string; thread_id: string | null; wallet_address: string; title: string | null;
  body: string; created_at: string; upvotes: number; reply_count: number; has_upvoted: boolean;
}
export type ForumWrite = { action: 'thread'; title: string; body: string } | { action: 'reply'; threadId: string; body: string } | { action: 'upvote'; postId: string; active: boolean };
export async function forumCall<T>(body: unknown): Promise<T> {
  const { data, error } = await supabase.functions.invoke('forum', { body });
  if (error || data?.error) {
    let message = data?.error || 'Forum unavailable. Please try again.';
    try { if (error?.context instanceof Response) message = (await error.context.json()).error || message; } catch { /* Keep fallback. */ }
    throw new Error(message);
  }
  return data;
}
export async function forumWrite<T>(wallet: string, signer: { signMessage: (message: string) => Promise<string>; getAddress: () => Promise<string>; provider?: { getNetwork: () => Promise<{ chainId: bigint }> } | null }, chainId: number | null, payload: ForumWrite): Promise<T> {
  if (chainId !== 47763 || (signer.provider && (await signer.provider.getNetwork()).chainId !== 47763n)) throw new Error('Switch your wallet to Neo X Mainnet.');
  if ((await signer.getAddress()).toLowerCase() !== wallet.toLowerCase()) throw new Error('Wallet changed. Please try again.');
  const challenge = await forumCall<{ challengeId: string; message: string }>({ wallet, payload });
  const signature = await signer.signMessage(challenge.message);
  if ((await signer.getAddress()).toLowerCase() !== wallet.toLowerCase()) throw new Error('Wallet changed. Please try again.');
  return forumCall<T>({ wallet, payload, challengeId: challenge.challengeId, signature });
}
