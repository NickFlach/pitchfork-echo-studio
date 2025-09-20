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