import { z } from 'zod';

// Identity Verification Models
export const baseIdentitySchema = z.object({
  id: z.string(),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
  verificationLevel: z.enum(['none', 'basic', 'verified']),
  verificationHash: z.string().optional(),
  verifiedAt: z.string().optional(),
  expiresAt: z.string().optional(),
  signature: z.string().optional(), // For future cryptographic verification
  metadata: z.record(z.any()).optional(),
});

export const identitySchema = baseIdentitySchema.refine((data) => {
  // If verified or basic, must have verifiedAt and expiresAt
  if (data.verificationLevel !== 'none') {
    return data.verifiedAt && data.expiresAt;
  }
  return true;
}, 'Verified identities must have verifiedAt and expiresAt');

export const insertIdentitySchema = baseIdentitySchema.omit({ id: true });
export type Identity = z.infer<typeof identitySchema>;
export type InsertIdentity = z.infer<typeof insertIdentitySchema>;

// Movement/Organization Models
export const movementSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  creatorAddress: z.string(),
  memberCount: z.number().default(0),
  location: z.string(),
  category: z.string(),
  status: z.enum(['active', 'urgent', 'completed', 'suspended']),
  nextEventDate: z.string().optional(),
  encryptionKey: z.string().optional(),
  createdAt: z.string(),
});

export const insertMovementSchema = movementSchema.omit({ id: true, memberCount: true, createdAt: true });
export type Movement = z.infer<typeof movementSchema>;
export type InsertMovement = z.infer<typeof insertMovementSchema>;

// Document Verification Models
export const documentSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.enum(['war-crimes', 'corporate-corruption', 'human-rights', 'environmental', 'government-corruption']),
  submitterAddress: z.string(),
  fileHash: z.string(),
  verificationStatus: z.enum(['pending', 'verified', 'rejected']),
  verifiedBy: z.string().optional(),
  verifiedAt: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string(),
});

export const insertDocumentSchema = documentSchema.omit({ id: true, verificationStatus: true, createdAt: true });
export type Document = z.infer<typeof documentSchema>;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

// Donation/Funding Models
export const campaignSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  goalAmount: z.number(),
  raisedAmount: z.number().default(0),
  contributorCount: z.number().default(0),
  creatorAddress: z.string(),
  walletAddress: z.string(),
  endDate: z.string(),
  status: z.enum(['active', 'completed', 'cancelled']),
  urgent: z.boolean().default(false),
  createdAt: z.string(),
});

export const insertCampaignSchema = campaignSchema.omit({ 
  id: true, 
  raisedAmount: true, 
  contributorCount: true, 
  createdAt: true 
});
export type Campaign = z.infer<typeof campaignSchema>;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;

export const donationSchema = z.object({
  id: z.string(),
  campaignId: z.string(),
  donorAddress: z.string(),
  amount: z.number(),
  transactionHash: z.string(),
  createdAt: z.string(),
});

export const insertDonationSchema = donationSchema.omit({ id: true, createdAt: true });
export type Donation = z.infer<typeof donationSchema>;
export type InsertDonation = z.infer<typeof insertDonationSchema>;

// Membership Models
export const membershipSchema = z.object({
  id: z.string(),
  movementId: z.string(),
  memberAddress: z.string(),
  role: z.enum(['member', 'moderator', 'admin']),
  joinedAt: z.string(),
});

export const insertMembershipSchema = membershipSchema.omit({ id: true, joinedAt: true });
export type Membership = z.infer<typeof membershipSchema>;
export type InsertMembership = z.infer<typeof insertMembershipSchema>;

// Secure Messaging Models
export const messageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  senderAddress: z.string(),
  encryptedContent: z.string(), // Encrypted message content
  contentHash: z.string(), // Hash for integrity verification
  timestamp: z.string(),
  messageType: z.enum(['text', 'file', 'image']),
  isDeleted: z.boolean().default(false),
});

export const insertMessageSchema = messageSchema.omit({ id: true, timestamp: true });
export type Message = z.infer<typeof messageSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export const conversationSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  movementId: z.string().optional(), // Link to movement for organization
  participants: z.array(z.string()), // Array of wallet addresses
  encryptionKey: z.string(), // Shared encryption key for conversation
  conversationType: z.enum(['direct', 'group', 'movement']),
  isArchived: z.boolean().default(false),
  createdAt: z.string(),
  lastActivity: z.string(),
});

export const insertConversationSchema = conversationSchema.omit({ id: true, createdAt: true, lastActivity: true });
export type Conversation = z.infer<typeof conversationSchema>;
export type InsertConversation = z.infer<typeof insertConversationSchema>;

// DAO Governance Models
export const proposalSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  proposalType: z.enum(['policy', 'funding', 'platform', 'movement', 'emergency']),
  proposer: z.string(), // wallet address
  movementId: z.string().optional(), // link to specific movement
  status: z.enum(['draft', 'active', 'passed', 'rejected', 'executed']),
  votingStartsAt: z.string(),
  votingEndsAt: z.string(),
  quorumRequired: z.number(), // minimum votes needed
  passingThreshold: z.number(), // percentage needed to pass (0-100)
  yesVotes: z.number().default(0),
  noVotes: z.number().default(0),
  abstainVotes: z.number().default(0),
  totalVotes: z.number().default(0),
  executionData: z.string().optional(), // JSON for execution details
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const insertProposalSchema = proposalSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  yesVotes: true,
  noVotes: true, 
  abstainVotes: true,
  totalVotes: true 
});
export type Proposal = z.infer<typeof proposalSchema>;
export type InsertProposal = z.infer<typeof insertProposalSchema>;

export const voteSchema = z.object({
  id: z.string(),
  proposalId: z.string(),
  voterAddress: z.string(),
  voteChoice: z.enum(['yes', 'no', 'abstain']),
  votingPower: z.number().default(1), // future: stake-weighted voting
  reason: z.string().optional(), // optional reasoning
  timestamp: z.string(),
  signature: z.string().optional(), // cryptographic proof of vote
});

export const insertVoteSchema = voteSchema.omit({ id: true, timestamp: true });
export type Vote = z.infer<typeof voteSchema>;
export type InsertVote = z.infer<typeof insertVoteSchema>;

export const governanceConfigSchema = z.object({
  id: z.string(),
  movementId: z.string().optional(), // if movement-specific
  proposalCreationThreshold: z.number(), // minimum verification level to create proposals
  defaultQuorum: z.number(), // default minimum participation
  defaultPassingThreshold: z.number(), // default percentage to pass
  votingPeriodDays: z.number(), // how long votes stay open
  emergencyVotingPeriodHours: z.number(), // expedited voting for emergencies
  allowedProposalTypes: z.array(z.string()),
  isActive: z.boolean().default(true),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const insertGovernanceConfigSchema = governanceConfigSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export type GovernanceConfig = z.infer<typeof governanceConfigSchema>;
export type InsertGovernanceConfig = z.infer<typeof insertGovernanceConfigSchema>;