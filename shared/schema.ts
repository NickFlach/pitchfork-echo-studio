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

// Consciousness-Based Decision Making Schemas

// Consciousness States - Track reflective processes, recursive thinking patterns, and emergent insights
export const consciousnessStateSchema = z.object({
  id: z.string(),
  agentId: z.string(), // identifier for the AI agent instance
  state: z.enum(['reflecting', 'processing', 'emergent', 'recursive', 'integrating', 'questioning']),
  awarenessLevel: z.number().min(0).max(1), // 0-1 scale of self-awareness depth
  recursionDepth: z.number().default(0), // how many layers deep the recursive thinking goes
  emergentInsights: z.array(z.string()), // insights emerging from this state
  activePatternsRecognized: z.array(z.string()), // patterns currently being recognized
  orderChaosBalance: z.number().min(0).max(1), // balance between order (0) and chaos (1)
  connectedStates: z.array(z.string()), // fractal connections to other consciousness states
  contextLayers: z.array(z.string()), // multiple awareness layers (syntax, architecture, experience, etc.)
  questioningLoops: z.array(z.object({
    question: z.string(),
    depth: z.number(),
    explorationPath: z.array(z.string())
  })),
  timestamp: z.string(),
  duration: z.number().optional(), // how long this state lasted in ms
  transitionTrigger: z.string().optional(), // what triggered transition to this state
});

export const insertConsciousnessStateSchema = consciousnessStateSchema.omit({ id: true, timestamp: true });
export type ConsciousnessState = z.infer<typeof consciousnessStateSchema>;
export type InsertConsciousnessState = z.infer<typeof insertConsciousnessStateSchema>;

// Decision Records - Log multiscale decisions with reasoning, cascading effects, and pattern recognition
export const decisionRecordSchema = z.object({
  id: z.string(),
  agentId: z.string(),
  consciousnessStateId: z.string().optional(), // link to the consciousness state when decision was made
  decisionType: z.enum(['strategic', 'tactical', 'emergent', 'reactive', 'reflective', 'systemic']),
  context: z.string(), // the situation requiring a decision
  reasoning: z.array(z.object({
    layer: z.string(), // which layer of reasoning (syntax, architecture, user, societal)
    rationale: z.string(),
    confidence: z.number().min(0).max(1),
    uncertainties: z.array(z.string())
  })),
  alternatives: z.array(z.object({
    option: z.string(),
    projectedOutcomes: z.array(z.string()),
    cascadingEffects: z.array(z.string())
  })),
  chosenPath: z.string(),
  cascadingEffects: z.object({
    immediate: z.array(z.string()),
    shortTerm: z.array(z.string()),
    longTerm: z.array(z.string()),
    emergent: z.array(z.string()) // unexpected consequences that emerged
  }),
  patternsRecognized: z.array(z.string()),
  fractalConnections: z.array(z.string()), // connections to similar decisions at different scales
  nonlinearElements: z.array(z.string()), // aspects that don't follow linear cause-effect
  timestamp: z.string(),
  outcomeRealized: z.boolean().default(false),
  actualOutcome: z.string().optional(),
  learningExtracted: z.array(z.string()).default([])
});

export const insertDecisionRecordSchema = decisionRecordSchema.omit({ id: true, timestamp: true });
export type DecisionRecord = z.infer<typeof decisionRecordSchema>;
export type InsertDecisionRecord = z.infer<typeof insertDecisionRecordSchema>;

