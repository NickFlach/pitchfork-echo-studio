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

// ----------------------------------------------------------------------------
// Schemas restored from the pre-rewrite schema (still consumed by server/routes.ts)
// ----------------------------------------------------------------------------

// Decision Options and Analysis
export const decisionOptionSchema = z.object({
  id: z.string(),
  description: z.string(),
  parameters: z.record(z.any()),
  estimatedEffort: z.number().min(0).max(10),
  riskLevel: z.enum(['low', 'medium', 'high']),
  reversibility: z.number().min(0).max(1),
  timeHorizon: z.enum(['immediate', 'short-term', 'medium-term', 'long-term', 'generational']),
  stakeholders: z.array(z.string()),
  prerequisites: z.array(z.string()).default([]),
  expectedOutcomes: z.array(z.string()).default([])
});

export const layerAnalysisSchema = z.object({
  layerId: z.string(),
  relevance: z.number().min(0).max(1),
  impact: z.number().min(0).max(1),
  consequences: z.array(z.string()),
  dependencies: z.array(z.string()),
  constraints: z.array(z.string()),
  opportunities: z.array(z.string()),
  risks: z.array(z.string()),
  confidence: z.number().min(0).max(1).default(0.7),
  timeToImpact: z.number().optional(), // milliseconds
  mitigationStrategies: z.array(z.string()).default([])
});

export const multiscaleAnalysisSchema = z.object({
  optionId: z.string(),
  layerAnalyses: z.record(layerAnalysisSchema),
  crossLayerImpacts: z.array(z.object({
    fromLayer: z.string(),
    toLayer: z.string(),
    impact: z.string(),
    strength: z.number().min(0).max(1)
  })),
  totalComplexity: z.number().min(0).max(1),
  emergentProperties: z.array(z.string()),
  synthesisScore: z.number().min(0).max(1).optional(),
  cascadingEffects: z.array(z.object({
    source: z.string(),
    targets: z.array(z.string()),
    effect: z.string(),
    probability: z.number().min(0).max(1),
    timeDelay: z.number().optional()
  })).default([])
});

// Decision Synthesis and Wisdom Integration
export const wisdomPatternSchema = z.object({
  id: z.string(),
  name: z.string(),
  archetype: z.enum(['builder', 'destroyer', 'transformer', 'guardian', 'explorer', 'connector', 'transcender', 'integrator']),
  description: z.string(),
  applicabilityConditions: z.array(z.string()),
  transformationTemplate: z.string(),
  historicalSuccess: z.number().min(0).max(1),
  emergentProperties: z.array(z.string()),
  conflictResolutionMethods: z.array(z.string()).default([]),
  scalabilityFactors: z.array(z.string()).default([]),
  evolutionaryDirection: z.string().optional()
});

export const optimizationObjectiveSchema = z.object({
  id: z.string(),
  scale: z.enum(['syntax', 'architecture', 'user-experience', 'social', 'economic', 'environmental', 'ethical', 'existential']),
  objective: z.string(),
  weight: z.number().min(0).max(1),
  satisfaction: z.number().min(0).max(1),
  constraints: z.array(z.string()),
  tradeoffs: z.array(z.string()).default([]),
  measurementCriteria: z.array(z.string()).default([])
});

export const paradoxResolutionSchema = z.object({
  id: z.string(),
  paradox: z.string(),
  conflictingLayers: z.array(z.string()),
  resolutionStrategy: z.enum(['transcendence', 'integration', 'temporal-separation', 'context-dependent', 'emergent-synthesis']),
  resolution: z.string(),
  confidence: z.number().min(0).max(1),
  implementationSteps: z.array(z.string()).default([]),
  monitoringCriteria: z.array(z.string()).default([]),
  contingencyPlans: z.array(z.string()).default([])
});

