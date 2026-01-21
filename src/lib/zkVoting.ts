/**
 * ZK Private Voting Library
 * 
 * Client-side library for zero-knowledge private voting
 * Aligned with Vitalik's DAO vision: "Without privacy, governance becomes a social game"
 * 
 * Features:
 * - Generate vote commitments (hiding vote until reveal phase)
 * - Generate cryptographic salts for vote binding
 * - Create ZK proofs for vote validity (placeholder for real ZK implementation)
 * - Reveal votes with proof of commitment
 */

import { ethers } from 'ethers';

// Vote choice enum matching contract
export enum VoteChoice {
  NONE = 0,
  FOR = 1,
  AGAINST = 2,
  ABSTAIN = 3,
}

// Voting phase enum
export enum VotingPhase {
  NOT_STARTED = 0,
  COMMIT = 1,
  REVEAL = 2,
  FINALIZED = 3,
}

// ZK Vote Proof structure
export interface ZKVoteProof {
  nullifier: string;
  commitment: string;
  proof: string;
  votingPowerRoot: bigint;
}

// Vote commitment data (stored locally by voter)
export interface VoteCommitmentData {
  proposalId: bigint;
  voteChoice: VoteChoice;
  salt: string;
  votingPower: bigint;
  voter: string;
  commitment: string;
  timestamp: number;
}

// Commitment status from contract
export interface CommitmentStatus {
  totalCommitments: bigint;
  totalRevealed: bigint;
  phase: VotingPhase;
  timeRemaining: bigint;
}

// Proposal results
export interface ProposalResults {
  forVotes: bigint;
  againstVotes: bigint;
  abstainVotes: bigint;
  totalCommitments: bigint;
  totalRevealed: bigint;
  finalized: boolean;
}

/**
 * Generate a cryptographically secure random salt for vote commitment
 * @returns 32-byte hex string salt
 */
export function generateSalt(): string {
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  return ethers.hexlify(randomBytes);
}

/**
 * Generate a vote commitment hash
 * commitment = keccak256(voteChoice, salt, votingPower, voter)
 * 
 * This ensures:
 * - Vote is hidden (no one knows how you voted)
 * - Vote is binding (you can't change it after commit)
 * - Voting power is locked in (prevents power manipulation between phases)
 * 
 * @param voteChoice - The vote (FOR, AGAINST, ABSTAIN)
 * @param salt - Random salt for hiding the vote
 * @param votingPower - Voting power at commitment time
 * @param voter - Voter's address
 * @returns The commitment hash
 */
export function generateCommitment(
  voteChoice: VoteChoice,
  salt: string,
  votingPower: bigint,
  voter: string
): string {
  // Pack data exactly as the contract does
  const encoded = ethers.solidityPacked(
    ['uint8', 'bytes32', 'uint256', 'address'],
    [voteChoice, salt, votingPower, voter]
  );
  
  return ethers.keccak256(encoded);
}

/**
 * Create a full vote commitment with all necessary data
 * Stores the data locally so voter can reveal later
 * 
 * @param proposalId - The proposal ID
 * @param voteChoice - The vote choice
 * @param votingPower - Current voting power
 * @param voter - Voter's address
 * @returns Complete commitment data for storage
 */
export function createVoteCommitment(
  proposalId: bigint,
  voteChoice: VoteChoice,
  votingPower: bigint,
  voter: string
): VoteCommitmentData {
  const salt = generateSalt();
  const commitment = generateCommitment(voteChoice, salt, votingPower, voter);
  
  return {
    proposalId,
    voteChoice,
    salt,
    votingPower,
    voter,
    commitment,
    timestamp: Date.now(),
  };
}

/**
 * Generate a nullifier for ZK proof (prevents double voting)
 * nullifier = hash(proposalId, voterSecret)
 * 
 * @param proposalId - The proposal ID
 * @param voterSecret - Voter's secret (derived from signature)
 * @returns Nullifier hash
 */
export function generateNullifier(
  proposalId: bigint,
  voterSecret: string
): string {
  const encoded = ethers.solidityPacked(
    ['uint256', 'bytes32'],
    [proposalId, voterSecret]
  );
  
  return ethers.keccak256(encoded);
}

/**
 * Generate a voter secret from a signed message
 * This creates a deterministic secret unique to each voter
 * 
 * @param signer - Ethers signer
 * @param domain - Domain identifier for the secret
 * @returns Voter secret hash
 */
export async function generateVoterSecret(
  signer: ethers.Signer,
  domain: string = 'ZK-VOTING-SECRET-V1'
): Promise<string> {
  const message = `Sign this message to generate your private voting key.\n\nDomain: ${domain}\nTimestamp: ${Math.floor(Date.now() / 86400000)}`; // Changes daily
  const signature = await signer.signMessage(message);
  return ethers.keccak256(signature);
}

/**
 * Generate a ZK vote proof (placeholder - real implementation needs ZK circuit)
 * 
 * In production, this would:
 * 1. Prove voter has valid voting power (merkle proof)
 * 2. Prove vote is valid (0, 1, or 2)
 * 3. Prove commitment is correctly formed
 * 4. Prove nullifier is correctly derived
 * All without revealing the actual vote
 * 
 * @param proposalId - The proposal ID
 * @param voteChoice - The vote choice
 * @param votingPower - Voting power
 * @param voter - Voter address
 * @param voterSecret - Voter's secret for nullifier
 * @param votingPowerRoot - Merkle root of voting power snapshot
 * @returns ZK proof structure
 */
