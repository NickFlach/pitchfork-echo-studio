import { z } from 'zod';

// Smart Contract Address Schema
export const contractAddressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid contract address');
export const transactionHashSchema = z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash');
export const blockNumberSchema = z.number().int().positive();

// Consciousness Token (ERC-20) Schemas
export const tokenBalanceSchema = z.object({
  address: contractAddressSchema,
  balance: z.string(), // Using string for precise decimal handling
  decimals: z.number().default(18),
  symbol: z.string().default("CONS"),
  timestamp: z.string(),
});

export const stakingPositionSchema = z.object({
  id: z.number(),
  amount: z.string(),
  startTime: z.number(),
  lockPeriod: z.number(),
  isActive: z.boolean(),
  rewards: z.string().default("0"),
  multiplier: z.number().default(1),
});

export const stakingDataSchema = z.object({
  userAddress: contractAddressSchema,
  totalStaked: z.string(),
  totalRewards: z.string(),
  positions: z.array(stakingPositionSchema),
  consciousnessVerified: z.boolean().default(false),
  votingPower: z.string().default("0"),
  lastUpdate: z.string(),
});

export const insertStakingDataSchema = stakingDataSchema.omit({ lastUpdate: true });
export type TokenBalance = z.infer<typeof tokenBalanceSchema>;
export type StakingPosition = z.infer<typeof stakingPositionSchema>;
export type StakingData = z.infer<typeof stakingDataSchema>;
export type InsertStakingData = z.infer<typeof insertStakingDataSchema>;

// NFT Achievement System Schemas
export const achievementCategoryEnum = z.enum([
  'CONSCIOUS_LEADER',
  'STRATEGIC_THINKER', 
  'CRISIS_MANAGER',
  'INNOVATION_CATALYST',
  'ETHICAL_GUARDIAN',
  'WISDOM_KEEPER',
  'TRANSFORMATION_AGENT',
  'COLLABORATION_MASTER'
]);

export const achievementLevelEnum = z.enum([
  'BRONZE',
  'SILVER',
  'GOLD',
  'PLATINUM',
  'DIAMOND',
  'TRANSCENDENT'
]);

export const achievementMetadataSchema = z.object({
  tokenId: z.number(),
  category: achievementCategoryEnum,
  level: achievementLevelEnum,
  issuedAt: z.number(),
  lastEvolution: z.number(),
  recipient: contractAddressSchema,
  metadataURI: z.string(),
  consciousnessScore: z.number().min(0).max(1000),
  assessmentScore: z.number().min(0).max(1000),
  skills: z.array(z.string()),
  canEvolve: z.boolean().default(false),
  evolutionReason: z.string().optional(),
});

export const achievementCollectionSchema = z.object({
  userAddress: contractAddressSchema,
  achievements: z.array(achievementMetadataSchema),
  totalCount: z.number(),
  averageConsciousnessScore: z.number(),
  highestLevel: achievementLevelEnum,
  lastUpdate: z.string(),
});

export const insertAchievementMetadataSchema = achievementMetadataSchema.omit({ canEvolve: true, evolutionReason: true });
export type AchievementCategory = z.infer<typeof achievementCategoryEnum>;
export type AchievementLevel = z.infer<typeof achievementLevelEnum>;
export type AchievementMetadata = z.infer<typeof achievementMetadataSchema>;
export type AchievementCollection = z.infer<typeof achievementCollectionSchema>;
export type InsertAchievementMetadata = z.infer<typeof insertAchievementMetadataSchema>;

// AI Service Payment Schemas
export const serviceTypeEnum = z.enum([
  'CONSCIOUSNESS_ANALYSIS',
  'STRATEGIC_INSIGHTS',
  'DECISION_SYNTHESIS',
  'PATTERN_RECOGNITION',
  'WISDOM_INTEGRATION',
  'CRISIS_MANAGEMENT',
  'LEADERSHIP_COACHING',
  'REFLECTION_GUIDANCE'
]);