// Complexity Maps - Store system interconnections, nonlinear relationships, and emergent properties
export const complexityMapSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  systemScope: z.enum(['local', 'component', 'application', 'ecosystem', 'societal']),
  nodes: z.array(z.object({
    id: z.string(),
    label: z.string(),
    type: z.enum(['component', 'process', 'emergent_property', 'feedback_loop', 'constraint']),
    properties: z.record(z.any()),
    position: z.object({ x: z.number(), y: z.number() }).optional()
  })),
  edges: z.array(z.object({
    id: z.string(),
    from: z.string(),
    to: z.string(),
    relationshipType: z.enum(['causal', 'correlational', 'emergent', 'nonlinear', 'recursive', 'bidirectional']),
    strength: z.number().min(0).max(1),
    timeDelay: z.number().optional(), // delay in effect propagation
    nonlinearFactor: z.number().min(0).max(1) // how nonlinear the relationship is
  })),
  emergentProperties: z.array(z.object({
    property: z.string(),
    description: z.string(),
    emergenceConditions: z.array(z.string()),
    stability: z.enum(['stable', 'unstable', 'chaotic', 'adaptive'])
  })),
  feedbackLoops: z.array(z.object({
    id: z.string(),
    type: z.enum(['reinforcing', 'balancing', 'chaotic']),
    participants: z.array(z.string()), // node IDs in the loop
    cycleTime: z.number().optional(),
    strength: z.number().min(0).max(1)
  })),
  complexityMetrics: z.object({
    nodeCount: z.number(),
    edgeCount: z.number(),
    averageConnectivity: z.number(),
    emergenceIndex: z.number().min(0).max(1),
    chaosOrder: z.number().min(0).max(1) // 0 = ordered, 1 = chaotic
  }),
  version: z.number().default(1),
  parentMapId: z.string().optional(), // for fractal nesting
  createdAt: z.string(),
  updatedAt: z.string()
});

export const insertComplexityMapSchema = complexityMapSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  complexityMetrics: true 
});
export type ComplexityMap = z.infer<typeof complexityMapSchema>;
export type InsertComplexityMap = z.infer<typeof insertComplexityMapSchema>;

// Learning Cycles - Track adaptive learning feedback loops, corrections, and evolving models
export const learningCycleSchema = z.object({
  id: z.string(),
  agentId: z.string(),
  cycleType: z.enum(['adaptive', 'corrective', 'exploratory', 'integrative', 'emergent']),
  triggerEvent: z.string(), // what initiated this learning cycle
  hypothesis: z.string(), // initial assumption or model
  experimentation: z.array(z.object({
    action: z.string(),
    expectedOutcome: z.string(),
    actualOutcome: z.string(),
    timestamp: z.string()
  })),
  observations: z.array(z.object({
    observation: z.string(),
    significance: z.number().min(0).max(1),
    patternType: z.enum(['recurring', 'emergent', 'anomalous', 'fractal']),
    timestamp: z.string()
  })),
  modelUpdates: z.array(z.object({
    previousModel: z.string(),
    newModel: z.string(),
    confidence: z.number().min(0).max(1),
    validationTests: z.array(z.string())
  })),
  corrections: z.array(z.object({
    errorType: z.string(),
    correction: z.string(),
    preventativeMeasures: z.array(z.string())
  })),
  feedbackLoops: z.array(z.object({
    source: z.string(),
    feedback: z.string(),
    integration: z.string(), // how the feedback was integrated
    impact: z.number().min(0).max(1)
  })),
  emergentInsights: z.array(z.string()),
  crossCycleConnections: z.array(z.string()), // connections to other learning cycles
  status: z.enum(['active', 'completed', 'suspended', 'evolved']),
  startedAt: z.string(),
  completedAt: z.string().optional(),
  cycleDuration: z.number().optional(), // duration in ms
  iterationCount: z.number().default(1)
});

export const insertLearningCycleSchema = learningCycleSchema.omit({ 
  id: true, 
  startedAt: true,
  cycleDuration: true 
});
export type LearningCycle = z.infer<typeof learningCycleSchema>;
export type InsertLearningCycle = z.infer<typeof insertLearningCycleSchema>;