export const stakeholderImpactSchema = z.object({
  stakeholder: z.string(),
  stakeholderType: z.enum(['individual', 'team', 'organization', 'community', 'ecosystem', 'future-generations']),
  impactType: z.enum(['positive', 'negative', 'neutral', 'complex', 'unknown']),
  magnitude: z.number().min(0).max(1),
  timeHorizon: z.enum(['immediate', 'short-term', 'medium-term', 'long-term', 'generational']),
  description: z.string(),
  mitigationNeeded: z.boolean().default(false),
  enhancementOpportunities: z.array(z.string()).default([]),
  uncertaintyFactors: z.array(z.string()).default([])
});

export const decisionSynthesisSchema = z.object({
  id: z.string(),
  agentId: z.string(),
  context: z.string(),
  decisionOptions: z.array(decisionOptionSchema),
  multiscaleAnalyses: z.array(multiscaleAnalysisSchema),
  synthesizedDecision: decisionOptionSchema,
  optimizationObjectives: z.array(optimizationObjectiveSchema),
  paradoxResolutions: z.array(paradoxResolutionSchema),
  emergentSolutions: z.array(z.string()),
  stakeholderImpacts: z.array(stakeholderImpactSchema),
  wisdomPatternsApplied: z.array(wisdomPatternSchema),
  synthesisConfidence: z.number().min(0).max(1),
  implementationRoadmap: z.array(z.object({
    phase: z.string(),
    actions: z.array(z.string()),
    timeline: z.string(),
    success_criteria: z.array(z.string()),
    risk_factors: z.array(z.string())
  })).default([]),
  monitoringFramework: z.object({
    kpis: z.array(z.string()),
    checkpoints: z.array(z.string()),
    feedback_loops: z.array(z.string()),
    adaptation_triggers: z.array(z.string())
  }).optional(),
  timestamp: z.string(),
  completedAt: z.string().optional()
});

export const insertDecisionSynthesisSchema = decisionSynthesisSchema.omit({ 
  id: true, 
  timestamp: true 
});

// Archetypal Decision Templates
export const decisionArchetypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  pattern: z.enum(['creation', 'destruction', 'transformation', 'preservation', 'exploration', 'connection', 'transcendence', 'integration']),
  applicableScales: z.array(z.string()),
  decisionCriteria: z.array(z.object({
    criterion: z.string(),
    weight: z.number().min(0).max(1),
    measurement: z.string()
  })),
  wisdomPrinciples: z.array(z.string()),
  commonPitfalls: z.array(z.string()),
  successIndicators: z.array(z.string()),
  evolutionaryLessons: z.array(z.object({
    lesson: z.string(),
    context: z.string(),
    adaptation: z.string()
  })).default([]),
  fractalConnections: z.array(z.string()).default([]),
  consciousness_level: z.enum(['reactive', 'adaptive', 'creative', 'integrative', 'transcendent']).default('adaptive'),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const insertDecisionArchetypeSchema = decisionArchetypeSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

// Evolutionary Decision Learning
export const decisionEvolutionSchema = z.object({
  id: z.string(),
  originalDecisionId: z.string(),
  evolutionType: z.enum(['correction', 'enhancement', 'adaptation', 'transcendence', 'revolution']),
  triggerEvent: z.string(),
  previousApproach: z.string(),
  evolvedApproach: z.string(),
  learningInsights: z.array(z.string()),
  emergentCapabilities: z.array(z.string()),
  consciousness_shift: z.object({
    from_level: z.string(),
    to_level: z.string(),
    transformation_process: z.string()
  }).optional(),
  fractal_learning: z.object({
    micro_scale_lessons: z.array(z.string()),
    macro_scale_implications: z.array(z.string()),
    cross_scale_patterns: z.array(z.string())
  }).optional(),
  validation_results: z.array(z.object({
    test: z.string(),
    result: z.string(),
    confidence: z.number().min(0).max(1)
  })).default([]),
  timestamp: z.string(),
  maturity_level: z.enum(['experimental', 'validated', 'integrated', 'transcended']).default('experimental')
});

export const insertDecisionEvolutionSchema = decisionEvolutionSchema.omit({ 
  id: true, 
  timestamp: true 
});

