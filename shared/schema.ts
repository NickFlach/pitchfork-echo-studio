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
export const AIProviderEnum = z.enum(['openai', 'claude', 'gemini', 'xai', 'litellm', 'lovable']);
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
  id: z.string().optional(),
  timestamp: z.string().optional(),
  aiProvider: AIProviderEnum.optional(),
  model: z.string().optional(),
  featureType: z.string().optional(),
  success: z.boolean().optional(),
  responseTimeMs: z.number().optional(),
  totalTokens: z.number().optional(),
  inputTokens: z.number().optional(),
  outputTokens: z.number().optional(),
  error: z.string().optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  modelUsed: z.string().optional(),
  requestType: z.string().optional(),
  promptTokens: z.number().optional(),
  completionTokens: z.number().optional(),
  userContext: z.record(z.any()).optional(),
});

export type AIUsageAnalytics = z.infer<typeof aiUsageAnalyticsSchema>;
export type InsertAIUsageAnalytics = z.infer<typeof aiUsageAnalyticsSchema>;

export const aiUserFeedbackSchema = z.object({
  id: z.string().optional(),
  userId: z.string().optional(),
  feedback: z.record(z.any()).optional(),
  rating: z.number().min(1).max(5).optional(),
  createdAt: z.string().optional(),
  sessionId: z.string().optional(),
  featureType: z.string().optional(),
  aiProvider: AIProviderEnum.optional(),
  modelUsed: z.string().optional(),
  requestId: z.string().optional(),
  qualityRating: z.number().optional(),
});

export type AIUserFeedback = z.infer<typeof aiUserFeedbackSchema>;
export type InsertAIUserFeedback = z.infer<typeof aiUserFeedbackSchema>;

export const maskedAICredentialsSchema = z.object({
  provider: AIProviderEnum.optional(),
  hasCredentials: z.boolean().optional(),
  lastUsed: z.string().optional(),
  hasApiKey: z.boolean().optional(),
});

export type MaskedAICredentials = z.infer<typeof maskedAICredentialsSchema>;

export const consciousnessStateSchema = z.object({
  id: z.string().optional(),
  timestamp: z.string().optional(),
  level: z.number().optional(),
  dimensions: z.record(z.number()).optional(),
  metadata: z.record(z.any()).optional(),
  state: z.string().optional(),
  awarenessLevel: z.number().optional(),
  recursionDepth: z.number().optional(),
  orderChaosBalance: z.number().optional(),
  emergentInsights: z.array(z.string()).optional(),
  activePatternsRecognized: z.array(z.string()).optional(),
  contextLayers: z.array(z.string()).optional(),
  questioningLoops: z.array(z.record(z.any())).optional(),
});

export type ConsciousnessState = z.infer<typeof consciousnessStateSchema>;
export type InsertConsciousnessState = z.infer<typeof consciousnessStateSchema>;

export const decisionRecordSchema = z.object({
  id: z.string().optional(),
  timestamp: z.string().optional(),
  context: z.string().optional(),
  decision: z.string().optional(),
  outcome: z.string().optional(),
  confidence: z.number().optional(),
  decisionType: z.string().optional(),
  chosenPath: z.string().optional(),
  reasoning: z.array(z.object({
    layer: z.string().optional(),
    confidence: z.number().optional(),
    rationale: z.string().optional(),
    uncertainties: z.array(z.string()).optional(),
  })).optional(),
  alternatives: z.array(z.record(z.any())).optional(),
  outcomeRealized: z.boolean().optional(),
  actualOutcome: z.string().optional(),
  patternsRecognized: z.array(z.string()).optional(),
  cascadingEffects: z.object({
    immediate: z.array(z.string()).optional(),
    shortTerm: z.array(z.string()).optional(),
    longTerm: z.array(z.string()).optional(),
    emergent: z.array(z.string()).optional(),
  }).optional(),
});

export type DecisionRecord = z.infer<typeof decisionRecordSchema>;
export type InsertDecisionRecord = z.infer<typeof decisionRecordSchema>;

export const reflectionLogSchema = z.object({
  id: z.string().optional(),
  timestamp: z.string().optional(),
  trigger: z.string().optional(),
  reflection: z.string().optional(),
  insights: z.array(z.string()).optional(),
  reflectionType: z.string().optional(),
  reflectionTrigger: z.string().optional(),
  reflectionOutcome: z.string().optional(),
  emergentAwareness: z.array(z.string()).optional(),
  recursiveObservations: z.array(z.record(z.any())).optional(),
  selfQuestions: z.array(z.object({
    question: z.string().optional(),
    questionLevel: z.string().optional(),
    explorationPath: z.array(z.string()).optional(),
    insights: z.array(z.string()).optional(),
    newQuestions: z.array(z.string()).optional(),
  })).optional(),
  evolutionaryInsights: z.array(z.object({
    insight: z.string().optional(),
    evolutionaryDirection: z.string().optional(),
    implementationPath: z.array(z.string()).optional(),
  })).optional(),
  paradoxesIdentified: z.array(z.object({
    paradox: z.string().optional(),
    resolution: z.string().optional(),
    reconciliationAttempt: z.string().optional(),
  })).optional(),
  duration: z.number().optional(),
});