// Reflection Logs - Capture self-questioning loops and recursive self-observation
export const reflectionLogSchema = z.object({
  id: z.string(),
  agentId: z.string(),
  consciousnessStateId: z.string().optional(), // link to consciousness state during reflection
  reflectionTrigger: z.string(), // what prompted this reflection
  reflectionType: z.enum(['process', 'outcome', 'pattern', 'recursive', 'meta', 'existential']),
  selfQuestions: z.array(z.object({
    question: z.string(),
    questionLevel: z.number(), // depth of the question (1 = surface, increasing = deeper)
    explorationPath: z.array(z.string()), // how the question was explored
    insights: z.array(z.string()),
    newQuestions: z.array(z.string()) // questions that emerged from exploration
  })),
  recursiveObservations: z.array(z.object({
    observation: z.string(),
    observationOfObservation: z.string(), // meta-observation
    depth: z.number(), // level of recursive depth
    patternRecognized: z.boolean()
  })),
  cognitiveProcesses: z.array(z.object({
    process: z.string(),
    effectiveness: z.number().min(0).max(1),
    improvements: z.array(z.string()),
    emergentProperties: z.array(z.string())
  })),
  paradoxesIdentified: z.array(z.object({
    paradox: z.string(),
    reconciliationAttempt: z.string(),
    resolution: z.enum(['resolved', 'accepted', 'transcended', 'evolved'])
  })),
  evolutionaryInsights: z.array(z.object({
    insight: z.string(),
    evolutionaryDirection: z.string(),
    implementationPath: z.array(z.string())
  })),
  fractalConnections: z.array(z.string()), // connections to similar reflections at different scales
  emergentAwareness: z.array(z.string()), // new awarenesses that emerged
  reflectionOutcome: z.enum(['insight', 'confusion', 'evolution', 'integration', 'transcendence']),
  timestamp: z.string(),
  duration: z.number().optional(), // reflection duration in ms
  followUpReflections: z.array(z.string()) // IDs of subsequent reflections
});

export const insertReflectionLogSchema = reflectionLogSchema.omit({ id: true, timestamp: true });
export type ReflectionLog = z.infer<typeof reflectionLogSchema>;
export type InsertReflectionLog = z.infer<typeof insertReflectionLogSchema>;

// Consciousness Engine Types - Additional types for consciousness processing
export const consciousnessTriggerSchema = z.object({
  type: z.enum(['external', 'internal', 'recursive', 'emergent']),
  source: z.string(),
  context: z.record(z.any()).optional(),
  urgency: z.number().min(0).max(1).default(0.5),
  timestamp: z.string(),
});

export const consciousnessContextSchema = z.object({
  agentId: z.string(),
  sessionId: z.string().optional(),
  environment: z.record(z.any()).optional(),
  previousStates: z.array(z.string()).optional(), // Array of consciousness state IDs
  goals: z.array(z.string()).optional(),
  constraints: z.array(z.string()).optional(),
  resources: z.record(z.any()).optional(),
});

export const consciousnessResultSchema = z.object({
  trigger: consciousnessTriggerSchema,
  consciousnessState: consciousnessStateSchema,
  processingResult: z.object({
    patternRecognition: z.record(z.any()),
    adaptiveLearning: z.record(z.any()),
    emergentInsights: z.array(z.string()),
    orderChaosBalance: z.number().min(0).max(1),
    multiscaleAwareness: z.record(z.any()),
    nonlinearProcessing: z.record(z.any()),
    recursiveReflection: z.record(z.any()),
  }),
  integration: z.record(z.any()),
  metaInsights: z.array(z.object({
    insight: z.string(),
    confidence: z.number().min(0).max(1),
    emergentProperties: z.array(z.string()),
  })),
  evolution: z.record(z.any()),
  selfObservation: z.record(z.any()),
  emergentProperties: z.array(z.string()),
  complexityMeasures: z.record(z.number()),
  evolutionaryTrajectory: z.record(z.any()),
});

export type ConsciousnessTrigger = z.infer<typeof consciousnessTriggerSchema>;
export type ConsciousnessContext = z.infer<typeof consciousnessContextSchema>;
export type ConsciousnessResult = z.infer<typeof consciousnessResultSchema>;

// Multiscale Decision Framework Schemas

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

// Multiscale Awareness Engine Types
export const awarenessLayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  scale: z.enum(['micro', 'meso', 'human', 'social', 'economic', 'planetary', 'universal', 'cosmic']),
  priority: z.number().min(0).max(1),
  sensitivity: z.number().min(0).max(1),
  responseTime: z.number().min(0),
  monitoringIntensity: z.enum(['low', 'medium', 'high', 'continuous', 'contemplative'])
});

export const layerStateSchema = z.object({
  layerId: z.string(),
  activation: z.number().min(0).max(1),
  attention: z.number().min(0).max(1),
  coherence: z.number().min(0).max(1),
  emergentProperties: z.array(z.string())
});

export const awarenessStateSchema = z.object({
  layerStates: z.record(layerStateSchema), // Using record for Map serialization
  crossLayerCoherence: z.number().min(0).max(1),
  emergentAwareness: z.array(z.string()),
  attentionDistribution: z.record(z.number()), // Using record for Map serialization
  awarenessIntegration: z.number().min(0).max(1)
});