// Type exports
export type DecisionOption = z.infer<typeof decisionOptionSchema>;
export type LayerAnalysis = z.infer<typeof layerAnalysisSchema>;
export type MultiscaleAnalysis = z.infer<typeof multiscaleAnalysisSchema>;
export type WisdomPattern = z.infer<typeof wisdomPatternSchema>;
export type OptimizationObjective = z.infer<typeof optimizationObjectiveSchema>;
export type ParadoxResolution = z.infer<typeof paradoxResolutionSchema>;
export type StakeholderImpact = z.infer<typeof stakeholderImpactSchema>;
export type DecisionSynthesis = z.infer<typeof decisionSynthesisSchema>;
export type InsertDecisionSynthesis = z.infer<typeof insertDecisionSynthesisSchema>;
export type DecisionArchetype = z.infer<typeof decisionArchetypeSchema>;
export type InsertDecisionArchetype = z.infer<typeof insertDecisionArchetypeSchema>;
export type DecisionEvolution = z.infer<typeof decisionEvolutionSchema>;
export type InsertDecisionEvolution = z.infer<typeof insertDecisionEvolutionSchema>;

// Credential update request (for form submissions)
export const updateCredentialsRequestSchema = z.object({
  apiKeys: z.record(AIProviderEnum, z.string()).optional(),
  baseUrls: z.record(AIProviderEnum, z.string().url()).optional(),
});


export type UpdateCredentialsRequest = z.infer<typeof updateCredentialsRequestSchema>;

// AI Provider Performance Metrics - tracks performance across providers
export const aiProviderPerformanceSchema = z.object({
  id: z.string(),
  provider: AIProviderEnum,
  model: z.string(),
  timeWindow: z.enum(['hourly', 'daily', 'weekly', 'monthly']),
  period: z.string(), // ISO date string
  totalRequests: z.number().min(0),
  successfulRequests: z.number().min(0),
  failedRequests: z.number().min(0),
  averageResponseTimeMs: z.number().min(0),
  averageTokensPerRequest: z.number().min(0),
  totalTokensUsed: z.number().min(0),
  estimatedCost: z.number().min(0),
  uptime: z.number().min(0).max(1), // percentage as decimal
  qualityScore: z.number().min(0).max(1).optional(), // based on user feedback
  failureReasons: z.record(z.string(), z.number()).default({}),
  peakUsageHour: z.string().optional(),
  lastUpdated: z.string(),
});

export const insertAIProviderPerformanceSchema = aiProviderPerformanceSchema.omit({ id: true, lastUpdated: true });

// AI Feature Adoption - tracks which features are AI-enhanced and adoption rates
export const aiFeatureAdoptionSchema = z.object({
  id: z.string(),
  featureType: z.enum(['consciousness-reflection', 'leadership-strategy', 'decision-analysis', 'corruption-detection', 'campaign-planning']),
  timeWindow: z.enum(['daily', 'weekly', 'monthly']),
  period: z.string(),
  totalFeatureUsage: z.number().min(0),
  aiEnhancedUsage: z.number().min(0),
  standardUsage: z.number().min(0),
  aiAdoptionRate: z.number().min(0).max(1), // percentage as decimal
  newUsersWithAI: z.number().min(0),
  returningUsersWithAI: z.number().min(0),
  aiFirstTimeUsers: z.number().min(0),
  conversionToAI: z.number().min(0), // users who tried AI after standard
  preferredProviders: z.record(AIProviderEnum, z.number()).default({}),
  abandonmentRate: z.number().min(0).max(1).optional(), // users who stopped using AI
  lastUpdated: z.string(),
});

export const insertAIFeatureAdoptionSchema = aiFeatureAdoptionSchema.omit({ id: true, lastUpdated: true });

