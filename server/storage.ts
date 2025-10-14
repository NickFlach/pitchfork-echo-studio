import { 
  Identity, 
  InsertIdentity, 
  Movement, 
  InsertMovement, 
  Document, 
  InsertDocument, 
  Campaign, 
  InsertCampaign, 
  Donation, 
  InsertDonation,
  Membership,
  InsertMembership,
  ConsciousnessState,
  InsertConsciousnessState,
  DecisionRecord,
  InsertDecisionRecord,
  ComplexityMap,
  InsertComplexityMap,
  LearningCycle,
  InsertLearningCycle,
  ReflectionLog,
  InsertReflectionLog,
  DecisionSynthesis,
  InsertDecisionSynthesis,
  DecisionArchetype,
  InsertDecisionArchetype,
  DecisionEvolution,
  InsertDecisionEvolution,
  CorruptionAnalysisResult,
  InsertCorruptionAnalysisResult,
  SystemicCorruptionReport,
  InsertSystemicCorruptionReport,
  CampaignStrategyPlan,
  InsertCampaignStrategyPlan,
  StrategyPattern,
  TacticalFramework,
  ResourceProfile,
  InsertResourceProfile,
  AISettings,
  InsertAISettings,
  AICredentials,
  InsertAICredentials,
  MaskedAICredentials,
  AIProvider,
  AIUsageAnalytics,
  InsertAIUsageAnalytics,
  AIProviderPerformance,
  InsertAIProviderPerformance,
  AIUserFeedback,
  InsertAIUserFeedback,
  AIFeatureAdoption,
  InsertAIFeatureAdoption,
  AIProviderFallbackEvent,
  InsertAIProviderFallbackEvent,
  AIProviderRecommendation,
  InsertAIProviderRecommendation,
  CrossModelValidationRequest,
  InsertCrossModelValidationRequest,
  CrossModelConsensusAnalysis,
  InsertCrossModelConsensusAnalysis,
  ConsciousnessPatternAnalysis,
  InsertConsciousnessPatternAnalysis,
  RecursiveInsightAnalysis,
  InsertRecursiveInsightAnalysis,
  MultidimensionalReflection,
  InsertMultidimensionalReflection,
  ConsciousnessStatePrediction,
  InsertConsciousnessStatePrediction,
  ExecutiveAssessment,
  InsertExecutiveAssessment,
  StrategicPlan,
  InsertStrategicPlan,
  TeamConsciousnessAssessment,
  InsertTeamConsciousnessAssessment,
  LeadershipDevelopmentTracking,
  InsertLeadershipDevelopmentTracking,
  EnterpriseAnalytics,
  InsertEnterpriseAnalytics
} from '../shared/schema';
import * as crypto from 'crypto';

export interface IStorage {
  // Identity operations
  createIdentity(identity: InsertIdentity): Promise<Identity>;
  getIdentityByWallet(walletAddress: string): Promise<Identity | null>;
  updateIdentity(walletAddress: string, updates: Partial<Identity>): Promise<Identity>;
  
  // Movement operations
  createMovement(movement: InsertMovement): Promise<Movement>;
  getMovements(): Promise<Movement[]>;
  getMovement(id: string): Promise<Movement | null>;
  updateMovement(id: string, updates: Partial<Movement>): Promise<Movement>;
  
  // Document operations
  createDocument(document: InsertDocument): Promise<Document>;
  getDocuments(): Promise<Document[]>;
  getDocument(id: string): Promise<Document | null>;
  updateDocument(id: string, updates: Partial<Document>): Promise<Document>;
  
  // Campaign operations
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  getCampaigns(): Promise<Campaign[]>;
  getCampaign(id: string): Promise<Campaign | null>;
  updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign>;
  
  // Donation operations
  createDonation(donation: InsertDonation): Promise<Donation>;
  getDonationsByCampaign(campaignId: string): Promise<Donation[]>;
  
  // Membership operations
  createMembership(membership: InsertMembership): Promise<Membership>;
  getMembershipsByMovement(movementId: string): Promise<Membership[]>;
  getMembershipsByWallet(walletAddress: string): Promise<Membership[]>;
  
  // Consciousness operations
  createConsciousnessState(state: InsertConsciousnessState): Promise<ConsciousnessState>;
  getConsciousnessStates(agentId: string): Promise<ConsciousnessState[]>;
  getConsciousnessState(id: string): Promise<ConsciousnessState | null>;
  updateConsciousnessState(id: string, updates: Partial<ConsciousnessState>): Promise<ConsciousnessState>;
  
  // Decision Record operations
  createDecisionRecord(decision: InsertDecisionRecord): Promise<DecisionRecord>;
  getDecisionRecords(agentId: string): Promise<DecisionRecord[]>;
  getDecisionRecord(id: string): Promise<DecisionRecord | null>;
  updateDecisionRecord(id: string, updates: Partial<DecisionRecord>): Promise<DecisionRecord>;
  
  // Complexity Map operations
  createComplexityMap(map: InsertComplexityMap): Promise<ComplexityMap>;
  getComplexityMaps(): Promise<ComplexityMap[]>;
  getComplexityMap(id: string): Promise<ComplexityMap | null>;
  updateComplexityMap(id: string, updates: Partial<ComplexityMap>): Promise<ComplexityMap>;
  
  // Learning Cycle operations
  createLearningCycle(cycle: InsertLearningCycle): Promise<LearningCycle>;
  getLearningCycles(agentId: string): Promise<LearningCycle[]>;
  getLearningCycle(id: string): Promise<LearningCycle | null>;
  updateLearningCycle(id: string, updates: Partial<LearningCycle>): Promise<LearningCycle>;
  
  // Reflection Log operations
  createReflectionLog(reflection: InsertReflectionLog): Promise<ReflectionLog>;
  getReflectionLogs(agentId: string): Promise<ReflectionLog[]>;
  getReflectionLog(id: string): Promise<ReflectionLog | null>;
  updateReflectionLog(id: string, updates: Partial<ReflectionLog>): Promise<ReflectionLog>;
  
  // Decision Synthesis operations
  createDecisionSynthesis(synthesis: InsertDecisionSynthesis): Promise<DecisionSynthesis>;
  getDecisionSyntheses(agentId: string): Promise<DecisionSynthesis[]>;
  getDecisionSynthesis(id: string): Promise<DecisionSynthesis | null>;
  updateDecisionSynthesis(id: string, updates: Partial<DecisionSynthesis>): Promise<DecisionSynthesis>;
  
  // Decision Archetype operations
  createDecisionArchetype(archetype: InsertDecisionArchetype): Promise<DecisionArchetype>;
  getDecisionArchetypes(): Promise<DecisionArchetype[]>;
  getDecisionArchetype(id: string): Promise<DecisionArchetype | null>;
  updateDecisionArchetype(id: string, updates: Partial<DecisionArchetype>): Promise<DecisionArchetype>;
  
  // Decision Evolution operations
  createDecisionEvolution(evolution: InsertDecisionEvolution): Promise<DecisionEvolution>;
  getDecisionEvolutions(originalDecisionId: string): Promise<DecisionEvolution[]>;
  getDecisionEvolution(id: string): Promise<DecisionEvolution | null>;
  updateDecisionEvolution(id: string, updates: Partial<DecisionEvolution>): Promise<DecisionEvolution>;
  
  // Corruption Analysis operations
  createCorruptionAnalysisResult(result: InsertCorruptionAnalysisResult): Promise<CorruptionAnalysisResult>;
  getCorruptionAnalysisResults(): Promise<CorruptionAnalysisResult[]>;
  getCorruptionAnalysisResult(id: string): Promise<CorruptionAnalysisResult | null>;
  getCorruptionAnalysisResultsByDocument(documentId: string): Promise<CorruptionAnalysisResult[]>;
  getCorruptionAnalysisResultsByEntity(entityId: string): Promise<CorruptionAnalysisResult[]>;
  updateCorruptionAnalysisResult(id: string, updates: Partial<CorruptionAnalysisResult>): Promise<CorruptionAnalysisResult>;
  
  // Systemic Corruption Report operations
  createSystemicCorruptionReport(report: InsertSystemicCorruptionReport): Promise<SystemicCorruptionReport>;
  getSystemicCorruptionReports(): Promise<SystemicCorruptionReport[]>;
  getSystemicCorruptionReport(id: string): Promise<SystemicCorruptionReport | null>;
  updateSystemicCorruptionReport(id: string, updates: Partial<SystemicCorruptionReport>): Promise<SystemicCorruptionReport>;
  