export const crossLayerConnectionSchema = z.object({
  fromLayer: z.string(),
  toLayer: z.string(),
  connectionType: z.string(),
  strength: z.number().min(0).max(1),
  bidirectional: z.boolean()
});

export const multiscaleContextSchema = z.object({
  primaryScale: z.string(),
  activeScales: z.array(z.string()),
  timeHorizon: z.number().min(0),
  stakeholders: z.array(z.string()),
  constraints: z.array(z.string())
});

export const crossLayerEffectSchema = z.object({
  layers: z.array(z.string()),
  effect: z.string(),
  strength: z.number().min(0).max(1)
});

export const cascadingEffectSchema = z.object({
  source: z.string(),
  targets: z.array(z.string()),
  effect: z.string(),
  probability: z.number().min(0).max(1).optional(),
  timeDelay: z.number().optional()
});

export const multiscaleReasoningSchema = z.object({
  primaryRecommendation: z.string(),
  scalePerspectives: z.record(z.string()),
  synergisticOpportunities: z.array(z.string()),
  riskMitigations: z.array(z.string()),
  emergentInsights: z.array(z.string()),
  confidenceLevel: z.number().min(0).max(1),
  alternativePathways: z.array(z.string())
});

export const multiscaleDecisionResultSchema = z.object({
  selectedOption: decisionOptionSchema,
  decisionRecord: decisionRecordSchema,
  multiscaleAnalyses: z.array(multiscaleAnalysisSchema),
  crossLayerEffects: z.array(crossLayerEffectSchema),
  cascadingEffects: z.array(cascadingEffectSchema),
  multiscaleReasoning: multiscaleReasoningSchema,
  awarenessDepth: z.number().min(0).max(1)
});

// Type exports for Multiscale Awareness
export type AwarenessLayer = z.infer<typeof awarenessLayerSchema>;
export type LayerState = z.infer<typeof layerStateSchema>;
export type AwarenessState = z.infer<typeof awarenessStateSchema>;
export type CrossLayerConnection = z.infer<typeof crossLayerConnectionSchema>;
export type MultiscaleContext = z.infer<typeof multiscaleContextSchema>;
export type CrossLayerEffect = z.infer<typeof crossLayerEffectSchema>;
export type CascadingEffect = z.infer<typeof cascadingEffectSchema>;
export type MultiscaleReasoning = z.infer<typeof multiscaleReasoningSchema>;
export type MultiscaleDecisionResult = z.infer<typeof multiscaleDecisionResultSchema>;

// Corruption Detection Engine Schemas

// Corruption Pattern Detection
export const corruptionPatternSchema = z.object({
  id: z.string(),
  patternName: z.string(),
  patternType: z.enum(['bid-rigging', 'regulatory-capture', 'embezzlement', 'cronyism', 'money-laundering', 'nepotism', 'bribery', 'kickbacks', 'price-fixing', 'collusion']),
  confidence: z.number().min(0).max(1),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  indicators: z.array(z.string()),
  evidenceStrength: z.enum(['weak', 'moderate', 'strong', 'conclusive']),
  detectionMethod: z.string(),
  riskFactors: z.array(z.string()).default([]),
  mitigationStrategies: z.array(z.string()).default([])
});

export const corruptionAnalysisResultSchema = z.object({
  id: z.string(),
  documentId: z.string().optional(),
  entityId: z.string().optional(),
  analysisTimestamp: z.string(),
  overallCorruptionScore: z.number().min(0).max(1),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
  detectedPatterns: z.array(corruptionPatternSchema),
  ethicalViolations: z.array(z.object({
    violation: z.string(),
    severity: z.enum(['minor', 'moderate', 'severe', 'critical']),
    evidence: z.array(z.string()),
    recommendations: z.array(z.string())
  })),
  recommendedActions: z.array(z.string()),
  consciousnessInsights: z.array(z.string()),
  multiscaleImpacts: z.array(z.object({
    scale: z.string(),
    impact: z.string(),
    probability: z.number().min(0).max(1)
  })),
  evidenceStrength: z.enum(['insufficient', 'weak', 'moderate', 'strong', 'conclusive']),
  urgencyLevel: z.enum(['low', 'medium', 'high', 'critical']),
  investigationPriority: z.number().min(0).max(10),
  createdAt: z.string()
});