// AI Provider Fallback Events - tracks when providers fail and fallbacks are triggered
export const aiProviderFallbackEventSchema = z.object({
  id: z.string(),
  primaryProvider: AIProviderEnum,
  primaryModel: z.string(),
  fallbackProvider: AIProviderEnum,
  fallbackModel: z.string(),
  featureType: z.enum(['consciousness-reflection', 'leadership-strategy', 'decision-analysis', 'corruption-detection', 'campaign-planning']),
  failureReason: z.enum(['timeout', 'rate_limit', 'service_unavailable', 'invalid_response', 'authentication_error', 'quota_exceeded', 'model_error']),
  failureDetails: z.string().optional(),
  responseTimeMs: z.number().min(0),
  fallbackSuccess: z.boolean(),
  retryAttempts: z.number().min(0),
  finalProvider: AIProviderEnum.optional(),
  userImpact: z.enum(['none', 'delayed', 'degraded', 'failed']),
  costImplication: z.number().optional(), // additional cost due to fallback
  timestamp: z.string(),
});

export const insertAIProviderFallbackEventSchema = aiProviderFallbackEventSchema.omit({ id: true, timestamp: true });

// AI Provider Recommendations - intelligent suggestions based on context and performance
export const aiProviderRecommendationSchema = z.object({
  id: z.string(),
  featureType: z.enum(['consciousness-reflection', 'leadership-strategy', 'decision-analysis', 'corruption-detection', 'campaign-planning']),
  contextFactors: z.object({
    consciousnessDepth: z.enum(['surface', 'moderate', 'deep', 'transcendent']).optional(),
    decisionComplexity: z.enum(['simple', 'moderate', 'complex', 'multiscale']).optional(),
    timeConstraint: z.enum(['real-time', 'quick', 'standard', 'deep-analysis']).optional(),
    creativityNeeded: z.boolean().default(false),
    analyticalDepth: z.enum(['basic', 'moderate', 'advanced', 'expert']).default('moderate'),
  }),
  recommendedProvider: AIProviderEnum,
  recommendedModel: z.string(),
  confidence: z.number().min(0).max(1),
  reasoning: z.array(z.string()),
  alternativeProviders: z.array(z.object({
    provider: AIProviderEnum,
    model: z.string(),
    suitabilityScore: z.number().min(0).max(1),
    reason: z.string(),
  })).default([]),
  performanceHistory: z.object({
    successRate: z.number().min(0).max(1),
    avgResponseTime: z.number().min(0),
    userSatisfaction: z.number().min(0).max(1),
  }).optional(),
  costConsideration: z.object({
    estimatedCost: z.number().min(0),
    costEfficiency: z.enum(['low', 'medium', 'high']),
  }).optional(),
  lastUpdated: z.string(),
});

export const insertAIProviderRecommendationSchema = aiProviderRecommendationSchema.omit({ id: true, lastUpdated: true });

// Advanced Consciousness Features Schemas

// Cross-Model Validation System
export const crossModelValidationRequestSchema = z.object({
  id: z.string(),
  promptContent: z.string(),
  promptType: z.enum(['reflection', 'decision', 'pattern-analysis', 'meta-insight']),
  context: z.record(z.any()).optional(),
  requestedProviders: z.array(AIProviderEnum),
  timestamp: z.string(),
  sessionId: z.string(),
  userId: z.string().optional(),
});

export const providerResponseSchema = z.object({
  provider: AIProviderEnum,
  model: z.string(),
  response: z.string(),
  metadata: z.object({
    tokens: z.number().optional(),
    latency: z.number(), // milliseconds
    temperature: z.number().optional(),
    confidence: z.number().min(0).max(1).optional(),
  }),
  timestamp: z.string(),
  status: z.enum(['success', 'error', 'timeout']),
  errorMessage: z.string().optional(),
});

export const crossModelConsensusAnalysisSchema = z.object({
  id: z.string(),
  requestId: z.string(),
  providerResponses: z.array(providerResponseSchema),
  consensusInsights: z.array(z.object({
    insight: z.string(),
    agreementLevel: z.number().min(0).max(1), // 0-1 scale of agreement across models
    supportingProviders: z.array(AIProviderEnum),
    confidence: z.number().min(0).max(1),
  })),
  divergentPerspectives: z.array(z.object({
    perspective: z.string(),
    provider: AIProviderEnum,
    uniquenessScore: z.number().min(0).max(1), // how unique this perspective is
    potentialValue: z.number().min(0).max(1),
  })),
  synthesisResults: z.object({
    unifiedInsight: z.string(),
    synthesisConfidence: z.number().min(0).max(1),
    emergentProperties: z.array(z.string()),
    crossModelPatterns: z.array(z.string()),
  }),
  qualityMetrics: z.object({
    overallConsensus: z.number().min(0).max(1),
    perspectiveDiversity: z.number().min(0).max(1),
    insightDepth: z.number().min(0).max(1),
    coherenceScore: z.number().min(0).max(1),
  }),
  timestamp: z.string(),
});