  // Campaign Strategy Plan operations
  createCampaignStrategyPlan(plan: InsertCampaignStrategyPlan): Promise<CampaignStrategyPlan>;
  getCampaignStrategyPlans(): Promise<CampaignStrategyPlan[]>;
  getCampaignStrategyPlan(id: string): Promise<CampaignStrategyPlan | null>;
  getCampaignStrategyPlansByMovement(movementId: string): Promise<CampaignStrategyPlan[]>;
  getCampaignStrategyPlansByCampaign(campaignId: string): Promise<CampaignStrategyPlan[]>;
  updateCampaignStrategyPlan(id: string, updates: Partial<CampaignStrategyPlan>): Promise<CampaignStrategyPlan>;
  
  // Strategy Pattern operations
  createStrategyPattern(pattern: StrategyPattern): Promise<StrategyPattern>;
  getStrategyPatterns(): Promise<StrategyPattern[]>;
  getStrategyPattern(id: string): Promise<StrategyPattern | null>;
  updateStrategyPattern(id: string, updates: Partial<StrategyPattern>): Promise<StrategyPattern>;
  
  // Tactical Framework operations
  createTacticalFramework(framework: TacticalFramework): Promise<TacticalFramework>;
  getTacticalFrameworks(): Promise<TacticalFramework[]>;
  getTacticalFramework(id: string): Promise<TacticalFramework | null>;
  getTacticalFrameworksByStrategy(strategyPatternId: string): Promise<TacticalFramework[]>;
  updateTacticalFramework(id: string, updates: Partial<TacticalFramework>): Promise<TacticalFramework>;
  
  // Resource Profile operations
  createResourceProfile(profile: InsertResourceProfile): Promise<ResourceProfile>;
  getResourceProfiles(): Promise<ResourceProfile[]>;
  getResourceProfile(id: string): Promise<ResourceProfile | null>;
  updateResourceProfile(id: string, updates: Partial<ResourceProfile>): Promise<ResourceProfile>;
  
  // AI Settings operations
  getAISettings(): Promise<AISettings | null>;
  updateAISettings(settings: InsertAISettings): Promise<AISettings>;
  
  // AI Credentials operations (secure)
  createOrUpdateAICredentials(provider: AIProvider, apiKey: string, baseUrl?: string): Promise<AICredentials>;
  getAICredentials(provider: AIProvider): Promise<AICredentials | null>;
  getAllAICredentials(): Promise<AICredentials[]>;
  getMaskedAICredentials(): Promise<MaskedAICredentials[]>;
  deleteAICredentials(provider: AIProvider): Promise<boolean>;
  hasAICredentials(provider: AIProvider): Promise<boolean>;
  
  // AI Analytics operations
  createAIUsageAnalytics(analytics: InsertAIUsageAnalytics): Promise<AIUsageAnalytics>;
  getAIUsageAnalytics(timeframe?: string, featureType?: string): Promise<AIUsageAnalytics[]>;
  getAIUsageAnalyticsById(id: string): Promise<AIUsageAnalytics | null>;
  
  createAIProviderPerformance(performance: InsertAIProviderPerformance): Promise<AIProviderPerformance>;
  getAIProviderPerformance(provider?: AIProvider, timeWindow?: string): Promise<AIProviderPerformance[]>;
  getAIProviderPerformanceById(id: string): Promise<AIProviderPerformance | null>;
  
  createAIUserFeedback(feedback: InsertAIUserFeedback): Promise<AIUserFeedback>;
  getAIUserFeedback(featureType?: string, rating?: string): Promise<AIUserFeedback[]>;
  getAIUserFeedbackById(id: string): Promise<AIUserFeedback | null>;
  getAIUserFeedbackByRequestId(requestId: string): Promise<AIUserFeedback | null>;
  
  createAIFeatureAdoption(adoption: InsertAIFeatureAdoption): Promise<AIFeatureAdoption>;
  getAIFeatureAdoption(featureType?: string, timeWindow?: string): Promise<AIFeatureAdoption[]>;
  getAIFeatureAdoptionById(id: string): Promise<AIFeatureAdoption | null>;
  
  createAIProviderFallbackEvent(event: InsertAIProviderFallbackEvent): Promise<AIProviderFallbackEvent>;
  getAIProviderFallbackEvents(provider?: AIProvider, failureReason?: string): Promise<AIProviderFallbackEvent[]>;
  getAIProviderFallbackEventById(id: string): Promise<AIProviderFallbackEvent | null>;
  
  createAIProviderRecommendation(recommendation: InsertAIProviderRecommendation): Promise<AIProviderRecommendation>;
  getAIProviderRecommendations(featureType?: string): Promise<AIProviderRecommendation[]>;
  getAIProviderRecommendationById(id: string): Promise<AIProviderRecommendation | null>;

  // Advanced Consciousness Features operations

  // Cross-Model Validation operations
  createCrossModelValidationRequest(request: InsertCrossModelValidationRequest): Promise<CrossModelValidationRequest>;
  getCrossModelValidationRequests(): Promise<CrossModelValidationRequest[]>;
  getCrossModelValidationRequest(id: string): Promise<CrossModelValidationRequest | null>;
  getCrossModelValidationRequestsBySession(sessionId: string): Promise<CrossModelValidationRequest[]>;
  
  createCrossModelConsensusAnalysis(analysis: InsertCrossModelConsensusAnalysis): Promise<CrossModelConsensusAnalysis>;
  getCrossModelConsensusAnalyses(): Promise<CrossModelConsensusAnalysis[]>;
  getCrossModelConsensusAnalysis(id: string): Promise<CrossModelConsensusAnalysis | null>;
  getCrossModelConsensusAnalysesByRequest(requestId: string): Promise<CrossModelConsensusAnalysis[]>;
  
  // Consciousness Pattern Analysis operations
  createConsciousnessPatternAnalysis(analysis: InsertConsciousnessPatternAnalysis): Promise<ConsciousnessPatternAnalysis>;
  getConsciousnessPatternAnalyses(): Promise<ConsciousnessPatternAnalysis[]>;
  getConsciousnessPatternAnalysis(id: string): Promise<ConsciousnessPatternAnalysis | null>;
  getConsciousnessPatternAnalysesByAgent(agentId: string): Promise<ConsciousnessPatternAnalysis[]>;
  getConsciousnessPatternAnalysesByType(analysisType: string): Promise<ConsciousnessPatternAnalysis[]>;
  
  // Recursive Insight Analysis operations
  createRecursiveInsightAnalysis(analysis: InsertRecursiveInsightAnalysis): Promise<RecursiveInsightAnalysis>;
  getRecursiveInsightAnalyses(): Promise<RecursiveInsightAnalysis[]>;
  getRecursiveInsightAnalysis(id: string): Promise<RecursiveInsightAnalysis | null>;
  getRecursiveInsightAnalysesByParent(parentAnalysisId: string): Promise<RecursiveInsightAnalysis[]>;
  getRecursiveInsightAnalysesBySubject(subjectId: string): Promise<RecursiveInsightAnalysis[]>;
  
  // Multidimensional Reflection operations
  createMultidimensionalReflection(reflection: InsertMultidimensionalReflection): Promise<MultidimensionalReflection>;
  getMultidimensionalReflections(): Promise<MultidimensionalReflection[]>;
  getMultidimensionalReflection(id: string): Promise<MultidimensionalReflection | null>;
  getMultidimensionalReflectionsByAgent(agentId: string): Promise<MultidimensionalReflection[]>;
  getMultidimensionalReflectionsByOriginal(originalReflectionId: string): Promise<MultidimensionalReflection[]>;
  
  // Consciousness State Prediction operations
  createConsciousnessStatePrediction(prediction: InsertConsciousnessStatePrediction): Promise<ConsciousnessStatePrediction>;
  getConsciousnessStatePredictions(): Promise<ConsciousnessStatePrediction[]>;
  getConsciousnessStatePrediction(id: string): Promise<ConsciousnessStatePrediction | null>;
  getConsciousnessStatePredictionsByAgent(agentId: string): Promise<ConsciousnessStatePrediction[]>;
  getConsciousnessStatePredictionsByCurrentState(currentStateId: string): Promise<ConsciousnessStatePrediction[]>;

  // Enterprise Leadership Tools operations

  // Executive Assessment operations
  createExecutiveAssessment(assessment: InsertExecutiveAssessment): Promise<ExecutiveAssessment>;
  getExecutiveAssessments(): Promise<ExecutiveAssessment[]>;
  getExecutiveAssessment(id: string): Promise<ExecutiveAssessment | null>;
  getExecutiveAssessmentsByOrganization(organizationId: string): Promise<ExecutiveAssessment[]>;
  getExecutiveAssessmentsByExecutive(executiveId: string): Promise<ExecutiveAssessment[]>;
  updateExecutiveAssessment(id: string, updates: Partial<ExecutiveAssessment>): Promise<ExecutiveAssessment>;

  // Strategic Plan operations
  createStrategicPlan(plan: InsertStrategicPlan): Promise<StrategicPlan>;
  getStrategicPlans(): Promise<StrategicPlan[]>;
  getStrategicPlan(id: string): Promise<StrategicPlan | null>;
  getStrategicPlansByOrganization(organizationId: string): Promise<StrategicPlan[]>;
  updateStrategicPlan(id: string, updates: Partial<StrategicPlan>): Promise<StrategicPlan>;

