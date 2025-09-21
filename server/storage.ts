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
  InsertDecisionEvolution
} from '../shared/schema';

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
}

export const storage = new MemStorage();