export const paymentTokenSchema = z.object({
  address: contractAddressSchema.optional(), // undefined for ETH
  symbol: z.string(),
  decimals: z.number().default(18),
  name: z.string(),
  isSupported: z.boolean().default(true),
});

export const serviceConfigSchema = z.object({
  serviceType: serviceTypeEnum,
  basePrice: z.string(), // in wei
  dailyLimit: z.number(),
  perQueryLimit: z.number(),
  isActive: z.boolean(),
  name: z.string(),
  description: z.string().optional(),
  requiredConsciousnessLevel: z.number().default(0),
});

export const userPaymentAccountSchema = z.object({
  userAddress: contractAddressSchema,
  tokenBalances: z.record(z.string()), // token address -> balance
  totalSpent: z.record(z.string()), // token address -> total spent
  dailyUsage: z.record(z.number()), // service type -> usage count
  accountFundedAt: z.string(),
  lastUsage: z.string(),
});

export const paymentTransactionSchema = z.object({
  id: z.string(),
  userAddress: contractAddressSchema,
  serviceType: serviceTypeEnum,
  paymentToken: contractAddressSchema.optional(),
  amount: z.string(),
  transactionHash: transactionHashSchema,
  sessionId: z.string().optional(),
  status: z.enum(['pending', 'completed', 'failed', 'refunded']),
  timestamp: z.string(),
  gasUsed: z.string().optional(),
});

export const insertPaymentTransactionSchema = paymentTransactionSchema.omit({ id: true, timestamp: true });
export type ServiceType = z.infer<typeof serviceTypeEnum>;
export type PaymentToken = z.infer<typeof paymentTokenSchema>;
export type ServiceConfig = z.infer<typeof serviceConfigSchema>;
export type UserPaymentAccount = z.infer<typeof userPaymentAccountSchema>;
export type PaymentTransaction = z.infer<typeof paymentTransactionSchema>;
export type InsertPaymentTransaction = z.infer<typeof insertPaymentTransactionSchema>;

// Leadership Subscription Schemas
export const subscriptionTierEnum = z.enum(['NONE', 'BASIC', 'PREMIUM', 'ENTERPRISE']);

export const tierConfigSchema = z.object({
  tier: subscriptionTierEnum,
  monthlyPrice: z.string(), // in CONS tokens
  annualPrice: z.string(),
  maxAIQueries: z.number(),
  maxAssessments: z.number(),
  votingPower: z.number(),
  hasAdvancedAnalytics: z.boolean(),
  hasPersonalCoaching: z.boolean(),
  hasAPIAccess: z.boolean(),
  hasWhiteLabel: z.boolean(),
  includedFeatures: z.array(z.string()),
  consciousnessRequirement: z.number(),
  isActive: z.boolean(),
});

export const subscriptionDataSchema = z.object({
  userAddress: contractAddressSchema,
  tier: subscriptionTierEnum,
  startTime: z.number(),
  endTime: z.number(),
  isAnnual: z.boolean(),
  autoRenewal: z.boolean(),
  lastPayment: z.number(),
  totalPaid: z.string(),
  paymentToken: contractAddressSchema,
  isActive: z.boolean(),
  votingPowerAllocated: z.number(),
  transactionHistory: z.array(transactionHashSchema).default([]),
});

export const subscriptionUsageSchema = z.object({
  userAddress: contractAddressSchema,
  tier: subscriptionTierEnum,
  currentPeriodStart: z.string(),
  currentPeriodEnd: z.string(),
  aiQueriesUsed: z.number().default(0),
  assessmentsUsed: z.number().default(0),
  featuresAccessed: z.array(z.string()).default([]),
  lastActivity: z.string(),
});

export const insertSubscriptionDataSchema = subscriptionDataSchema.omit({ transactionHistory: true });
export type SubscriptionTier = z.infer<typeof subscriptionTierEnum>;
export type TierConfig = z.infer<typeof tierConfigSchema>;
export type SubscriptionData = z.infer<typeof subscriptionDataSchema>;
export type SubscriptionUsage = z.infer<typeof subscriptionUsageSchema>;
export type InsertSubscriptionData = z.infer<typeof insertSubscriptionDataSchema>;