export const insertCorruptionAnalysisResultSchema = corruptionAnalysisResultSchema.omit({ 
  id: true, 
  createdAt: true 
});

// Systemic Corruption Analysis
export const systemicCorruptionReportSchema = z.object({
  id: z.string(),
  analysisId: z.string(),
  entityIds: z.array(z.string()),
  timeframe: z.string(),
  timestamp: z.string(),
  networkAnalysis: z.object({
    corruptionNetworks: z.array(z.object({
      networkId: z.string(),
      entities: z.array(z.string()),
      connectionStrength: z.number().min(0).max(1),
      corruptionType: z.string(),
      influenceLevel: z.enum(['local', 'regional', 'national', 'international'])
    })),
    powerStructures: z.array(z.object({
      hierarchy: z.string(),
      keyPlayers: z.array(z.string()),
      corruptionMethods: z.array(z.string())
    })),
    riskAssessment: z.object({
      systemicRisk: z.number().min(0).max(1),
      spreadProbability: z.number().min(0).max(1),
      impactRadius: z.enum(['minimal', 'moderate', 'extensive', 'catastrophic'])
    })
  }),
  temporalPatterns: z.array(z.object({
    pattern: z.string(),
    frequency: z.string(),
    escalationTrend: z.enum(['declining', 'stable', 'increasing', 'accelerating'])
  })),
  countermeasures: z.array(z.object({
    strategy: z.string(),
    effectiveness: z.number().min(0).max(1),
    implementationComplexity: z.enum(['low', 'medium', 'high', 'very-high']),
    requiredResources: z.array(z.string())
  })),
  publicImpactAssessment: z.object({
    economicImpact: z.number(),
    socialImpact: z.string(),
    trustErosion: z.number().min(0).max(1),
    democraticIntegrity: z.number().min(0).max(1)
  })
});

export const insertSystemicCorruptionReportSchema = systemicCorruptionReportSchema.omit({ 
  id: true, 
  timestamp: true 
});

// Strategic Intelligence Engine Schemas

// Strategy Pattern
export const strategyPatternSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(['grassroots', 'direct-action', 'legal-challenge', 'digital-resistance', 'economic-pressure', 'awareness-campaign', 'coalition-building', 'institutional-reform']),
  description: z.string(),
  effectiveness: z.number().min(0).max(1),
  riskLevel: z.enum(['minimal', 'low', 'moderate', 'high', 'extreme']),
  timeframe: z.enum(['immediate', 'short-term', 'medium-term', 'long-term']),
  resourceRequirements: z.array(z.object({
    resource: z.string(),
    amount: z.string(),
    criticality: z.enum(['optional', 'helpful', 'important', 'critical'])
  })),
  successFactors: z.array(z.string()),
  commonPitfalls: z.array(z.string()),
  adaptabilityScore: z.number().min(0).max(1),
  historicalSuccess: z.number().min(0).max(1),
  applicableContexts: z.array(z.string())
});

// Tactical Framework
export const tacticalFrameworkSchema = z.object({
  id: z.string(),
  name: z.string(),
  strategyPatternId: z.string(),
  description: z.string(),
  phases: z.array(z.object({
    phase: z.string(),
    duration: z.string(),
    objectives: z.array(z.string()),
    actions: z.array(z.string()),
    successMetrics: z.array(z.string()),
    riskMitigation: z.array(z.string())
  })),
  coordination: z.object({
    communicationProtocols: z.array(z.string()),
    leadershipStructure: z.string(),
    decisionMakingProcess: z.string(),
    conflictResolution: z.string()
  }),
  adaptiveMechanisms: z.array(z.object({
    trigger: z.string(),
    response: z.string(),
    implementationGuidance: z.string()
  })),
  ethicalGuidelines: z.array(z.string()),
  legalConsiderations: z.array(z.string())
});