  // Team Consciousness Assessment operations
  createTeamConsciousnessAssessment(assessment: InsertTeamConsciousnessAssessment): Promise<TeamConsciousnessAssessment>;
  getTeamConsciousnessAssessments(): Promise<TeamConsciousnessAssessment[]>;
  getTeamConsciousnessAssessment(id: string): Promise<TeamConsciousnessAssessment | null>;
  getTeamConsciousnessAssessmentsByOrganization(organizationId: string): Promise<TeamConsciousnessAssessment[]>;
  getTeamConsciousnessAssessmentsByTeam(teamId: string): Promise<TeamConsciousnessAssessment[]>;
  updateTeamConsciousnessAssessment(id: string, updates: Partial<TeamConsciousnessAssessment>): Promise<TeamConsciousnessAssessment>;

  // Leadership Development Tracking operations
  createLeadershipDevelopmentTracking(tracking: InsertLeadershipDevelopmentTracking): Promise<LeadershipDevelopmentTracking>;
  getLeadershipDevelopmentTrackings(): Promise<LeadershipDevelopmentTracking[]>;
  getLeadershipDevelopmentTracking(id: string): Promise<LeadershipDevelopmentTracking | null>;
  getLeadershipDevelopmentTrackingsByOrganization(organizationId: string): Promise<LeadershipDevelopmentTracking[]>;
  getLeadershipDevelopmentTrackingsByExecutive(executiveId: string): Promise<LeadershipDevelopmentTracking[]>;
  updateLeadershipDevelopmentTracking(id: string, updates: Partial<LeadershipDevelopmentTracking>): Promise<LeadershipDevelopmentTracking>;

  // Enterprise Analytics operations
  createEnterpriseAnalytics(analytics: InsertEnterpriseAnalytics): Promise<EnterpriseAnalytics>;
  getEnterpriseAnalytics(): Promise<EnterpriseAnalytics[]>;
  getEnterpriseAnalytic(id: string): Promise<EnterpriseAnalytics | null>;
  getEnterpriseAnalyticsByOrganization(organizationId: string): Promise<EnterpriseAnalytics[]>;
  updateEnterpriseAnalytics(id: string, updates: Partial<EnterpriseAnalytics>): Promise<EnterpriseAnalytics>;
}

export class MemStorage implements IStorage {
  private identities: Identity[] = [];
  private movements: Movement[] = [];
  private documents: Document[] = [];
  private campaigns: Campaign[] = [];
  private donations: Donation[] = [];
  private memberships: Membership[] = [];
  private consciousnessStates: ConsciousnessState[] = [];
  private decisionRecords: DecisionRecord[] = [];
  private complexityMaps: ComplexityMap[] = [];
  private learningCycles: LearningCycle[] = [];
  private reflectionLogs: ReflectionLog[] = [];
  private decisionSyntheses: DecisionSynthesis[] = [];
  private decisionArchetypes: DecisionArchetype[] = [];
  private decisionEvolutions: DecisionEvolution[] = [];
  private corruptionAnalysisResults: CorruptionAnalysisResult[] = [];
  private systemicCorruptionReports: SystemicCorruptionReport[] = [];
  private campaignStrategyPlans: CampaignStrategyPlan[] = [];
  private strategyPatterns: StrategyPattern[] = [];
  private tacticalFrameworks: TacticalFramework[] = [];
  private resourceProfiles: ResourceProfile[] = [];
  private aiSettings: AISettings | null = null;
  private aiCredentials: AICredentials[] = [];
  private aiUsageAnalytics: AIUsageAnalytics[] = [];
  private aiProviderPerformance: AIProviderPerformance[] = [];
  private aiUserFeedback: AIUserFeedback[] = [];
  private aiFeatureAdoption: AIFeatureAdoption[] = [];
  private aiProviderFallbackEvents: AIProviderFallbackEvent[] = [];
  private aiProviderRecommendations: AIProviderRecommendation[] = [];
  
  // Advanced Consciousness Features storage
  private crossModelValidationRequests: CrossModelValidationRequest[] = [];
  private crossModelConsensusAnalyses: CrossModelConsensusAnalysis[] = [];
  private consciousnessPatternAnalyses: ConsciousnessPatternAnalysis[] = [];
  private recursiveInsightAnalyses: RecursiveInsightAnalysis[] = [];
  private multidimensionalReflections: MultidimensionalReflection[] = [];
  private consciousnessStatePredictions: ConsciousnessStatePrediction[] = [];
  
  // Enterprise Leadership Tools storage
  private executiveAssessments: ExecutiveAssessment[] = [];
  private strategicPlans: StrategicPlan[] = [];
  private teamConsciousnessAssessments: TeamConsciousnessAssessment[] = [];
  private leadershipDevelopmentTrackings: LeadershipDevelopmentTracking[] = [];
  private enterpriseAnalytics: EnterpriseAnalytics[] = [];
  
  // Encryption configuration for AI credentials
  private encryptionKey: Buffer;
  private readonly algorithm = 'aes-256-gcm';
  private readonly ivLength = 12; // 96 bits for GCM
  private readonly tagLength = 16; // 128 bits for GCM
  private readonly keyLength = 32; // 256 bits for AES-256

  constructor() {
    // Validate and derive encryption key at startup
    const envKey = process.env.ENCRYPTION_KEY;
    if (!envKey) {
      throw new Error('ENCRYPTION_KEY environment variable is required for AI credential storage');
    }
    
    if (envKey.length < 32) {
      throw new Error('ENCRYPTION_KEY must be at least 32 characters long for security');
    }

    // Derive a consistent key using scrypt
    this.encryptionKey = crypto.scryptSync(envKey, 'ai-credentials-salt', this.keyLength);
  }

  /**
   * Rotate the encryption key used for AI credentials.
   * Re-encrypts all stored credentials with the new key atomically in-memory.
   * Call this during a maintenance window; persist ENCRYPTION_KEY and restart as needed.
   */
  async rotateEncryptionKey(newEnvKey: string): Promise<{ rotatedCount: number }>{
    if (!newEnvKey || newEnvKey.length < 32) {
      throw new Error('New encryption key must be at least 32 characters');
    }

    const newKey = crypto.scryptSync(newEnvKey, 'ai-credentials-salt', this.keyLength);

    // Decrypt with current key, then re-encrypt with new key
    let rotated = 0;
    const decrypted: { index: number; provider: AIProvider; apiKey: string; baseUrl?: string }[] = [];
    for (let i = 0; i < this.aiCredentials.length; i++) {
      const cred = this.aiCredentials[i];
      try {
        const apiKeyPlain = this.decryptText(cred.apiKey);
        decrypted.push({ index: i, provider: cred.provider, apiKey: apiKeyPlain, baseUrl: cred.baseUrl });
      } catch (e) {
        // If any credential cannot be decrypted, abort rotation to avoid data loss
        throw new Error(`Failed to decrypt existing credential for provider ${cred.provider}`);
      }
    }

    // Temporarily swap to new key to use encryptText
    const oldKey = this.encryptionKey;
    this.encryptionKey = newKey;
    try {
      for (const item of decrypted) {
        const now = new Date().toISOString();
        this.aiCredentials[item.index] = {
          ...this.aiCredentials[item.index],
          apiKey: this.encryptText(item.apiKey),
          updatedAt: now,
        } as any;
        rotated++;
      }
    } catch (e) {
      // On error, restore old key to keep instance usable
      this.encryptionKey = oldKey;
      throw e;
    }

    // Keep the new key active
    return { rotatedCount: rotated };
  }

  // Identity operations
  async createIdentity(identity: InsertIdentity): Promise<Identity> {
    const newIdentity: Identity = {
      id: Math.random().toString(36).substring(7),
      ...identity,
    };
    this.identities.push(newIdentity);
    return newIdentity;
  }

  async getIdentityByWallet(walletAddress: string): Promise<Identity | null> {
    return this.identities.find(identity => identity.walletAddress === walletAddress) || null;
  }

  async updateIdentity(walletAddress: string, updates: Partial<Identity>): Promise<Identity> {
    const index = this.identities.findIndex(identity => identity.walletAddress === walletAddress);
    if (index === -1) throw new Error('Identity not found');
    
    this.identities[index] = { ...this.identities[index], ...updates };
    return this.identities[index];
  }

  // Movement operations
  async createMovement(movement: InsertMovement): Promise<Movement> {
    const newMovement: Movement = {
      id: Math.random().toString(36).substring(7),
      memberCount: 0,
      createdAt: new Date().toISOString(),
      ...movement,
    };
    this.movements.push(newMovement);
    return newMovement;
  }

  async getMovements(): Promise<Movement[]> {
    return this.movements;
  }