// Decentralized Identity Schemas
export const verificationLevelEnum = z.enum([
  'NONE',
  'BASIC',
  'EXECUTIVE',
  'ENTERPRISE',
  'CONSCIOUSNESS_VERIFIED',
  'THOUGHT_LEADER'
]);

export const credentialTypeEnum = z.enum([
  'LEADERSHIP_ASSESSMENT',
  'EXECUTIVE_EXPERIENCE',
  'CONSCIOUSNESS_SCORE',
  'STRATEGIC_THINKING',
  'CRISIS_MANAGEMENT',
  'TEAM_LEADERSHIP',
  'INNOVATION_CAPACITY',
  'ETHICAL_DECISION_MAKING',
  'WISDOM_APPLICATION',
  'TRANSFORMATION_LEADERSHIP'
]);

export const decentralizedIdentitySchema = z.object({
  userAddress: contractAddressSchema,
  verificationLevel: verificationLevelEnum,
  consciousnessScore: z.number().min(0).max(1000),
  lastScoreUpdate: z.number(),
  publicProfile: z.string(), // IPFS hash
  privateProfileHash: z.string(),
  isEnterpriseAccount: z.boolean(),
  createdAt: z.number(),
  lastUpdated: z.number(),
});

export const credentialSchema = z.object({
  userAddress: contractAddressSchema,
  credentialType: credentialTypeEnum,
  issuer: contractAddressSchema,
  score: z.number().min(0).max(1000),
  issuedAt: z.number(),
  expiresAt: z.number(),
  isVerified: z.boolean(),
  isActive: z.boolean(),
  metadataURI: z.string(),
  proofHash: z.string(),
  endorsements: z.array(contractAddressSchema).default([]),
});

export const verificationAttestationSchema = z.object({
  id: z.string(),
  subject: contractAddressSchema,
  verifier: contractAddressSchema,
  level: verificationLevelEnum,
  evidence: z.string(), // IPFS hash
  timestamp: z.number(),
  isValid: z.boolean(),
  signature: z.string(),
  verificationScore: z.number().default(0),
});

export const privacySettingsSchema = z.object({
  userAddress: contractAddressSchema,
  allowPublicProfile: z.boolean(),
  allowCredentialSharing: z.boolean(),
  allowConsciousnessScoring: z.boolean(),
  allowEnterpriseAccess: z.boolean(),
  publicCredentials: z.record(z.boolean()), // credential type -> is public
  sharedWith: z.record(z.record(z.boolean())), // viewer address -> credential type -> allowed
  lastUpdate: z.string(),
});

export const insertDecentralizedIdentitySchema = decentralizedIdentitySchema.omit({ lastUpdated: true });
export const insertCredentialSchema = credentialSchema.omit({ endorsements: true });
export const insertVerificationAttestationSchema = verificationAttestationSchema.omit({ id: true });
export type VerificationLevel = z.infer<typeof verificationLevelEnum>;
export type CredentialType = z.infer<typeof credentialTypeEnum>;
export type DecentralizedIdentity = z.infer<typeof decentralizedIdentitySchema>;
export type Credential = z.infer<typeof credentialSchema>;
export type VerificationAttestation = z.infer<typeof verificationAttestationSchema>;
export type PrivacySettings = z.infer<typeof privacySettingsSchema>;
export type InsertDecentralizedIdentity = z.infer<typeof insertDecentralizedIdentitySchema>;
export type InsertCredential = z.infer<typeof insertCredentialSchema>;
export type InsertVerificationAttestation = z.infer<typeof insertVerificationAttestationSchema>;

// DAO Governance Schemas
export const proposalCategoryEnum = z.enum([
  'PLATFORM_DEVELOPMENT',
  'CONSCIOUSNESS_RESEARCH',
  'AI_MODEL_SELECTION',
  'TREASURY_ALLOCATION',
  'GOVERNANCE_PARAMETER',
  'COMMUNITY_INITIATIVE',
  'PARTNERSHIP_PROPOSAL',
  'EMERGENCY_ACTION'
]);