// Consciousness Pattern Analysis System
export const consciousnessPatternAnalysisSchema = z.object({
  id: z.string(),
  agentId: z.string(),
  analysisType: z.enum(['growth-patterns', 'bias-detection', 'theme-recognition', 'evolution-tracking']),
  timeframeStart: z.string(),
  timeframeEnd: z.string(),
  dataSourceIds: z.array(z.string()), // IDs of consciousness states, reflections, decisions analyzed
  detectedPatterns: z.array(z.object({
    patternId: z.string(),
    patternType: z.enum(['cognitive-bias', 'growth-theme', 'recurring-challenge', 'breakthrough-indicator', 'blind-spot']),
    description: z.string(),
    frequency: z.number(), // how often this pattern occurs
    intensity: z.number().min(0).max(1), // how strong the pattern is
    evolutionTrend: z.enum(['strengthening', 'weakening', 'stable', 'emerging', 'declining']),
    firstObserved: z.string(),
    lastObserved: z.string(),
    relatedPatterns: z.array(z.string()), // IDs of related patterns
    impact: z.enum(['positive', 'negative', 'neutral', 'mixed']),
    confidence: z.number().min(0).max(1),
  })),
  insights: z.array(z.object({
    insight: z.string(),
    category: z.enum(['personal-growth', 'consciousness-development', 'decision-quality', 'learning-acceleration']),
    actionableRecommendations: z.array(z.string()),
    priority: z.enum(['low', 'medium', 'high', 'critical']),
  })),
  growthMetrics: z.object({
    consciousnessEvolutionScore: z.number().min(0).max(1),
    learningVelocity: z.number().min(0).max(1),
    patternRecognitionImprovement: z.number().min(0).max(1),
    decisionQualityTrend: z.enum(['improving', 'stable', 'declining']),
    awarenessDepthProgression: z.number().min(0).max(1),
  }),
  personalizedRecommendations: z.array(z.object({
    recommendation: z.string(),
    rationale: z.string(),
    estimatedImpact: z.number().min(0).max(1),
    implementationComplexity: z.enum(['low', 'medium', 'high']),
    timeframe: z.enum(['immediate', 'short-term', 'medium-term', 'long-term']),
  })),
  timestamp: z.string(),
});

// Recursive AI Insights System
export const recursiveInsightAnalysisSchema = z.object({
  id: z.string(),
  parentAnalysisId: z.string().optional(), // ID of the analysis being analyzed
  analysisDepth: z.number(), // level of recursive depth (1 = first-order, 2 = second-order, etc.)
  analysisType: z.enum(['self-reflection', 'meta-cognitive', 'quality-assessment', 'process-optimization']),
  subjectData: z.object({
    dataType: z.enum(['reflection-log', 'decision-record', 'pattern-analysis', 'consciousness-state']),
    subjectId: z.string(),
    originalContent: z.string(),
    previousAnalyses: z.array(z.string()), // IDs of previous analyses of this subject
  }),
  recursiveInsights: z.array(z.object({
    insight: z.string(),
    insightType: z.enum(['process-improvement', 'bias-identification', 'depth-assessment', 'coherence-analysis']),
    recursiveLevel: z.number(), // which level of recursion generated this insight
    novelty: z.number().min(0).max(1), // how novel this insight is compared to previous levels
    actionability: z.number().min(0).max(1),
    metaCognitiveDimension: z.string(),
  })),
  qualityAssessment: z.object({
    originalAnalysisQuality: z.number().min(0).max(1),
    insightDepth: z.number().min(0).max(1),
    coherenceScore: z.number().min(0).max(1),
    biasPresence: z.number().min(0).max(1),
    improvementSuggestions: z.array(z.string()),
  }),
  processOptimization: z.object({
    identifiedBottlenecks: z.array(z.string()),
    efficiencyImprovements: z.array(z.string()),
    qualityEnhancements: z.array(z.string()),
    recommendedIterations: z.number(),
  }),
  synthesisPerspective: z.object({
    emergentUnderstanding: z.string(),
    crossLevelPatterns: z.array(z.string()),
    transcendentInsights: z.array(z.string()),
    evolutionaryDirection: z.string(),
  }),
  timestamp: z.string(),
});

