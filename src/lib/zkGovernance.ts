import { getAddress, isAddress } from 'ethers';

// Set only after a deployment has been verified on Neo X Mainnet.
export const SHARED_ZK_VOTING_ADDRESS = '';
export const ZK_CONTRACT_BOOKMARK = 'pitchfork-zk-contract:47763';

export function resolveVotingAddress(explicit: string | null, bookmark: string | null) {
  const candidate = explicit || SHARED_ZK_VOTING_ADDRESS || bookmark || '';
  return isAddress(candidate) ? getAddress(candidate) : '';
}

export type LiveZKProposal = {
  id: string; title: string; description: string; creator: string;
  registrationEnd: bigint; commitEnd: bigint; revealEnd: bigint; quorum: bigint;
  committed: bigint; revealed: bigint; forVotes: bigint; againstVotes: bigint;
  abstainVotes: bigint; tallied: boolean; passed: boolean;
};

export function proposalPhase(p: LiveZKProposal, timestamp: number) {
  if (p.tallied) return p.passed ? 'Passed' : 'Not passed';
  if (timestamp < Number(p.registrationEnd)) return 'Registration';
  if (timestamp < Number(p.commitEnd)) return 'Commit';
  if (timestamp < Number(p.revealEnd)) return 'Reveal';
  return 'Ready to tally';
}

export function zkProposalLink(address: string, id?: string) {
  const params = new URLSearchParams({ contract: getAddress(address) });
  if (id) params.set('proposal', id);
  return `/zk-voting?${params}`;
}