export const proposalStatusEnum = z.enum([
  'DRAFT',
  'ACTIVE',
  'SUCCEEDED',
  'DEFEATED',
  'EXECUTED',
  'EXPIRED',
  'CANCELLED'
]);

export const voteTypeEnum = z.enum(['FOR', 'AGAINST', 'ABSTAIN']);

export const blockchainProposalSchema = z.object({
  proposalId: z.number(),
  proposer: contractAddressSchema,
  category: proposalCategoryEnum,
  title: z.string(),
  description: z.string(),
  executionDetails: z.string().optional(), // IPFS hash
  startTime: z.number(),
  endTime: z.number(),
  executionDelay: z.number(),
  forVotes: z.string(),
  againstVotes: z.string(),
  abstainVotes: z.string(),
  totalVotingPower: z.string(),
  quorumRequired: z.number(),
  approvalThreshold: z.number(),
  status: proposalStatusEnum,
  isExecuted: z.boolean(),
  executedAt: z.number().optional(),
  requestedTokens: z.array(contractAddressSchema).default([]),
  requestedAmounts: z.array(z.string()).default([]),
  recipients: z.array(contractAddressSchema).default([]),
});

export const blockchainVoteSchema = z.object({
  id: z.string(),
  proposalId: z.number(),
  voter: contractAddressSchema,
  voteType: voteTypeEnum,
  votingPower: z.string(),
  timestamp: z.number(),
  reason: z.string().optional(),
  transactionHash: transactionHashSchema,
});

export const governanceParametersSchema = z.object({
  category: proposalCategoryEnum,
  proposalThreshold: z.string(), // Minimum tokens needed
  votingDelay: z.number(), // In seconds
  votingPeriod: z.number(), // In seconds
  executionDelay: z.number(), // In seconds
  quorumPercentage: z.number(), // Basis points
  approvalThreshold: z.number(), // Basis points
  gracePeriod: z.number(), // In seconds
});

export const treasuryAllocationSchema = z.object({
  token: contractAddressSchema.optional(), // undefined for ETH
  totalAmount: z.string(),
  allocatedAmount: z.string(),
  spentAmount: z.string(),
  lastAllocation: z.number(),
  isActive: z.boolean(),
});

export const userVotingPowerSchema = z.object({
  userAddress: contractAddressSchema,
  stakedBalance: z.string(),
  subscriptionPower: z.number(),
  delegatedVotes: z.string(),
  consciousnessBonus: z.boolean(),
  totalVotingPower: z.string(),
  delegateTo: contractAddressSchema.optional(),
  lastUpdate: z.string(),
});

export const insertBlockchainProposalSchema = blockchainProposalSchema.omit({ proposalId: true });
export const insertBlockchainVoteSchema = blockchainVoteSchema.omit({ id: true });
export type ProposalCategory = z.infer<typeof proposalCategoryEnum>;
export type ProposalStatus = z.infer<typeof proposalStatusEnum>;
export type VoteType = z.infer<typeof voteTypeEnum>;
export type BlockchainProposal = z.infer<typeof blockchainProposalSchema>;
export type BlockchainVote = z.infer<typeof blockchainVoteSchema>;
export type GovernanceParameters = z.infer<typeof governanceParametersSchema>;
export type TreasuryAllocation = z.infer<typeof treasuryAllocationSchema>;
export type UserVotingPower = z.infer<typeof userVotingPowerSchema>;
export type InsertBlockchainProposal = z.infer<typeof insertBlockchainProposalSchema>;
export type InsertBlockchainVote = z.infer<typeof insertBlockchainVoteSchema>;

