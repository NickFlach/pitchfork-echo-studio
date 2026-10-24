import { supabase } from '@/integrations/supabase/client';

export type VoteChoice = 'for' | 'against' | 'abstain';
export interface Analysis {
  summary: string; recommendation: VoteChoice; confidence: number;
  decentralizationImpact: 'increases' | 'neutral' | 'decreases';
  captureRisk: 'low' | 'medium' | 'high'; pros: string[]; cons: string[]; reasoning: string;
}
export interface SavedProposal {
  id: string; wallet_address: string; title: string; description: string;
  priority: string; risk: string; analysis: Analysis; created_at: string;
  ai_proposal_votes: { choice: VoteChoice; updated_at: string } | null;
}
type Payload = { action: 'history' } | { action: 'analyze'; title: string; description: string; priority: string; risk: string } | { action: 'vote'; proposalId: string; choice: VoteChoice };

async function invoke(body: unknown) {
  const { data, error } = await supabase.functions.invoke('proposal-history', { body });
  if (error || data?.error) {
    let message = data?.error || 'Could not complete the request. Please try again.';
    try {
      const response = (error as { context?: Response } | null)?.context;
      if (response) message = (await response.json()).error || message;
    } catch { /* Preserve fallback message. */ }
    throw new Error(message);
  }
  return data;
}

export async function walletRequest<T>(wallet: string, signer: { signMessage: (message: string) => Promise<string>; getAddress: () => Promise<string> }, chainId: number | null, payload: Payload): Promise<T> {
  if (chainId !== 47763) throw new Error('Switch your wallet to Neo X Mainnet.');
  if ((await signer.getAddress()).toLowerCase() !== wallet.toLowerCase()) throw new Error('Your wallet changed. Please try again.');
  const challenge = await invoke({ wallet, payload });
  const signature = await signer.signMessage(challenge.message);
  return invoke({ wallet, payload, challengeId: challenge.challengeId, signature });
}