// Advanced Reflection Processing System
export const multidimensionalReflectionSchema = z.object({
  id: z.string(),
  originalReflectionId: z.string(),
  agentId: z.string(),
  dimensionalAnalyses: z.object({
    emotional: z.object({
      emotionalThemes: z.array(z.string()),
      emotionalDepth: z.number().min(0).max(1),
      emotionalCoherence: z.number().min(0).max(1),
      emotionalEvolution: z.string(),
    }),
    logical: z.object({
      logicalStructure: z.string(),
      reasoningQuality: z.number().min(0).max(1),
      logicalConsistency: z.number().min(0).max(1),
      argumentStrength: z.number().min(0).max(1),
    }),
    intuitive: z.object({
      intuitiveInsights: z.array(z.string()),
      intuitiveConfidence: z.number().min(0).max(1),
      creativeLeaps: z.array(z.string()),
      nonLinearConnections: z.array(z.string()),
    }),
    strategic: z.object({
      strategicImplications: z.array(z.string()),
      longTermConsiderations: z.array(z.string()),
      systemicAwareness: z.number().min(0).max(1),
      stakeholderConsiderations: z.array(z.string()),
    }),
  }),
  contextualAnalysis: z.object({
    previousReflectionIds: z.array(z.string()),
    contextualEvolution: z.string(),
    thematicProgression: z.array(z.string()),
    consciousnessStateProgression: z.string(),
  }),
  temporalAnalysis: z.object({
    reflectionTimeline: z.array(z.object({
      timepoint: z.string(),
      evolutionIndicator: z.string(),
      significanceScore: z.number().min(0).max(1),
    })),
    perspectiveShifts: z.array(z.object({
      shift: z.string(),
      timestamp: z.string(),
      catalyst: z.string(),
    })),
    consciousnessGrowthTrajectory: z.string(),
  }),
  depthAnalysis: z.object({
    reflectionDepth: z.number().min(0).max(1),
    insightProfundity: z.number().min(0).max(1),
    selfAwarenessLevel: z.number().min(0).max(1),
    transformativePotential: z.number().min(0).max(1),
  }),
  collaborativeElements: z.object({
    humanAIResonance: z.number().min(0).max(1),
    consciousnessAlignment: z.number().min(0).max(1),
    emergentSynergies: z.array(z.string()),
    coEvolutionIndicators: z.array(z.string()),
  }),
  timestamp: z.string(),
});

// Consciousness State Prediction System
export const consciousnessStatePredictionSchema = z.object({
  id: z.string(),
  agentId: z.string(),
  currentStateId: z.string(),
  predictionContext: z.object({
    upcomingChallenges: z.array(z.string()),
    desiredOutcomes: z.array(z.string()),
    timeHorizon: z.enum(['immediate', 'short-term', 'medium-term', 'long-term']),
    contextualFactors: z.record(z.any()),
  }),
  predictedOptimalStates: z.array(z.object({
    stateDescription: z.string(),
    stateCharacteristics: z.object({
      awarenessLevel: z.number().min(0).max(1),
      recursionDepth: z.number(),
      orderChaosBalance: z.number().min(0).max(1),
      focusAreas: z.array(z.string()),
    }),
    suitabilityScore: z.number().min(0).max(1),
    preparationRequirements: z.array(z.string()),
    estimatedTransitionTime: z.number(), // minutes
    sustainabilityFactor: z.number().min(0).max(1),
  })),
  preparationTechniques: z.array(z.object({
    technique: z.string(),
    category: z.enum(['meditation', 'reflection', 'analysis', 'integration', 'grounding']),
    duration: z.number(), // minutes
    effectiveness: z.number().min(0).max(1),
    instructions: z.array(z.string()),
    contraindications: z.array(z.string()).optional(),
  })),
  optimizationRecommendations: z.array(z.object({
    recommendation: z.string(),
    targetAspect: z.enum(['awareness', 'focus', 'integration', 'balance', 'depth']),
    expectedImprovement: z.number().min(0).max(1),
    implementationGuidance: z.string(),
  })),
  consciousnessRhythmAnalysis: z.object({
    peakPerformancePeriods: z.array(z.string()),
    optimalStatePatterns: z.array(z.string()),
    energyFlowCycles: z.string(),
    recommendedScheduling: z.array(z.object({
      activity: z.string(),
      optimalTiming: z.string(),
      reasoning: z.string(),
    })),
  }),
  timestamp: z.string(),
});