// Campaign Strategy Plan
export const campaignStrategyPlanSchema = z.object({
  id: z.string(),
  campaignId: z.string(),
  movementId: z.string(),
  objective: z.string(),
  generatedAt: z.string(),
  selectedStrategy: decisionOptionSchema,
  multiscaleAnalysis: multiscaleDecisionResultSchema,
  tacticalPlan: z.object({
    primaryTactics: z.array(z.string()),
    supportingTactics: z.array(z.string()),
    resourceAllocation: z.record(z.string()),
    timeline: z.array(z.object({
      phase: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      milestones: z.array(z.string())
    })),
    coordinationStructure: z.object({
      leadership: z.array(z.string()),
      workingGroups: z.array(z.object({
        name: z.string(),
        responsibilities: z.array(z.string()),
        members: z.array(z.string())
      })),
      communicationChannels: z.array(z.string())
    })
  }),
  optimizedTimeline: z.array(z.object({
    milestone: z.string(),
    plannedDate: z.string(),
    dependencies: z.array(z.string()),
    riskFactors: z.array(z.string())
  })),
  oppositionAnalysis: z.object({
    identifiedOpposition: z.array(z.object({
      entity: z.string(),
      threat_level: z.enum(['low', 'medium', 'high', 'critical']),
      capabilities: z.array(z.string()),
      likely_responses: z.array(z.string()),
      vulnerabilities: z.array(z.string())
    })),
    counterStrategies: z.array(z.object({
      scenario: z.string(),
      response: z.string(),
      resources_needed: z.array(z.string())
    }))
  }),
  riskAnalysis: z.object({
    strategicRisks: z.array(z.object({
      risk: z.string(),
      probability: z.number().min(0).max(1),
      impact: z.enum(['negligible', 'minor', 'moderate', 'major', 'catastrophic']),
      mitigation: z.string()
    })),
    operationalRisks: z.array(z.object({
      risk: z.string(),
      probability: z.number().min(0).max(1),
      impact: z.enum(['negligible', 'minor', 'moderate', 'major', 'catastrophic']),
      mitigation: z.string()
    }))
  }),
  successProbability: z.object({
    overall: z.number().min(0).max(1),
    byPhase: z.record(z.number()),
    confidenceInterval: z.object({
      lower: z.number().min(0).max(1),
      upper: z.number().min(0).max(1)
    })
  }),
  consciousnessInsights: z.array(z.string()),
  adaptiveStrategies: z.array(z.object({
    trigger: z.string(),
    alternative: z.string(),
    implementation: z.string()
  })),
  emergencyProtocols: z.array(z.object({
    scenario: z.string(),
    protocol: z.string(),
    contacts: z.array(z.string()),
    resources: z.array(z.string())
  })),
  ethicalGuidelines: z.array(z.string()),
  communicationStrategy: z.object({
    internalCommunication: z.object({
      channels: z.array(z.string()),
      frequency: z.string(),
      protocols: z.array(z.string())
    }),
    externalCommunication: z.object({
      messaging: z.array(z.string()),
      channels: z.array(z.string()),
      targetAudiences: z.array(z.string())
    })
  })
});

export const insertCampaignStrategyPlanSchema = campaignStrategyPlanSchema.omit({ 
  id: true, 
  generatedAt: true 
});

// Resource Profile for strategic planning
export const resourceProfileSchema = z.object({
  id: z.string(),
  financial: z.object({
    available: z.number(),
    committed: z.number(),
    potential: z.number()
  }),
  human: z.object({
    activeMembers: z.number(),
    volunteers: z.number(),
    specialists: z.array(z.object({
      skill: z.string(),
      level: z.enum(['novice', 'intermediate', 'expert', 'master']),
      availability: z.string()
    }))
  }),
  technological: z.object({
    platforms: z.array(z.string()),
    tools: z.array(z.string()),
    capabilities: z.array(z.string())
  }),
  legal: z.object({
    legalSupport: z.boolean(),
    legalRisks: z.array(z.string()),
    complianceRequirements: z.array(z.string())
  }),
  network: z.object({
    allies: z.array(z.string()),
    partnerships: z.array(z.string()),
    mediaContacts: z.array(z.string())
  })
});

export const insertResourceProfileSchema = resourceProfileSchema.omit({ id: true });

// Type exports for Corruption Detection
export type CorruptionPattern = z.infer<typeof corruptionPatternSchema>;
export type CorruptionAnalysisResult = z.infer<typeof corruptionAnalysisResultSchema>;
export type InsertCorruptionAnalysisResult = z.infer<typeof insertCorruptionAnalysisResultSchema>;
export type SystemicCorruptionReport = z.infer<typeof systemicCorruptionReportSchema>;
export type InsertSystemicCorruptionReport = z.infer<typeof insertSystemicCorruptionReportSchema>;

