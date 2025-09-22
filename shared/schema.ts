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
  metadata: z.record(z.any()).optional(),
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

// AI Settings Models
export const AIProviderEnum = z.enum(['openai', 'claude', 'gemini', 'xai', 'litellm']);
export type AIProvider = z.infer<typeof AIProviderEnum>;

export const aiModelConfigSchema = z.object({
  name: z.string(),
  maxTokens: z.number().optional(),
  temperature: z.number().min(0).max(2).optional(),
  topP: z.number().min(0).max(1).optional(),
  frequencyPenalty: z.number().min(-2).max(2).optional(),
  presencePenalty: z.number().min(-2).max(2).optional(),
  customParams: z.record(z.any()).optional(),
});

export type AIModelConfig = z.infer<typeof aiModelConfigSchema>;

export const aiRetryConfigSchema = z.object({
  maxAttempts: z.number().min(1).max(10).default(3),
  backoffMs: z.number().min(100).max(60000).default(1000),
});

export const aiRoutingConfigSchema = z.object({
  primary: AIProviderEnum,
  fallbacks: z.array(AIProviderEnum).default([]),
  timeoutMs: z.number().min(1000).max(120000).default(30000),
  retry: aiRetryConfigSchema.optional(),
});

export const aiSettingsSchema = z.object({
  id: z.string(),
  mode: z.enum(['direct', 'litellm']).default('direct'),
  routing: aiRoutingConfigSchema,
  providerPrefs: z.record(AIProviderEnum, aiModelConfigSchema).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const insertAISettingsSchema = aiSettingsSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export type AISettings = z.infer<typeof aiSettingsSchema>;
export type InsertAISettings = z.infer<typeof insertAISettingsSchema>;

export const aiUsageAnalyticsSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  aiProvider: AIProviderEnum,
  model: z.string(),
  featureType: z.string(),
  success: z.boolean(),
  responseTimeMs: z.number().optional(),
  totalTokens: z.number().optional(),
  inputTokens: z.number().optional(),
  outputTokens: z.number().optional(),
  error: z.string().optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
});

export type AIUsageAnalytics = z.infer<typeof aiUsageAnalyticsSchema>;
export type InsertAIUsageAnalytics = z.infer<typeof aiUsageAnalyticsSchema>;

export const aiUserFeedbackSchema = z.object({
  id: z.string(),
  userId: z.string(),
  feedback: z.string(),
  rating: z.number().min(1).max(5),
  createdAt: z.string(),
});

export type AIUserFeedback = z.infer<typeof aiUserFeedbackSchema>;
export type InsertAIUserFeedback = z.infer<typeof aiUserFeedbackSchema>;

export const maskedAICredentialsSchema = z.object({
  provider: AIProviderEnum,
  hasCredentials: z.boolean(),
  lastUsed: z.string().optional(),
});

export type MaskedAICredentials = z.infer<typeof maskedAICredentialsSchema>;

// Consciousness Models
export const consciousnessStateSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  level: z.number(),
  dimensions: z.record(z.number()),
  metadata: z.record(z.any()).optional(),
  state: z.string().optional(),
  awarenessLevel: z.number().optional(),
  recursionDepth: z.number().optional(),
  orderChaosBalance: z.number().optional(),
  emergentInsights: z.array(z.string()).optional(),
  activePatternsRecognized: z.number().optional(),
  contextLayers: z.number().optional(),
});

export type ConsciousnessState = z.infer<typeof consciousnessStateSchema>;
export type InsertConsciousnessState = z.infer<typeof consciousnessStateSchema>;

export const decisionRecordSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  context: z.string(),
  decision: z.string(),
  outcome: z.string().optional(),
  confidence: z.number(),
  cascadingEffects: z.array(z.string()).optional(),
});

export type DecisionRecord = z.infer<typeof decisionRecordSchema>;
export type InsertDecisionRecord = z.infer<typeof decisionRecordSchema>;

export const reflectionLogSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  trigger: z.string(),
  reflection: z.string(),
  insights: z.array(z.string()),
});

export type ReflectionLog = z.infer<typeof reflectionLogSchema>;
export type InsertReflectionLog = z.infer<typeof reflectionLogSchema>;

export const learningCycleSchema = z.object({
  id: z.string(),
  startTime: z.string(),
  endTime: z.string().optional(),
  phase: z.string(),
  progress: z.number(),
  learnings: z.array(z.string()),
});

export type LearningCycle = z.infer<typeof learningCycleSchema>;
export type InsertLearningCycle = z.infer<typeof learningCycleSchema>;

export const complexityMapSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  nodes: z.array(z.record(z.any())),
  connections: z.array(z.record(z.any())),
  metrics: z.record(z.number()),
  edges: z.array(z.record(z.any())).optional(),
  name: z.string().optional(),
  complexityMetrics: z.record(z.number()).optional(),
  emergentProperties: z.array(z.string()).optional(),
  systemScope: z.string().optional(),
  version: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type ComplexityMap = z.infer<typeof complexityMapSchema>;
export type InsertComplexityMap = z.infer<typeof complexityMapSchema>;

// Message and Conversation Models
export const messageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  timestamp: z.string(),
});

