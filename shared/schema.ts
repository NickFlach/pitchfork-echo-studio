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