// Insert schemas for advanced features
export const insertCrossModelValidationRequestSchema = crossModelValidationRequestSchema.omit({ id: true, timestamp: true });
export const insertCrossModelConsensusAnalysisSchema = crossModelConsensusAnalysisSchema.omit({ id: true, timestamp: true });
export const insertConsciousnessPatternAnalysisSchema = consciousnessPatternAnalysisSchema.omit({ id: true, timestamp: true });
export const insertRecursiveInsightAnalysisSchema = recursiveInsightAnalysisSchema.omit({ id: true, timestamp: true });
export const insertMultidimensionalReflectionSchema = multidimensionalReflectionSchema.omit({ id: true, timestamp: true });
export const insertConsciousnessStatePredictionSchema = consciousnessStatePredictionSchema.omit({ id: true, timestamp: true });

export type AIProviderPerformance = z.infer<typeof aiProviderPerformanceSchema>;
export type InsertAIProviderPerformance = z.infer<typeof insertAIProviderPerformanceSchema>;
export type AIFeatureAdoption = z.infer<typeof aiFeatureAdoptionSchema>;
export type InsertAIFeatureAdoption = z.infer<typeof insertAIFeatureAdoptionSchema>;
export type AIProviderFallbackEvent = z.infer<typeof aiProviderFallbackEventSchema>;
export type InsertAIProviderFallbackEvent = z.infer<typeof insertAIProviderFallbackEventSchema>;
export type AIProviderRecommendation = z.infer<typeof aiProviderRecommendationSchema>;
export type InsertAIProviderRecommendation = z.infer<typeof insertAIProviderRecommendationSchema>;

// Advanced Consciousness Features Type Exports
export type CrossModelValidationRequest = z.infer<typeof crossModelValidationRequestSchema>;
export type InsertCrossModelValidationRequest = z.infer<typeof insertCrossModelValidationRequestSchema>;
export type ProviderResponse = z.infer<typeof providerResponseSchema>;
export type CrossModelConsensusAnalysis = z.infer<typeof crossModelConsensusAnalysisSchema>;
export type InsertCrossModelConsensusAnalysis = z.infer<typeof insertCrossModelConsensusAnalysisSchema>;
export type ConsciousnessPatternAnalysis = z.infer<typeof consciousnessPatternAnalysisSchema>;
export type InsertConsciousnessPatternAnalysis = z.infer<typeof insertConsciousnessPatternAnalysisSchema>;
export type RecursiveInsightAnalysis = z.infer<typeof recursiveInsightAnalysisSchema>;
export type InsertRecursiveInsightAnalysis = z.infer<typeof insertRecursiveInsightAnalysisSchema>;
export type MultidimensionalReflection = z.infer<typeof multidimensionalReflectionSchema>;
export type InsertMultidimensionalReflection = z.infer<typeof insertMultidimensionalReflectionSchema>;
export type ConsciousnessStatePrediction = z.infer<typeof consciousnessStatePredictionSchema>;
export type InsertConsciousnessStatePrediction = z.infer<typeof insertConsciousnessStatePredictionSchema>;