export type Message = z.infer<typeof messageSchema>;
export type InsertMessage = z.infer<typeof messageSchema>;

export const conversationSchema = z.object({
  id: z.string(),
  title: z.string(),
  userId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Conversation = z.infer<typeof conversationSchema>;
export type InsertConversation = z.infer<typeof conversationSchema>;

// Governance Models
export const proposalSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  proposer: z.string(),
  status: z.enum(['active', 'passed', 'rejected']),
  createdAt: z.string(),
});

export type Proposal = z.infer<typeof proposalSchema>;
export type InsertProposal = z.infer<typeof proposalSchema>;

export const voteSchema = z.object({
  id: z.string(),
  proposalId: z.string(),
  voter: z.string(),
  choice: z.enum(['for', 'against', 'abstain']),
  timestamp: z.string(),
});

export type Vote = z.infer<typeof voteSchema>;
export type InsertVote = z.infer<typeof voteSchema>;

export const governanceConfigSchema = z.object({
  id: z.string(),
  votingPeriod: z.number(),
  quorum: z.number(),
  proposalThreshold: z.number(),
});

export type GovernanceConfig = z.infer<typeof governanceConfigSchema>;
export type InsertGovernanceConfig = z.infer<typeof governanceConfigSchema>;

// Corruption Analysis Models
export const corruptionAnalysisResultSchema = z.object({
  id: z.string(),
  target: z.string(),
  score: z.number(),
  indicators: z.array(z.string()),
  recommendations: z.array(z.string()),
  timestamp: z.string(),
});

export type CorruptionAnalysisResult = z.infer<typeof corruptionAnalysisResultSchema>;
export type InsertCorruptionAnalysisResult = z.infer<typeof corruptionAnalysisResultSchema>;

export const systemicCorruptionReportSchema = z.object({
  id: z.string(),
  sector: z.string(),
  findings: z.array(z.string()),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  timestamp: z.string(),
});

export type SystemicCorruptionReport = z.infer<typeof systemicCorruptionReportSchema>;
export type InsertSystemicCorruptionReport = z.infer<typeof systemicCorruptionReportSchema>;

// Strategic Models
export const campaignStrategyPlanSchema = z.object({
  id: z.string(),
  title: z.string(),
  objectives: z.array(z.string()),
  tactics: z.array(z.string()),
  timeline: z.string(),
  resources: z.array(z.string()),
});

export type CampaignStrategyPlan = z.infer<typeof campaignStrategyPlanSchema>;
export type InsertCampaignStrategyPlan = z.infer<typeof campaignStrategyPlanSchema>;

export const resourceProfileSchema = z.object({
  id: z.string(),
  type: z.string(),
  availability: z.number(),
  allocation: z.record(z.number()),
  timestamp: z.string(),
});

export type ResourceProfile = z.infer<typeof resourceProfileSchema>;
export type InsertResourceProfile = z.infer<typeof resourceProfileSchema>;

// Enterprise Leadership Models
export const executiveAssessmentSchema = z.object({
  id: z.string(),
  executiveId: z.string(),
  scores: z.record(z.number()),
  recommendations: z.array(z.string()),
  timestamp: z.string(),
});

export type ExecutiveAssessment = z.infer<typeof executiveAssessmentSchema>;
export type InsertExecutiveAssessment = z.infer<typeof executiveAssessmentSchema>;

export const strategicPlanSchema = z.object({
  id: z.string(),
  title: z.string(),
  goals: z.array(z.string()),
  initiatives: z.array(z.string()),
  timeline: z.string(),
});

export type StrategicPlan = z.infer<typeof strategicPlanSchema>;
export type InsertStrategicPlan = z.infer<typeof strategicPlanSchema>;

export const teamConsciousnessAssessmentSchema = z.object({
  id: z.string(),
  teamId: z.string(),
  metrics: z.record(z.number()),
  insights: z.array(z.string()),
  timestamp: z.string(),
});

export type TeamConsciousnessAssessment = z.infer<typeof teamConsciousnessAssessmentSchema>;
export type InsertTeamConsciousnessAssessment = z.infer<typeof teamConsciousnessAssessmentSchema>;

export const leadershipDevelopmentTrackingSchema = z.object({
  id: z.string(),
  leaderId: z.string(),
  milestones: z.array(z.string()),
  progress: z.number(),
  nextSteps: z.array(z.string()),
});

export type LeadershipDevelopmentTracking = z.infer<typeof leadershipDevelopmentTrackingSchema>;
export type InsertLeadershipDevelopmentTracking = z.infer<typeof leadershipDevelopmentTrackingSchema>;

export const enterpriseAnalyticsSchema = z.object({
  id: z.string(),
  metrics: z.record(z.number()),
  trends: z.record(z.array(z.number())),
  insights: z.array(z.string()),
  timestamp: z.string(),
});

export type EnterpriseAnalytics = z.infer<typeof enterpriseAnalyticsSchema>;
export type InsertEnterpriseAnalytics = z.infer<typeof enterpriseAnalyticsSchema>;

// Smart Contract Blockchain Integration Types
// Import comprehensive blockchain types
export * from './types/blockchain';