export type ReflectionLog = z.infer<typeof reflectionLogSchema>;
export type InsertReflectionLog = z.infer<typeof reflectionLogSchema>;

export const learningCycleSchema = z.object({
  id: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  phase: z.string().optional(),
  progress: z.number().optional(),
  learnings: z.array(z.object({
    patternType: z.string().optional(),
    significance: z.number().optional(),
    observation: z.string().optional(),
  })).optional(),
  status: z.string().optional(),
  experimentation: z.array(z.record(z.any())).optional(),
  observations: z.array(z.string()).optional(),
  cycleType: z.string().optional(),
  corrections: z.array(z.record(z.any())).optional(),
  emergentInsights: z.array(z.string()).optional(),
  iterationCount: z.number().optional(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  triggerEvent: z.string().optional(),
  hypothesis: z.string().optional(),
  modelUpdates: z.array(z.record(z.any())).optional(),
  feedbackLoops: z.array(z.record(z.any())).optional(),
  crossCycleConnections: z.array(z.record(z.any())).optional(),
});

export type LearningCycle = z.infer<typeof learningCycleSchema>;
export type InsertLearningCycle = z.infer<typeof learningCycleSchema>;

export const complexityMapSchema = z.object({
  id: z.string().optional(),
  timestamp: z.string().optional(),
  nodes: z.array(z.object({
    id: z.string().optional(),
    type: z.string().optional(),
    label: z.string().optional(),
    position: z.any().optional(),
    properties: z.record(z.any()).optional(),
  })).optional(),
  connections: z.array(z.record(z.any())).optional(),
  metrics: z.record(z.any()).optional(),
  edges: z.array(z.record(z.any())).optional(),
  name: z.string().optional(),
  complexityMetrics: z.record(z.any()).optional(),
  emergentProperties: z.array(z.object({
    property: z.string().optional(),
    stability: z.number().optional(),
    description: z.string().optional(),
  })).optional(),
  systemScope: z.string().optional(),
  version: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type ComplexityMap = z.infer<typeof complexityMapSchema>;
export type InsertComplexityMap = z.infer<typeof complexityMapSchema>;

export const messageSchema = z.object({
  id: z.string().optional(),
  conversationId: z.string().optional(),
  role: z.enum(['user', 'assistant']).optional(),
  content: z.string().optional(),
  timestamp: z.string().optional(),
  senderAddress: z.string().optional(),
  encryptedContent: z.string().optional(),
  isDeleted: z.boolean().optional(),
  contentHash: z.string().optional(),
  messageType: z.string().optional(),
});

export type Message = z.infer<typeof messageSchema>;
export type InsertMessage = z.infer<typeof messageSchema>;

export const conversationSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  userId: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  lastActivity: z.string().optional(),
  participants: z.array(z.string()).optional(),
  isArchived: z.boolean().optional(),
  name: z.string().optional(),
  encryptionKey: z.string().optional(),
  conversationType: z.string().optional(),
});

export type Conversation = z.infer<typeof conversationSchema>;
export type InsertConversation = z.infer<typeof conversationSchema>;

export const proposalSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  proposer: z.string().optional(),
  status: z.enum(['active', 'passed', 'rejected', 'draft']).optional(),
  createdAt: z.string().optional(),
  votingStartsAt: z.string().optional(),
  votingEndsAt: z.string().optional(),
  totalVotes: z.number().optional(),
  forVotes: z.number().optional(),
  againstVotes: z.number().optional(),
  movementId: z.string().optional(),
  updatedAt: z.string().optional(),
  yesVotes: z.number().optional(),
  noVotes: z.number().optional(),
  abstainVotes: z.number().optional(),
  quorumRequired: z.number().optional(),
  passingThreshold: z.number().optional(),
  proposalType: z.string().optional(),
});

export type Proposal = z.infer<typeof proposalSchema>;
export type InsertProposal = z.infer<typeof proposalSchema>;

export const voteSchema = z.object({
  id: z.string().optional(),
  proposalId: z.string().optional(),
  voter: z.string().optional(),
  choice: z.enum(['for', 'against', 'abstain']).optional(),
  timestamp: z.string().optional(),
  voterAddress: z.string().optional(),
  signature: z.string().optional(),
  voteChoice: z.string().optional(),
  votingPower: z.number().optional(),
  reason: z.string().optional(),
});

export type Vote = z.infer<typeof voteSchema>;
export type InsertVote = z.infer<typeof voteSchema>;

export const governanceConfigSchema = z.object({
  id: z.string().optional(),
  votingPeriod: z.number().optional(),
  quorum: z.number().optional(),
  proposalThreshold: z.number().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  isActive: z.boolean().optional(),
  movementId: z.string().optional(),
});

export type GovernanceConfig = z.infer<typeof governanceConfigSchema>;
export type InsertGovernanceConfig = z.infer<typeof governanceConfigSchema>;

// Corruption Analysis Models
export const corruptionAnalysisResultSchema = z.object({
  id: z.string().optional(),
  target: z.string().optional(),
  score: z.number().optional(),
  indicators: z.array(z.string()).optional(),
  recommendations: z.array(z.string()).optional(),
  timestamp: z.string().optional(),
  documentId: z.string().optional(),
  entityId: z.string().optional(),
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