// Smart Contract Event Schemas
export const contractEventSchema = z.object({
  id: z.string(),
  contractAddress: contractAddressSchema,
  eventName: z.string(),
  transactionHash: transactionHashSchema,
  blockNumber: blockNumberSchema,
  blockTimestamp: z.number(),
  logIndex: z.number(),
  args: z.record(z.any()), // Event arguments
  decoded: z.boolean().default(true),
  processed: z.boolean().default(false),
  processingError: z.string().optional(),
});

export const tokenTransferEventSchema = z.object({
  from: contractAddressSchema,
  to: contractAddressSchema,
  value: z.string(),
  transactionHash: transactionHashSchema,
  blockNumber: blockNumberSchema,
  timestamp: z.string(),
});

export const stakingEventSchema = z.object({
  user: contractAddressSchema,
  amount: z.string(),
  lockPeriod: z.number(),
  positionId: z.number(),
  eventType: z.enum(['Staked', 'Unstaked', 'RewardsClaimed']),
  transactionHash: transactionHashSchema,
  blockNumber: blockNumberSchema,
  timestamp: z.string(),
});

export const achievementEventSchema = z.object({
  tokenId: z.number(),
  recipient: contractAddressSchema,
  category: achievementCategoryEnum,
  level: achievementLevelEnum,
  eventType: z.enum(['Minted', 'Evolved', 'Transferred']),
  transactionHash: transactionHashSchema,
  blockNumber: blockNumberSchema,
  timestamp: z.string(),
});

export const subscriptionEventSchema = z.object({
  user: contractAddressSchema,
  tier: subscriptionTierEnum,
  eventType: z.enum(['Created', 'Upgraded', 'Renewed', 'Cancelled']),
  endTime: z.number().optional(),
  transactionHash: transactionHashSchema,
  blockNumber: blockNumberSchema,
  timestamp: z.string(),
});

export const insertContractEventSchema = contractEventSchema.omit({ id: true });
export type ContractEvent = z.infer<typeof contractEventSchema>;
export type TokenTransferEvent = z.infer<typeof tokenTransferEventSchema>;
export type StakingEvent = z.infer<typeof stakingEventSchema>;
export type AchievementEvent = z.infer<typeof achievementEventSchema>;
export type SubscriptionEvent = z.infer<typeof subscriptionEventSchema>;
export type InsertContractEvent = z.infer<typeof insertContractEventSchema>;

// Deployment and Configuration Schemas
export const deploymentConfigSchema = z.object({
  network: z.string(),
  chainId: z.number(),
  contracts: z.record(contractAddressSchema),
  deployer: contractAddressSchema,
  deploymentDate: z.string(),
  blockNumber: blockNumberSchema,
  gasUsed: z.string(),
  verificationStatus: z.record(z.boolean()),
  version: z.string().default("1.0.0"),
});

export const networkConfigSchema = z.object({
  name: z.string(),
  chainId: z.number(),
  rpcUrl: z.string(),
  blockExplorerUrl: z.string().optional(),
  nativeCurrency: z.object({
    name: z.string(),
    symbol: z.string(),
    decimals: z.number(),
  }),
  testnet: z.boolean().default(false),
});

export const contractABISchema = z.object({
  contractName: z.string(),
  abi: z.array(z.any()), // Contract ABI array
  bytecode: z.string(),
  deployedBytecode: z.string(),
  version: z.string(),
  compiler: z.string(),
  networks: z.record(z.object({
    address: contractAddressSchema,
    transactionHash: transactionHashSchema,
    blockNumber: blockNumberSchema,
  })),
});

export type DeploymentConfig = z.infer<typeof deploymentConfigSchema>;
export type NetworkConfig = z.infer<typeof networkConfigSchema>;
export type ContractABI = z.infer<typeof contractABISchema>;

// Web3 Integration Schemas
export const web3ConnectionSchema = z.object({
  userAddress: contractAddressSchema,
  providerType: z.enum(['metamask', 'walletconnect', 'coinbase', 'injected']),
  chainId: z.number(),
  isConnected: z.boolean(),
  lastConnection: z.string(),
  permissions: z.array(z.string()).default([]),
});