export async function generateZKVoteProof(
  proposalId: bigint,
  voteChoice: VoteChoice,
  votingPower: bigint,
  voter: string,
  voterSecret: string,
  votingPowerRoot: bigint
): Promise<ZKVoteProof> {
  const salt = generateSalt();
  const commitment = generateCommitment(voteChoice, salt, votingPower, voter);
  const nullifier = generateNullifier(proposalId, voterSecret);
  
  // Placeholder proof - in production, use snarkjs or similar
  // This would call a ZK prover with the circuit
  const proofData = {
    pi_a: [ethers.keccak256(ethers.toUtf8Bytes('proof_a'))],
    pi_b: [[ethers.keccak256(ethers.toUtf8Bytes('proof_b1')), ethers.keccak256(ethers.toUtf8Bytes('proof_b2'))]],
    pi_c: [ethers.keccak256(ethers.toUtf8Bytes('proof_c'))],
    publicInputs: [commitment, nullifier],
  };
  
  const proof = ethers.AbiCoder.defaultAbiCoder().encode(
    ['bytes32[]', 'bytes32[][]', 'bytes32[]', 'bytes32[]'],
    [proofData.pi_a, proofData.pi_b, proofData.pi_c, proofData.publicInputs]
  );
  
  return {
    nullifier,
    commitment,
    proof,
    votingPowerRoot,
  };
}

/**
 * Verify a commitment matches stored data (client-side check)
 * 
 * @param storedData - The stored commitment data
 * @returns Whether the commitment is valid
 */
export function verifyStoredCommitment(storedData: VoteCommitmentData): boolean {
  const recalculated = generateCommitment(
    storedData.voteChoice,
    storedData.salt,
    storedData.votingPower,
    storedData.voter
  );
  
  return recalculated === storedData.commitment;
}

/**
 * Storage key for vote commitments
 */
const STORAGE_KEY_PREFIX = 'zk_vote_commitment_';

/**
 * Store vote commitment locally (encrypted in production)
 * Critical: This data is needed to reveal the vote later
 * 
 * @param data - Commitment data to store
 */
export function storeCommitment(data: VoteCommitmentData): void {
  const key = `${STORAGE_KEY_PREFIX}${data.proposalId}`;
  
  // In production, encrypt this data before storing
  // For now, use localStorage with a warning
  try {
    localStorage.setItem(key, JSON.stringify({
      ...data,
      proposalId: data.proposalId.toString(),
      votingPower: data.votingPower.toString(),
    }));
  } catch (error) {
    console.error('Failed to store commitment:', error);
    throw new Error('Failed to store vote commitment. Your vote may not be revealable.');
  }
}

/**
 * Retrieve stored vote commitment
 * 
 * @param proposalId - The proposal ID
 * @returns Stored commitment data or null
 */
export function getStoredCommitment(proposalId: bigint): VoteCommitmentData | null {
  const key = `${STORAGE_KEY_PREFIX}${proposalId}`;
  
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    return {
      ...parsed,
      proposalId: BigInt(parsed.proposalId),
      votingPower: BigInt(parsed.votingPower),
    };
  } catch (error) {
    console.error('Failed to retrieve commitment:', error);
    return null;
  }
}

/**
 * Remove stored commitment (after successful reveal)
 * 
 * @param proposalId - The proposal ID
 */
export function clearStoredCommitment(proposalId: bigint): void {
  const key = `${STORAGE_KEY_PREFIX}${proposalId}`;
  localStorage.removeItem(key);
}

/**
 * Get all stored commitments
 * 
 * @returns Array of all stored commitment data
 */
export function getAllStoredCommitments(): VoteCommitmentData[] {
  const commitments: VoteCommitmentData[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(STORAGE_KEY_PREFIX)) {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          commitments.push({
            ...parsed,
            proposalId: BigInt(parsed.proposalId),
            votingPower: BigInt(parsed.votingPower),
          });
        }
      } catch (error) {
        console.error('Failed to parse commitment:', error);
      }
    }
  }
  
  return commitments;
}

/**
 * Format voting phase for display
 */
export function formatVotingPhase(phase: VotingPhase): string {
  switch (phase) {
    case VotingPhase.NOT_STARTED:
      return 'Not Started';
    case VotingPhase.COMMIT:
      return 'Commit Phase (Vote Hidden)';
    case VotingPhase.REVEAL:
      return 'Reveal Phase';
    case VotingPhase.FINALIZED:
      return 'Finalized';
    default:
      return 'Unknown';
  }
}

/**
 * Format vote choice for display
 */
export function formatVoteChoice(choice: VoteChoice): string {
  switch (choice) {
    case VoteChoice.FOR:
      return 'For';
    case VoteChoice.AGAINST:
      return 'Against';
    case VoteChoice.ABSTAIN:
      return 'Abstain';
    default:
      return 'None';
  }
}

/**
 * Calculate time remaining in a phase
 */
export function formatTimeRemaining(seconds: bigint): string {
  const s = Number(seconds);
  if (s <= 0) return 'Ended';
  
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  
  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
}
