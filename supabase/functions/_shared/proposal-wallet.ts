import { z } from 'npm:zod@3.23.8';
import { verifyMessage } from 'npm:ethers@6.15.0';

export const walletAddress = z.string().regex(/^0x[0-9a-fA-F]{40}$/).transform(v => v.toLowerCase());
export const proposalInput = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().min(10).max(4000),
  priority: z.enum(['decentralization', 'treasury', 'community', 'balanced']).default('balanced'),
  risk: z.enum(['low', 'medium', 'high']).default('medium'),
});
export const analysisSchema = z.object({
  summary: z.string(), recommendation: z.enum(['for', 'against', 'abstain']),
  confidence: z.number().min(0).max(100),
  decentralizationImpact: z.enum(['increases', 'neutral', 'decreases']),
  captureRisk: z.enum(['low', 'medium', 'high']),
  pros: z.array(z.string()), cons: z.array(z.string()), reasoning: z.string(),
});
export const requestPayload = z.discriminatedUnion('action', [
  proposalInput.extend({ action: z.literal('analyze') }),
  z.object({ action: z.literal('history') }),
  z.object({ action: z.literal('vote'), proposalId: z.string().uuid(), choice: z.enum(['for', 'against', 'abstain']) }),
]);

export async function payloadHash(payload: unknown) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(payload)));
  return Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
}

export function challengeMessage(challenge: { id: string; wallet_address: string; action: string; payload_hash: string; expires_at: string }) {
  return `Pitchfork Protocol\nDomain: protocol.pitchforks.social\nChain ID: 47763\nWallet: ${challenge.wallet_address}\nAction: ${challenge.action}\nPayload: ${challenge.payload_hash}\nNonce: ${challenge.id}\nExpires: ${challenge.expires_at}\nThis signature authorizes an off-chain AI Assistant action, not a blockchain transaction.`;
}

export function validWalletProof(message: string, signature: string, wallet: string) {
  try { return verifyMessage(message, signature).toLowerCase() === wallet.toLowerCase(); }
  catch { return false; }
}