export const transactionStatusSchema = z.object({
  hash: transactionHashSchema,
  status: z.enum(['pending', 'confirmed', 'failed']),
  blockNumber: blockNumberSchema.optional(),
  gasUsed: z.string().optional(),
  gasPrice: z.string().optional(),
  timestamp: z.string(),
  error: z.string().optional(),
});

export const walletBalancesSchema = z.object({
  userAddress: contractAddressSchema,
  nativeBalance: z.string(), // ETH balance
  tokenBalances: z.record(z.string()), // token address -> balance
  stakingBalances: z.record(z.string()), // contract address -> staked amount
  nftBalances: z.record(z.number()), // contract address -> count
  lastUpdate: z.string(),
});

export type Web3Connection = z.infer<typeof web3ConnectionSchema>;
export type TransactionStatus = z.infer<typeof transactionStatusSchema>;
export type WalletBalances = z.infer<typeof walletBalancesSchema>;

// Analytics and Metrics Schemas
export const blockchainMetricsSchema = z.object({
  totalUsers: z.number(),
  totalTokenSupply: z.string(),
  totalStaked: z.string(),
  totalRewardsDistributed: z.string(),
  activeSubscriptions: z.number(),
  totalNFTsMinted: z.number(),
  activeProposals: z.number(),
  treasuryBalance: z.string(),
  averageConsciousnessScore: z.number(),
  timestamp: z.string(),
});

export const userActivitySchema = z.object({
  userAddress: contractAddressSchema,
  date: z.string(), // YYYY-MM-DD format
  transactions: z.number().default(0),
  aiQueriesUsed: z.number().default(0),
  governanceVotes: z.number().default(0),
  achievementsEarned: z.number().default(0),
  stakingActions: z.number().default(0),
  gasSpent: z.string().default("0"),
});

export const platformRevenueSchema = z.object({
  date: z.string(), // YYYY-MM-DD format
  subscriptionRevenue: z.string(),
  aiServiceRevenue: z.string(),
  stakingRewards: z.string(),
  totalRevenue: z.string(),
  activeUsers: z.number(),
  newUsers: z.number(),
});

export type BlockchainMetrics = z.infer<typeof blockchainMetricsSchema>;
export type UserActivity = z.infer<typeof userActivitySchema>;
export type PlatformRevenue = z.infer<typeof platformRevenueSchema>;

// Error and Monitoring Schemas
export const contractErrorSchema = z.object({
  id: z.string(),
  contractAddress: contractAddressSchema,
  functionName: z.string(),
  error: z.string(),
  transactionHash: transactionHashSchema.optional(),
  userAddress: contractAddressSchema.optional(),
  gasEstimate: z.string().optional(),
  timestamp: z.string(),
  resolved: z.boolean().default(false),
  resolution: z.string().optional(),
});

export const gasOptimizationSchema = z.object({
  contractAddress: contractAddressSchema,
  functionName: z.string(),
  averageGasUsed: z.string(),
  optimizedGasUsed: z.string().optional(),
  savingsPercentage: z.number().optional(),
  recommendedOptimizations: z.array(z.string()).default([]),
  lastAnalysis: z.string(),
});

export const securityAuditSchema = z.object({
  id: z.string(),
  contractAddress: contractAddressSchema,
  auditType: z.enum(['automated', 'manual', 'formal-verification']),
  findings: z.array(z.object({
    severity: z.enum(['critical', 'high', 'medium', 'low', 'informational']),
    issue: z.string(),
    recommendation: z.string(),
    status: z.enum(['open', 'acknowledged', 'fixed', 'false-positive'])
  })),
  auditDate: z.string(),
  auditor: z.string().optional(),
  reportHash: z.string().optional(), // IPFS hash of full report
});

export type ContractError = z.infer<typeof contractErrorSchema>;
export type GasOptimization = z.infer<typeof gasOptimizationSchema>;
export type SecurityAudit = z.infer<typeof securityAuditSchema>;

// Export all blockchain-related types
export * from './blockchain';