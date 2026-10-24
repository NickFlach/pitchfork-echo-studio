import { z } from 'npm:zod@3.23.8';
export const forumPayload = z.discriminatedUnion('action', [
  z.object({ action: z.literal('thread'), title: z.string().trim().min(3).max(200), body: z.string().trim().min(1).max(10000) }),
  z.object({ action: z.literal('reply'), threadId: z.string().uuid(), body: z.string().trim().min(1).max(10000) }),
  z.object({ action: z.literal('upvote'), postId: z.string().uuid(), active: z.boolean() }),
]);
export function forumMessage(c: { id: string; wallet_address: string; action: string; payload_hash: string; expires_at: string }) {
  return `Pitchfork Protocol Forum\nDomain: protocol.pitchforks.social\nChain ID: 47763\nWallet: ${c.wallet_address}\nAction: ${c.action}\nPayload: ${c.payload_hash}\nNonce: ${c.id}\nExpires: ${c.expires_at}\nThis signature authorizes a public forum action, not a blockchain transaction.`;
}