  async getMovement(id: string): Promise<Movement | null> {
    return this.movements.find(movement => movement.id === id) || null;
  }

  async updateMovement(id: string, updates: Partial<Movement>): Promise<Movement> {
    const index = this.movements.findIndex(movement => movement.id === id);
    if (index === -1) throw new Error('Movement not found');
    
    this.movements[index] = { ...this.movements[index], ...updates };
    return this.movements[index];
  }

  // Document operations
  async createDocument(document: InsertDocument): Promise<Document> {
    const newDocument: Document = {
      id: Math.random().toString(36).substring(7),
      verificationStatus: 'pending',
      createdAt: new Date().toISOString(),
      ...document,
    };
    this.documents.push(newDocument);
    return newDocument;
  }

  async getDocuments(): Promise<Document[]> {
    return this.documents;
  }

  async getDocument(id: string): Promise<Document | null> {
    return this.documents.find(doc => doc.id === id) || null;
  }

  async updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
    const index = this.documents.findIndex(doc => doc.id === id);
    if (index === -1) throw new Error('Document not found');
    
    this.documents[index] = { ...this.documents[index], ...updates };
    return this.documents[index];
  }

  // Campaign operations
  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const newCampaign: Campaign = {
      id: Math.random().toString(36).substring(7),
      raisedAmount: 0,
      contributorCount: 0,
      createdAt: new Date().toISOString(),
      ...campaign,
    };
    this.campaigns.push(newCampaign);
    return newCampaign;
  }

  async getCampaigns(): Promise<Campaign[]> {
    return this.campaigns;
  }

  async getCampaign(id: string): Promise<Campaign | null> {
    return this.campaigns.find(campaign => campaign.id === id) || null;
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
    const index = this.campaigns.findIndex(campaign => campaign.id === id);
    if (index === -1) throw new Error('Campaign not found');
    
    this.campaigns[index] = { ...this.campaigns[index], ...updates };
    return this.campaigns[index];
  }

  // Donation operations
  async createDonation(donation: InsertDonation): Promise<Donation> {
    const newDonation: Donation = {
      id: Math.random().toString(36).substring(7),
      createdAt: new Date().toISOString(),
      ...donation,
    };
    this.donations.push(newDonation);

    // Update campaign stats
    const campaign = await this.getCampaign(donation.campaignId);
    if (campaign) {
      await this.updateCampaign(donation.campaignId, {
        raisedAmount: campaign.raisedAmount + donation.amount,
        contributorCount: campaign.contributorCount + 1,
      });
    }

    return newDonation;
  }

  async getDonationsByCampaign(campaignId: string): Promise<Donation[]> {
    return this.donations.filter(donation => donation.campaignId === campaignId);
  }

  // Membership operations
  async createMembership(membership: InsertMembership): Promise<Membership> {
    const newMembership: Membership = {
      id: Math.random().toString(36).substring(7),
      joinedAt: new Date().toISOString(),
      ...membership,
    };
    this.memberships.push(newMembership);

    // Update movement member count
    const movement = await this.getMovement(membership.movementId);
    if (movement) {
      await this.updateMovement(membership.movementId, {
        memberCount: movement.memberCount + 1,
      });
    }

    return newMembership;
  }

  async getMembershipsByMovement(movementId: string): Promise<Membership[]> {
    return this.memberships.filter(membership => membership.movementId === movementId);
  }

  async getMembershipsByWallet(walletAddress: string): Promise<Membership[]> {
    return this.memberships.filter(membership => membership.memberAddress === walletAddress);
  }

  // Consciousness State operations
  async createConsciousnessState(state: InsertConsciousnessState): Promise<ConsciousnessState> {
    const newState: ConsciousnessState = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
      ...state,
    };
    this.consciousnessStates.push(newState);
    return newState;
  }

  async getConsciousnessStates(agentId: string): Promise<ConsciousnessState[]> {
    return this.consciousnessStates.filter(state => state.agentId === agentId);
  }

  async getConsciousnessState(id: string): Promise<ConsciousnessState | null> {
    return this.consciousnessStates.find(state => state.id === id) || null;
  }

  async updateConsciousnessState(id: string, updates: Partial<ConsciousnessState>): Promise<ConsciousnessState> {
    const index = this.consciousnessStates.findIndex(state => state.id === id);
    if (index === -1) throw new Error('Consciousness state not found');
    
    this.consciousnessStates[index] = { ...this.consciousnessStates[index], ...updates };
    return this.consciousnessStates[index];
  }

  // Decision Record operations
  async createDecisionRecord(decision: InsertDecisionRecord): Promise<DecisionRecord> {
    const newDecision: DecisionRecord = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
      ...decision,
    };
    this.decisionRecords.push(newDecision);
    return newDecision;
  }

  async getDecisionRecords(agentId: string): Promise<DecisionRecord[]> {
    return this.decisionRecords.filter(decision => decision.agentId === agentId);
  }

  async getDecisionRecord(id: string): Promise<DecisionRecord | null> {
    return this.decisionRecords.find(decision => decision.id === id) || null;
  }

  async updateDecisionRecord(id: string, updates: Partial<DecisionRecord>): Promise<DecisionRecord> {
    const index = this.decisionRecords.findIndex(decision => decision.id === id);
    if (index === -1) throw new Error('Decision record not found');
    
    this.decisionRecords[index] = { ...this.decisionRecords[index], ...updates };
    return this.decisionRecords[index];
  }

  // Complexity Map operations
  async createComplexityMap(map: InsertComplexityMap): Promise<ComplexityMap> {
    const complexityMetrics = {
      nodeCount: map.nodes.length,
      edgeCount: map.edges.length,
      averageConnectivity: map.nodes.length > 0 ? map.edges.length / map.nodes.length : 0,
      emergenceIndex: map.emergentProperties.length / (map.nodes.length || 1),
      chaosOrder: 0.5 // Default balanced state
    };

    const newMap: ComplexityMap = {
      id: Math.random().toString(36).substring(7),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      complexityMetrics,
      ...map,
    };
    this.complexityMaps.push(newMap);
    return newMap;
  }

  async getComplexityMaps(): Promise<ComplexityMap[]> {
    return this.complexityMaps;
  }

  async getComplexityMap(id: string): Promise<ComplexityMap | null> {
    return this.complexityMaps.find(map => map.id === id) || null;
  }

  async updateComplexityMap(id: string, updates: Partial<ComplexityMap>): Promise<ComplexityMap> {
    const index = this.complexityMaps.findIndex(map => map.id === id);
    if (index === -1) throw new Error('Complexity map not found');
    
    const updatedMap = { ...this.complexityMaps[index], ...updates, updatedAt: new Date().toISOString() };
    
    // Recalculate complexity metrics if structure changed
    if (updates.nodes || updates.edges) {
      updatedMap.complexityMetrics = {
        nodeCount: updatedMap.nodes.length,
        edgeCount: updatedMap.edges.length,
        averageConnectivity: updatedMap.nodes.length > 0 ? updatedMap.edges.length / updatedMap.nodes.length : 0,
        emergenceIndex: updatedMap.emergentProperties.length / (updatedMap.nodes.length || 1),
        chaosOrder: updatedMap.complexityMetrics?.chaosOrder || 0.5
      };
    }
    
    this.complexityMaps[index] = updatedMap;
    return this.complexityMaps[index];
  }

  // Learning Cycle operations
  async createLearningCycle(cycle: InsertLearningCycle): Promise<LearningCycle> {
    const newCycle: LearningCycle = {
      id: Math.random().toString(36).substring(7),
      startedAt: new Date().toISOString(),
      ...cycle,
    };
    this.learningCycles.push(newCycle);
    return newCycle;
  }

  async getLearningCycles(agentId: string): Promise<LearningCycle[]> {
    return this.learningCycles.filter(cycle => cycle.agentId === agentId);
  }

  async getLearningCycle(id: string): Promise<LearningCycle | null> {
    return this.learningCycles.find(cycle => cycle.id === id) || null;
  }

  async updateLearningCycle(id: string, updates: Partial<LearningCycle>): Promise<LearningCycle> {
    const index = this.learningCycles.findIndex(cycle => cycle.id === id);
    if (index === -1) throw new Error('Learning cycle not found');
    
    const updatedCycle = { ...this.learningCycles[index], ...updates };
    
    // Calculate duration if completed
    if (updates.completedAt && updates.status === 'completed') {
      const startTime = new Date(this.learningCycles[index].startedAt).getTime();
      const endTime = new Date(updates.completedAt).getTime();
      updatedCycle.cycleDuration = endTime - startTime;
    }
    
    this.learningCycles[index] = updatedCycle;
    return this.learningCycles[index];
  }

  // Reflection Log operations
  async createReflectionLog(reflection: InsertReflectionLog): Promise<ReflectionLog> {
    const newReflection: ReflectionLog = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
      ...reflection,
    };
    this.reflectionLogs.push(newReflection);
    return newReflection;
  }

  async getReflectionLogs(agentId: string): Promise<ReflectionLog[]> {
    return this.reflectionLogs.filter(reflection => reflection.agentId === agentId);
  }

  async getReflectionLog(id: string): Promise<ReflectionLog | null> {
    return this.reflectionLogs.find(reflection => reflection.id === id) || null;
  }

  async updateReflectionLog(id: string, updates: Partial<ReflectionLog>): Promise<ReflectionLog> {
    const index = this.reflectionLogs.findIndex(reflection => reflection.id === id);
    if (index === -1) throw new Error('Reflection log not found');
    
    this.reflectionLogs[index] = { ...this.reflectionLogs[index], ...updates };
    return this.reflectionLogs[index];
  }

  // Decision Synthesis operations
  async createDecisionSynthesis(synthesis: InsertDecisionSynthesis): Promise<DecisionSynthesis> {
    const newSynthesis: DecisionSynthesis = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
      ...synthesis,
    };
    this.decisionSyntheses.push(newSynthesis);
    return newSynthesis;
  }

  async getDecisionSyntheses(agentId: string): Promise<DecisionSynthesis[]> {
    return this.decisionSyntheses.filter(synthesis => synthesis.agentId === agentId);
  }

  async getDecisionSynthesis(id: string): Promise<DecisionSynthesis | null> {
    return this.decisionSyntheses.find(synthesis => synthesis.id === id) || null;
  }

  async updateDecisionSynthesis(id: string, updates: Partial<DecisionSynthesis>): Promise<DecisionSynthesis> {
    const index = this.decisionSyntheses.findIndex(synthesis => synthesis.id === id);
    if (index === -1) throw new Error('Decision synthesis not found');
    
    this.decisionSyntheses[index] = { ...this.decisionSyntheses[index], ...updates };
    return this.decisionSyntheses[index];
  }

  // Decision Archetype operations
  async createDecisionArchetype(archetype: InsertDecisionArchetype): Promise<DecisionArchetype> {
    const newArchetype: DecisionArchetype = {
      id: Math.random().toString(36).substring(7),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...archetype,
    };
    this.decisionArchetypes.push(newArchetype);
    return newArchetype;
  }

  async getDecisionArchetypes(): Promise<DecisionArchetype[]> {
    return this.decisionArchetypes;
  }

  async getDecisionArchetype(id: string): Promise<DecisionArchetype | null> {
    return this.decisionArchetypes.find(archetype => archetype.id === id) || null;
  }

  async updateDecisionArchetype(id: string, updates: Partial<DecisionArchetype>): Promise<DecisionArchetype> {
    const index = this.decisionArchetypes.findIndex(archetype => archetype.id === id);
    if (index === -1) throw new Error('Decision archetype not found');
    
    this.decisionArchetypes[index] = { 
      ...this.decisionArchetypes[index], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    return this.decisionArchetypes[index];
  }

  // Decision Evolution operations
  async createDecisionEvolution(evolution: InsertDecisionEvolution): Promise<DecisionEvolution> {
    const newEvolution: DecisionEvolution = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
      ...evolution,
    };
    this.decisionEvolutions.push(newEvolution);
    return newEvolution;
  }

  async getDecisionEvolutions(originalDecisionId: string): Promise<DecisionEvolution[]> {
    return this.decisionEvolutions.filter(evolution => evolution.originalDecisionId === originalDecisionId);
  }

  async getDecisionEvolution(id: string): Promise<DecisionEvolution | null> {
    return this.decisionEvolutions.find(evolution => evolution.id === id) || null;
  }

  async updateDecisionEvolution(id: string, updates: Partial<DecisionEvolution>): Promise<DecisionEvolution> {
    const index = this.decisionEvolutions.findIndex(evolution => evolution.id === id);
    if (index === -1) throw new Error('Decision evolution not found');
    
    this.decisionEvolutions[index] = { ...this.decisionEvolutions[index], ...updates };
    return this.decisionEvolutions[index];
  }

  // Corruption Analysis operations
  async createCorruptionAnalysisResult(result: InsertCorruptionAnalysisResult): Promise<CorruptionAnalysisResult> {
    const newResult: CorruptionAnalysisResult = {
      id: Math.random().toString(36).substring(7),
      createdAt: new Date().toISOString(),
      ...result,
    };
    this.corruptionAnalysisResults.push(newResult);
    return newResult;
  }

  async getCorruptionAnalysisResults(): Promise<CorruptionAnalysisResult[]> {
    return this.corruptionAnalysisResults;
  }

  async getCorruptionAnalysisResult(id: string): Promise<CorruptionAnalysisResult | null> {
    return this.corruptionAnalysisResults.find(result => result.id === id) || null;
  }

  async getCorruptionAnalysisResultsByDocument(documentId: string): Promise<CorruptionAnalysisResult[]> {
    return this.corruptionAnalysisResults.filter(result => result.documentId === documentId);
  }

  async getCorruptionAnalysisResultsByEntity(entityId: string): Promise<CorruptionAnalysisResult[]> {
    return this.corruptionAnalysisResults.filter(result => result.entityId === entityId);
  }

  async updateCorruptionAnalysisResult(id: string, updates: Partial<CorruptionAnalysisResult>): Promise<CorruptionAnalysisResult> {
    const index = this.corruptionAnalysisResults.findIndex(result => result.id === id);
    if (index === -1) throw new Error('Corruption analysis result not found');
    
    this.corruptionAnalysisResults[index] = { ...this.corruptionAnalysisResults[index], ...updates };
    return this.corruptionAnalysisResults[index];
  }

  // Systemic Corruption Report operations
  async createSystemicCorruptionReport(report: InsertSystemicCorruptionReport): Promise<SystemicCorruptionReport> {
    const newReport: SystemicCorruptionReport = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
      ...report,
    };
    this.systemicCorruptionReports.push(newReport);
    return newReport;
  }

  async getSystemicCorruptionReports(): Promise<SystemicCorruptionReport[]> {
    return this.systemicCorruptionReports;
  }

  async getSystemicCorruptionReport(id: string): Promise<SystemicCorruptionReport | null> {
    return this.systemicCorruptionReports.find(report => report.id === id) || null;
  }

  async updateSystemicCorruptionReport(id: string, updates: Partial<SystemicCorruptionReport>): Promise<SystemicCorruptionReport> {
    const index = this.systemicCorruptionReports.findIndex(report => report.id === id);
    if (index === -1) throw new Error('Systemic corruption report not found');
    
    this.systemicCorruptionReports[index] = { ...this.systemicCorruptionReports[index], ...updates };
    return this.systemicCorruptionReports[index];
  }

  // Campaign Strategy Plan operations
  async createCampaignStrategyPlan(plan: InsertCampaignStrategyPlan): Promise<CampaignStrategyPlan> {
    const newPlan: CampaignStrategyPlan = {
      id: Math.random().toString(36).substring(7),
      generatedAt: new Date().toISOString(),
      ...plan,
    };
    this.campaignStrategyPlans.push(newPlan);
    return newPlan;
  }

  async getCampaignStrategyPlans(): Promise<CampaignStrategyPlan[]> {
    return this.campaignStrategyPlans;
  }

  async getCampaignStrategyPlan(id: string): Promise<CampaignStrategyPlan | null> {
    return this.campaignStrategyPlans.find(plan => plan.id === id) || null;
  }

  async getCampaignStrategyPlansByMovement(movementId: string): Promise<CampaignStrategyPlan[]> {
    return this.campaignStrategyPlans.filter(plan => plan.movementId === movementId);
  }

  async getCampaignStrategyPlansByCampaign(campaignId: string): Promise<CampaignStrategyPlan[]> {
    return this.campaignStrategyPlans.filter(plan => plan.campaignId === campaignId);
  }

  async updateCampaignStrategyPlan(id: string, updates: Partial<CampaignStrategyPlan>): Promise<CampaignStrategyPlan> {
    const index = this.campaignStrategyPlans.findIndex(plan => plan.id === id);
    if (index === -1) throw new Error('Campaign strategy plan not found');
    
    this.campaignStrategyPlans[index] = { ...this.campaignStrategyPlans[index], ...updates };
    return this.campaignStrategyPlans[index];
  }

  // Strategy Pattern operations
  async createStrategyPattern(pattern: StrategyPattern): Promise<StrategyPattern> {
    this.strategyPatterns.push(pattern);
    return pattern;
  }

  async getStrategyPatterns(): Promise<StrategyPattern[]> {
    return this.strategyPatterns;
  }

  async getStrategyPattern(id: string): Promise<StrategyPattern | null> {
    return this.strategyPatterns.find(pattern => pattern.id === id) || null;
  }

  async updateStrategyPattern(id: string, updates: Partial<StrategyPattern>): Promise<StrategyPattern> {
    const index = this.strategyPatterns.findIndex(pattern => pattern.id === id);
    if (index === -1) throw new Error('Strategy pattern not found');
    
    this.strategyPatterns[index] = { ...this.strategyPatterns[index], ...updates };
    return this.strategyPatterns[index];
  }

  // Tactical Framework operations
  async createTacticalFramework(framework: TacticalFramework): Promise<TacticalFramework> {
    this.tacticalFrameworks.push(framework);
    return framework;
  }

  async getTacticalFrameworks(): Promise<TacticalFramework[]> {
    return this.tacticalFrameworks;
  }

  async getTacticalFramework(id: string): Promise<TacticalFramework | null> {
    return this.tacticalFrameworks.find(framework => framework.id === id) || null;
  }

  async getTacticalFrameworksByStrategy(strategyPatternId: string): Promise<TacticalFramework[]> {
    return this.tacticalFrameworks.filter(framework => framework.strategyPatternId === strategyPatternId);
  }

  async updateTacticalFramework(id: string, updates: Partial<TacticalFramework>): Promise<TacticalFramework> {
    const index = this.tacticalFrameworks.findIndex(framework => framework.id === id);
    if (index === -1) throw new Error('Tactical framework not found');
    
    this.tacticalFrameworks[index] = { ...this.tacticalFrameworks[index], ...updates };
    return this.tacticalFrameworks[index];
  }

  // Resource Profile operations
  async createResourceProfile(profile: InsertResourceProfile): Promise<ResourceProfile> {
    const newProfile: ResourceProfile = {
      id: Math.random().toString(36).substring(7),
      ...profile,
    };
    this.resourceProfiles.push(newProfile);
    return newProfile;
  }

  async getResourceProfiles(): Promise<ResourceProfile[]> {
    return this.resourceProfiles;
  }

  async getResourceProfile(id: string): Promise<ResourceProfile | null> {
    return this.resourceProfiles.find(profile => profile.id === id) || null;
  }

  async updateResourceProfile(id: string, updates: Partial<ResourceProfile>): Promise<ResourceProfile> {
    const index = this.resourceProfiles.findIndex(profile => profile.id === id);
    if (index === -1) throw new Error('Resource profile not found');
    
    this.resourceProfiles[index] = { ...this.resourceProfiles[index], ...updates };
    return this.resourceProfiles[index];
  }

  // Modern encryption helper methods using AES-256-GCM
  private encryptText(text: string): string {
    try {
      // Generate random IV for each encryption
      const iv = crypto.randomBytes(this.ivLength);
      
      // Create cipher with AES-256-GCM
      const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);
      
      // Encrypt the text
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Get the authentication tag
      const tag = cipher.getAuthTag();
      
      // Return JSON structure with all components
      const encryptedData = {
        algorithm: this.algorithm,
        iv: iv.toString('hex'),
        ciphertext: encrypted,
        tag: tag.toString('hex')
      };
      
      return JSON.stringify(encryptedData);
    } catch (error) {
      console.error('Encryption failed:', error instanceof Error ? error.message : 'Unknown error');
      throw new Error('Failed to encrypt sensitive data');
    }
  }

  private decryptText(encryptedData: string): string {
    try {
      // Parse the encrypted data structure
      const data = JSON.parse(encryptedData);
      
      if (data.algorithm !== this.algorithm) {
        throw new Error(`Unsupported encryption algorithm: ${data.algorithm}`);
      }
      
      // Convert hex strings back to buffers
      const iv = Buffer.from(data.iv, 'hex');
      const tag = Buffer.from(data.tag, 'hex');
      
      // Create decipher with AES-256-GCM
      const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv);
      decipher.setAuthTag(tag);
      
      // Decrypt the text
      let decrypted = decipher.update(data.ciphertext, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error instanceof Error ? error.message : 'Unknown error');
      throw new Error('Failed to decrypt sensitive data - data may be corrupted or key invalid');
    }
  }

  private maskApiKey(apiKey: string): string {
    if (apiKey.length <= 8) return '•'.repeat(8);
    return '•'.repeat(apiKey.length - 4) + apiKey.slice(-4);
  }

  // AI Settings operations
  async getAISettings(): Promise<AISettings | null> {
    return this.aiSettings;
  }

  async updateAISettings(settings: InsertAISettings): Promise<AISettings> {
    const newSettings: AISettings = {
      id: 'ai-settings-singleton',
      updatedAt: new Date().toISOString(),
      ...settings,
    };
    this.aiSettings = newSettings;
    return newSettings;
  }

  // AI Credentials operations (secure)
  async createOrUpdateAICredentials(provider: AIProvider, apiKey: string, baseUrl?: string): Promise<AICredentials> {
    const now = new Date().toISOString();
    const existingIndex = this.aiCredentials.findIndex(cred => cred.provider === provider);
    
    const credentialData: AICredentials = {
      id: existingIndex >= 0 ? this.aiCredentials[existingIndex].id : Math.random().toString(36).substring(7),
      provider,
      apiKey: this.encryptText(apiKey),
      baseUrl,
      encryptedAt: now,
      createdAt: existingIndex >= 0 ? this.aiCredentials[existingIndex].createdAt : now,
      updatedAt: now,
    };

    if (existingIndex >= 0) {
      this.aiCredentials[existingIndex] = credentialData;
    } else {
      this.aiCredentials.push(credentialData);
    }

    return credentialData;
  }

  async getAICredentials(provider: AIProvider): Promise<AICredentials | null> {
    return this.aiCredentials.find(cred => cred.provider === provider) || null;
  }

  async getAllAICredentials(): Promise<AICredentials[]> {
    return this.aiCredentials;
  }

  async getMaskedAICredentials(): Promise<MaskedAICredentials[]> {
    return this.aiCredentials.map(cred => ({
      id: cred.id,
      provider: cred.provider,
      apiKeyMask: this.maskApiKey(this.decryptText(cred.apiKey)),
      baseUrl: cred.baseUrl,
      hasApiKey: true,
      createdAt: cred.createdAt,
      updatedAt: cred.updatedAt,
    }));
  }

  async deleteAICredentials(provider: AIProvider): Promise<boolean> {
    const index = this.aiCredentials.findIndex(cred => cred.provider === provider);
    if (index >= 0) {
      this.aiCredentials.splice(index, 1);
      return true;
    }
    return false;
  }

  async hasAICredentials(provider: AIProvider): Promise<boolean> {
    return this.aiCredentials.some(cred => cred.provider === provider);
  }

  // Helper method to get decrypted API key for AI service usage
  async getDecryptedAPIKey(provider: AIProvider): Promise<string | null> {
    const credentials = await this.getAICredentials(provider);
    if (!credentials) return null;
    try {
      return this.decryptText(credentials.apiKey);
    } catch (error) {
      console.error(`Failed to decrypt API key for provider ${provider}:`, error);
      return null;
    }
  }

  // AI Analytics operations

  // AI Usage Analytics methods
  async createAIUsageAnalytics(analytics: InsertAIUsageAnalytics): Promise<AIUsageAnalytics> {
    const newAnalytics: AIUsageAnalytics = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
      ...analytics,
    };
    this.aiUsageAnalytics.push(newAnalytics);
    return newAnalytics;
  }

  async getAIUsageAnalytics(timeframe?: string, featureType?: string): Promise<AIUsageAnalytics[]> {
    let filtered = [...this.aiUsageAnalytics];
    
    if (timeframe) {
      const cutoffDate = new Date();
      switch (timeframe) {
        case 'hour':
          cutoffDate.setHours(cutoffDate.getHours() - 1);
          break;
        case 'day':
          cutoffDate.setDate(cutoffDate.getDate() - 1);
          break;
        case 'week':
          cutoffDate.setDate(cutoffDate.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(cutoffDate.getMonth() - 1);
          break;
      }
      filtered = filtered.filter(a => new Date(a.timestamp) >= cutoffDate);
    }
    
    if (featureType) {
      filtered = filtered.filter(a => a.featureType === featureType);
    }
    
    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async getAIUsageAnalyticsById(id: string): Promise<AIUsageAnalytics | null> {
    return this.aiUsageAnalytics.find(a => a.id === id) || null;
  }

  // AI Provider Performance methods
  async createAIProviderPerformance(performance: InsertAIProviderPerformance): Promise<AIProviderPerformance> {
    const newPerformance: AIProviderPerformance = {
      id: Math.random().toString(36).substring(7),
      lastUpdated: new Date().toISOString(),
      ...performance,
    };
    this.aiProviderPerformance.push(newPerformance);
    return newPerformance;
  }

  async getAIProviderPerformance(provider?: AIProvider, timeWindow?: string): Promise<AIProviderPerformance[]> {
    let filtered = [...this.aiProviderPerformance];
    
    if (provider) {
      filtered = filtered.filter(p => p.provider === provider);
    }
    
    if (timeWindow) {
      filtered = filtered.filter(p => p.timeWindow === timeWindow);
    }
    
    return filtered.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
  }

  async getAIProviderPerformanceById(id: string): Promise<AIProviderPerformance | null> {
    return this.aiProviderPerformance.find(p => p.id === id) || null;
  }

  // AI User Feedback methods
  async createAIUserFeedback(feedback: InsertAIUserFeedback): Promise<AIUserFeedback> {
    const newFeedback: AIUserFeedback = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
      ...feedback,
    };
    this.aiUserFeedback.push(newFeedback);
    return newFeedback;
  }

  async getAIUserFeedback(featureType?: string, rating?: string): Promise<AIUserFeedback[]> {
    let filtered = [...this.aiUserFeedback];
    
    if (featureType) {
      filtered = filtered.filter(f => f.featureType === featureType);
    }
    
    if (rating) {
      filtered = filtered.filter(f => f.qualityRating === rating);
    }
    
    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async getAIUserFeedbackById(id: string): Promise<AIUserFeedback | null> {
    return this.aiUserFeedback.find(f => f.id === id) || null;
  }

  async getAIUserFeedbackByRequestId(requestId: string): Promise<AIUserFeedback | null> {
    return this.aiUserFeedback.find(f => f.requestId === requestId) || null;
  }

  // AI Feature Adoption methods
  async createAIFeatureAdoption(adoption: InsertAIFeatureAdoption): Promise<AIFeatureAdoption> {
    const newAdoption: AIFeatureAdoption = {
      id: Math.random().toString(36).substring(7),
      lastUpdated: new Date().toISOString(),
      ...adoption,
    };
    this.aiFeatureAdoption.push(newAdoption);
    return newAdoption;
  }

  async getAIFeatureAdoption(featureType?: string, timeWindow?: string): Promise<AIFeatureAdoption[]> {
    let filtered = [...this.aiFeatureAdoption];
    
    if (featureType) {
      filtered = filtered.filter(a => a.featureType === featureType);
    }
    
    if (timeWindow) {
      filtered = filtered.filter(a => a.timeWindow === timeWindow);
    }
    
    return filtered.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
  }

  async getAIFeatureAdoptionById(id: string): Promise<AIFeatureAdoption | null> {
    return this.aiFeatureAdoption.find(a => a.id === id) || null;
  }

  // AI Provider Fallback Event methods
  async createAIProviderFallbackEvent(event: InsertAIProviderFallbackEvent): Promise<AIProviderFallbackEvent> {
    const newEvent: AIProviderFallbackEvent = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
      ...event,
    };
    this.aiProviderFallbackEvents.push(newEvent);
    return newEvent;
  }

  async getAIProviderFallbackEvents(provider?: AIProvider, failureReason?: string): Promise<AIProviderFallbackEvent[]> {
    let filtered = [...this.aiProviderFallbackEvents];
    
    if (provider) {
      filtered = filtered.filter(e => e.primaryProvider === provider);
    }
    
    if (failureReason) {
      filtered = filtered.filter(e => e.failureReason === failureReason);
    }
    
    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async getAIProviderFallbackEventById(id: string): Promise<AIProviderFallbackEvent | null> {
    return this.aiProviderFallbackEvents.find(e => e.id === id) || null;
  }

  // AI Provider Recommendation methods
  async createAIProviderRecommendation(recommendation: InsertAIProviderRecommendation): Promise<AIProviderRecommendation> {
    const newRecommendation: AIProviderRecommendation = {
      id: Math.random().toString(36).substring(7),
      lastUpdated: new Date().toISOString(),
      ...recommendation,
    };
    this.aiProviderRecommendations.push(newRecommendation);
    return newRecommendation;
  }

  async getAIProviderRecommendations(featureType?: string): Promise<AIProviderRecommendation[]> {
    let filtered = [...this.aiProviderRecommendations];
    
    if (featureType) {
      filtered = filtered.filter(r => r.featureType === featureType);
    }
    
    return filtered.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
  }

  async getAIProviderRecommendationById(id: string): Promise<AIProviderRecommendation | null> {
    return this.aiProviderRecommendations.find(r => r.id === id) || null;
  }

  // Advanced Consciousness Features Methods

  // Cross-Model Validation methods
  async createCrossModelValidationRequest(request: InsertCrossModelValidationRequest): Promise<CrossModelValidationRequest> {
    const newRequest: CrossModelValidationRequest = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
      ...request,
    };
    this.crossModelValidationRequests.push(newRequest);
    return newRequest;
  }

  async getCrossModelValidationRequests(): Promise<CrossModelValidationRequest[]> {
    return [...this.crossModelValidationRequests];
  }

  async getCrossModelValidationRequest(id: string): Promise<CrossModelValidationRequest | null> {
    return this.crossModelValidationRequests.find(r => r.id === id) || null;
  }

  async getCrossModelValidationRequestsBySession(sessionId: string): Promise<CrossModelValidationRequest[]> {
    return this.crossModelValidationRequests.filter(r => r.sessionId === sessionId);
  }

  async getCrossModelValidationRequestsByUser(userId: string): Promise<CrossModelValidationRequest[]> {
    return this.crossModelValidationRequests.filter(r => r.userId === userId);
  }

  async createCrossModelConsensusAnalysis(analysis: InsertCrossModelConsensusAnalysis): Promise<CrossModelConsensusAnalysis> {
    const newAnalysis: CrossModelConsensusAnalysis = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
      ...analysis,
    };
    this.crossModelConsensusAnalyses.push(newAnalysis);
    return newAnalysis;
  }

  async getCrossModelConsensusAnalyses(): Promise<CrossModelConsensusAnalysis[]> {
    return [...this.crossModelConsensusAnalyses];
  }

  async getCrossModelConsensusAnalysis(id: string): Promise<CrossModelConsensusAnalysis | null> {
    return this.crossModelConsensusAnalyses.find(a => a.id === id) || null;
  }

  async getCrossModelConsensusAnalysesByRequest(requestId: string): Promise<CrossModelConsensusAnalysis[]> {
    return this.crossModelConsensusAnalyses.filter(a => a.requestId === requestId);
  }

  // Consciousness Pattern Analysis methods
  async createConsciousnessPatternAnalysis(analysis: InsertConsciousnessPatternAnalysis): Promise<ConsciousnessPatternAnalysis> {
    const newAnalysis: ConsciousnessPatternAnalysis = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
      ...analysis,
    };
    this.consciousnessPatternAnalyses.push(newAnalysis);
    return newAnalysis;
  }

  async getConsciousnessPatternAnalyses(): Promise<ConsciousnessPatternAnalysis[]> {
    return [...this.consciousnessPatternAnalyses];
  }

  async getConsciousnessPatternAnalysis(id: string): Promise<ConsciousnessPatternAnalysis | null> {
    return this.consciousnessPatternAnalyses.find(a => a.id === id) || null;
  }

  async getConsciousnessPatternAnalysesByAgent(agentId: string): Promise<ConsciousnessPatternAnalysis[]> {
    return this.consciousnessPatternAnalyses.filter(a => a.agentId === agentId);
  }

  async getConsciousnessPatternAnalysesByType(analysisType: string): Promise<ConsciousnessPatternAnalysis[]> {
    return this.consciousnessPatternAnalyses.filter(a => a.analysisType === analysisType);
  }

  // Recursive Insight Analysis methods
  async createRecursiveInsightAnalysis(analysis: InsertRecursiveInsightAnalysis): Promise<RecursiveInsightAnalysis> {
    const newAnalysis: RecursiveInsightAnalysis = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
      ...analysis,
    };
    this.recursiveInsightAnalyses.push(newAnalysis);
    return newAnalysis;
  }

  async getRecursiveInsightAnalyses(): Promise<RecursiveInsightAnalysis[]> {
    return [...this.recursiveInsightAnalyses];
  }

  async getRecursiveInsightAnalysis(id: string): Promise<RecursiveInsightAnalysis | null> {
    return this.recursiveInsightAnalyses.find(a => a.id === id) || null;
  }

  async getRecursiveInsightAnalysesByParent(parentAnalysisId: string): Promise<RecursiveInsightAnalysis[]> {
    return this.recursiveInsightAnalyses.filter(a => a.parentAnalysisId === parentAnalysisId);
  }

  async getRecursiveInsightAnalysesBySubject(subjectId: string): Promise<RecursiveInsightAnalysis[]> {
    return this.recursiveInsightAnalyses.filter(a => a.subjectData.subjectId === subjectId);
  }

  // Multidimensional Reflection methods
  async createMultidimensionalReflection(reflection: InsertMultidimensionalReflection): Promise<MultidimensionalReflection> {
    const newReflection: MultidimensionalReflection = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
      ...reflection,
    };
    this.multidimensionalReflections.push(newReflection);
    return newReflection;
  }

  async getMultidimensionalReflections(): Promise<MultidimensionalReflection[]> {
    return [...this.multidimensionalReflections];
  }

  async getMultidimensionalReflection(id: string): Promise<MultidimensionalReflection | null> {
    return this.multidimensionalReflections.find(r => r.id === id) || null;
  }

  async getMultidimensionalReflectionsByAgent(agentId: string): Promise<MultidimensionalReflection[]> {
    return this.multidimensionalReflections.filter(r => r.agentId === agentId);
  }

  async getMultidimensionalReflectionsByOriginal(originalReflectionId: string): Promise<MultidimensionalReflection[]> {
    return this.multidimensionalReflections.filter(r => r.originalReflectionId === originalReflectionId);
  }

  // Consciousness State Prediction methods
  async createConsciousnessStatePrediction(prediction: InsertConsciousnessStatePrediction): Promise<ConsciousnessStatePrediction> {
    const newPrediction: ConsciousnessStatePrediction = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
      ...prediction,
    };
    this.consciousnessStatePredictions.push(newPrediction);
    return newPrediction;
  }

  async getConsciousnessStatePredictions(): Promise<ConsciousnessStatePrediction[]> {
    return [...this.consciousnessStatePredictions];
  }

  async getConsciousnessStatePrediction(id: string): Promise<ConsciousnessStatePrediction | null> {
    return this.consciousnessStatePredictions.find(p => p.id === id) || null;
  }

  async getConsciousnessStatePredictionsByAgent(agentId: string): Promise<ConsciousnessStatePrediction[]> {
    return this.consciousnessStatePredictions.filter(p => p.agentId === agentId);
  }

  async getConsciousnessStatePredictionsByCurrentState(currentStateId: string): Promise<ConsciousnessStatePrediction[]> {
    return this.consciousnessStatePredictions.filter(p => p.currentStateId === currentStateId);
  }

  // Enterprise Leadership Tools methods

  // Executive Assessment methods
  async createExecutiveAssessment(assessment: InsertExecutiveAssessment): Promise<ExecutiveAssessment> {
    const newAssessment: ExecutiveAssessment = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
      ...assessment,
      nextReviewDate: assessment.nextReviewDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
    };
    this.executiveAssessments.push(newAssessment);
    return newAssessment;
  }

  async getExecutiveAssessments(): Promise<ExecutiveAssessment[]> {
    return [...this.executiveAssessments];
  }

  async getExecutiveAssessment(id: string): Promise<ExecutiveAssessment | null> {
    return this.executiveAssessments.find(a => a.id === id) || null;
  }

  async getExecutiveAssessmentsByOrganization(organizationId: string): Promise<ExecutiveAssessment[]> {
    return this.executiveAssessments.filter(a => a.organizationId === organizationId);
  }

  async getExecutiveAssessmentsByExecutive(executiveId: string): Promise<ExecutiveAssessment[]> {
    return this.executiveAssessments.filter(a => a.executiveId === executiveId);
  }

  async updateExecutiveAssessment(id: string, updates: Partial<ExecutiveAssessment>): Promise<ExecutiveAssessment> {
    const index = this.executiveAssessments.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Executive assessment not found');
    
    this.executiveAssessments[index] = { ...this.executiveAssessments[index], ...updates };
    return this.executiveAssessments[index];
  }

  // Strategic Plan methods
  async createStrategicPlan(plan: InsertStrategicPlan): Promise<StrategicPlan> {
    const newPlan: StrategicPlan = {
      id: Math.random().toString(36).substring(7),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...plan,
    };
    this.strategicPlans.push(newPlan);
    return newPlan;
  }

  async getStrategicPlans(): Promise<StrategicPlan[]> {
    return [...this.strategicPlans];
  }

  async getStrategicPlan(id: string): Promise<StrategicPlan | null> {
    return this.strategicPlans.find(p => p.id === id) || null;
  }

  async getStrategicPlansByOrganization(organizationId: string): Promise<StrategicPlan[]> {
    return this.strategicPlans.filter(p => p.organizationId === organizationId);
  }

  async updateStrategicPlan(id: string, updates: Partial<StrategicPlan>): Promise<StrategicPlan> {
    const index = this.strategicPlans.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Strategic plan not found');
    
    this.strategicPlans[index] = { 
      ...this.strategicPlans[index], 
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return this.strategicPlans[index];
  }

  // Team Consciousness Assessment methods
  async createTeamConsciousnessAssessment(assessment: InsertTeamConsciousnessAssessment): Promise<TeamConsciousnessAssessment> {
    const newAssessment: TeamConsciousnessAssessment = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
      ...assessment,
    };
    this.teamConsciousnessAssessments.push(newAssessment);
    return newAssessment;
  }

  async getTeamConsciousnessAssessments(): Promise<TeamConsciousnessAssessment[]> {
    return [...this.teamConsciousnessAssessments];
  }

  async getTeamConsciousnessAssessment(id: string): Promise<TeamConsciousnessAssessment | null> {
    return this.teamConsciousnessAssessments.find(a => a.id === id) || null;
  }

  async getTeamConsciousnessAssessmentsByOrganization(organizationId: string): Promise<TeamConsciousnessAssessment[]> {
    return this.teamConsciousnessAssessments.filter(a => a.organizationId === organizationId);
  }

  async getTeamConsciousnessAssessmentsByTeam(teamId: string): Promise<TeamConsciousnessAssessment[]> {
    return this.teamConsciousnessAssessments.filter(a => a.teamId === teamId);
  }

  async updateTeamConsciousnessAssessment(id: string, updates: Partial<TeamConsciousnessAssessment>): Promise<TeamConsciousnessAssessment> {
    const index = this.teamConsciousnessAssessments.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Team consciousness assessment not found');
    
    this.teamConsciousnessAssessments[index] = { ...this.teamConsciousnessAssessments[index], ...updates };
    return this.teamConsciousnessAssessments[index];
  }

  // Leadership Development Tracking methods
  async createLeadershipDevelopmentTracking(tracking: InsertLeadershipDevelopmentTracking): Promise<LeadershipDevelopmentTracking> {
    const newTracking: LeadershipDevelopmentTracking = {
      id: Math.random().toString(36).substring(7),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...tracking,
    };
    this.leadershipDevelopmentTrackings.push(newTracking);
    return newTracking;
  }

  async getLeadershipDevelopmentTrackings(): Promise<LeadershipDevelopmentTracking[]> {
    return [...this.leadershipDevelopmentTrackings];
  }

  async getLeadershipDevelopmentTracking(id: string): Promise<LeadershipDevelopmentTracking | null> {
    return this.leadershipDevelopmentTrackings.find(t => t.id === id) || null;
  }

  async getLeadershipDevelopmentTrackingsByOrganization(organizationId: string): Promise<LeadershipDevelopmentTracking[]> {
    return this.leadershipDevelopmentTrackings.filter(t => t.organizationId === organizationId);
  }

  async getLeadershipDevelopmentTrackingsByExecutive(executiveId: string): Promise<LeadershipDevelopmentTracking[]> {
    return this.leadershipDevelopmentTrackings.filter(t => t.executiveId === executiveId);
  }

  async updateLeadershipDevelopmentTracking(id: string, updates: Partial<LeadershipDevelopmentTracking>): Promise<LeadershipDevelopmentTracking> {
    const index = this.leadershipDevelopmentTrackings.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Leadership development tracking not found');
    
    this.leadershipDevelopmentTrackings[index] = { 
      ...this.leadershipDevelopmentTrackings[index], 
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return this.leadershipDevelopmentTrackings[index];
  }

  // Enterprise Analytics methods
  async createEnterpriseAnalytics(analytics: InsertEnterpriseAnalytics): Promise<EnterpriseAnalytics> {
    const newAnalytics: EnterpriseAnalytics = {
      id: Math.random().toString(36).substring(7),
      generatedAt: new Date().toISOString(),
      ...analytics,
    };
    this.enterpriseAnalytics.push(newAnalytics);
    return newAnalytics;
  }

  async getEnterpriseAnalytics(): Promise<EnterpriseAnalytics[]> {
    return [...this.enterpriseAnalytics];
  }

  async getEnterpriseAnalytic(id: string): Promise<EnterpriseAnalytics | null> {
    return this.enterpriseAnalytics.find(a => a.id === id) || null;
  }

  async getEnterpriseAnalyticsByOrganization(organizationId: string): Promise<EnterpriseAnalytics[]> {
    return this.enterpriseAnalytics.filter(a => a.organizationId === organizationId);
  }

  async updateEnterpriseAnalytics(id: string, updates: Partial<EnterpriseAnalytics>): Promise<EnterpriseAnalytics> {
    const index = this.enterpriseAnalytics.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Enterprise analytics not found');
    
    this.enterpriseAnalytics[index] = { ...this.enterpriseAnalytics[index], ...updates };
    return this.enterpriseAnalytics[index];
  }
}

export const storage = new MemStorage();