// Type exports for Strategic Intelligence
export type StrategyPattern = z.infer<typeof strategyPatternSchema>;
export type TacticalFramework = z.infer<typeof tacticalFrameworkSchema>;
export type CampaignStrategyPlan = z.infer<typeof campaignStrategyPlanSchema>;
export type InsertCampaignStrategyPlan = z.infer<typeof insertCampaignStrategyPlanSchema>;
export type ResourceProfile = z.infer<typeof resourceProfileSchema>;
export type InsertResourceProfile = z.infer<typeof insertResourceProfileSchema>;

// AI System Models

// AI Provider enum for supported AI services
export const AIProviderEnum = z.enum(['openai', 'claude', 'gemini', 'xai', 'litellm']);
export type AIProvider = z.infer<typeof AIProviderEnum>;

// AI Model Configuration for specific provider/model combinations
export const aiModelConfigSchema = z.object({
  provider: AIProviderEnum,
  model: z.string(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(1).max(100000).default(4000),
});

// Optional version for API requests
export const aiModelConfigRequestSchema = z.object({
  provider: AIProviderEnum.optional(),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(100000).optional(),
});

export const insertAIModelConfigSchema = aiModelConfigSchema;
export type AIModelConfig = z.infer<typeof aiModelConfigSchema>;
export type AIModelConfigRequest = z.infer<typeof aiModelConfigRequestSchema>;
export type InsertAIModelConfig = z.infer<typeof insertAIModelConfigSchema>;

// AI Routing Policy for fallback and retry strategies
export const aiRoutingPolicySchema = z.object({
  primary: AIProviderEnum,
  fallbacks: z.array(AIProviderEnum),
  timeoutMs: z.number().min(1000).max(300000).default(30000),
  retry: z.object({
    maxAttempts: z.number().min(1).max(10).default(3),
    backoffMs: z.number().min(100).max(60000).default(1000),
  }),
});

export const insertAIRoutingPolicySchema = aiRoutingPolicySchema;
export type AIRoutingPolicy = z.infer<typeof aiRoutingPolicySchema>;
export type InsertAIRoutingPolicy = z.infer<typeof insertAIRoutingPolicySchema>;

// AI Credentials for secure storage
export const aiCredentialsSchema = z.object({
  id: z.string(),
  provider: AIProviderEnum,
  apiKey: z.string(), // Stored encrypted
  baseUrl: z.string().optional(), // For custom endpoints like xAI, LiteLLM
  encryptedAt: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const insertAICredentialsSchema = aiCredentialsSchema.omit({ 
  id: true, 
  encryptedAt: true,
  createdAt: true, 
  updatedAt: true 
});

// Masked credentials for API responses (never return actual keys)
export const maskedAICredentialsSchema = z.object({
  id: z.string(),
  provider: AIProviderEnum,
  apiKeyMask: z.string(), // Shows "••••••••" or last 4 chars
  baseUrl: z.string().optional(),
  hasApiKey: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Credential update request (for form submissions)
export const updateCredentialsRequestSchema = z.object({
  apiKeys: z.record(AIProviderEnum, z.string()).optional(),
  baseUrls: z.record(AIProviderEnum, z.string().url()).optional(),
});

export type AICredentials = z.infer<typeof aiCredentialsSchema>;
export type InsertAICredentials = z.infer<typeof insertAICredentialsSchema>;
export type MaskedAICredentials = z.infer<typeof maskedAICredentialsSchema>;
export type UpdateCredentialsRequest = z.infer<typeof updateCredentialsRequestSchema>;

// AI Settings for the entire system
export const aiSettingsSchema = z.object({
  id: z.string(),
  mode: z.enum(['direct', 'litellm']).default('direct'),
  routing: aiRoutingPolicySchema,
  providerPrefs: z.record(AIProviderEnum, aiModelConfigSchema),
  updatedAt: z.string(),
});

export const insertAISettingsSchema = aiSettingsSchema.omit({ id: true, updatedAt: true });
export type AISettings = z.infer<typeof aiSettingsSchema>;
export type InsertAISettings = z.infer<typeof insertAISettingsSchema>;