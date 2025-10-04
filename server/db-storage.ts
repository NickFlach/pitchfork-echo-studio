/**
 * Database Storage Layer
 * Replaces in-memory storage.ts with real PostgreSQL persistence
 * Maintains same interface for backward compatibility
 */

import { db } from '../db';
import {
  identities,
  movements,
  memberships,
  documents,
  campaigns,
  donations,
  consciousnessStates,
  decisionRecords,
  reflectionLogs,
  learningCycles,
  complexityMaps,
  campaignStrategyPlans,
  corruptionAnalysisResults,
  aiSettings,
  aiCredentials,
  type Identity,
  type InsertIdentity,
  type Movement,
  type InsertMovement,
  type Document,
  type InsertDocument,
  type Campaign,
  type InsertCampaign,
  type Donation,
  type InsertDonation,
  type ConsciousnessState,
  type DecisionRecord,
  type ReflectionLog,
  type LearningCycle,
  type ComplexityMap,
} from '../db/schema';
import { eq, desc, and } from 'drizzle-orm';

export class DatabaseStorage {
  // ========================================================================
  // Identity Operations
  // ========================================================================

  async createIdentity(identity: InsertIdentity): Promise<Identity> {
    const [result] = await db.insert(identities).values(identity).returning();
    return result;
  }

  async getIdentityByWallet(walletAddress: string): Promise<Identity | null> {
    const [result] = await db
      .select()
      .from(identities)
      .where(eq(identities.walletAddress, walletAddress))
      .limit(1);
    return result || null;
  }

  async updateIdentity(walletAddress: string, updates: Partial<Identity>): Promise<Identity> {
    const [result] = await db
      .update(identities)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(identities.walletAddress, walletAddress))
      .returning();
    return result;
  }

  // ========================================================================
  // Movement Operations
  // ========================================================================

  async createMovement(movement: InsertMovement): Promise<Movement> {
    const [result] = await db.insert(movements).values(movement).returning();
    return result;
  }

  async getMovements(): Promise<Movement[]> {
    return await db.select().from(movements).orderBy(desc(movements.createdAt));
  }

  async getMovement(id: number): Promise<Movement | null> {
    const [result] = await db
      .select()
      .from(movements)
      .where(eq(movements.id, id))
      .limit(1);
    return result || null;
  }

  async updateMovement(id: number, updates: Partial<Movement>): Promise<Movement> {
    const [result] = await db
      .update(movements)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(movements.id, id))
      .returning();
    return result;
  }

  async getMovementsByCreator(creatorAddress: string): Promise<Movement[]> {
    return await db
      .select()
      .from(movements)
      .where(eq(movements.creatorAddress, creatorAddress))
      .orderBy(desc(movements.createdAt));
  }

  // ========================================================================
  // Membership Operations
  // ========================================================================

  async addMembership(movementId: number, walletAddress: string, role: string = 'member'): Promise<void> {
    await db.insert(memberships).values({ movementId, walletAddress, role });
    
    // Update member count
    const [movement] = await db.select().from(movements).where(eq(movements.id, movementId));
    if (movement) {
      await db.update(movements)
        .set({ memberCount: movement.memberCount + 1 })
        .where(eq(movements.id, movementId));
    }
  }

  async removeMembership(movementId: number, walletAddress: string): Promise<void> {
    await db.delete(memberships)
      .where(and(
        eq(memberships.movementId, movementId),
        eq(memberships.walletAddress, walletAddress)
      ));
    
    // Update member count
    const [movement] = await db.select().from(movements).where(eq(movements.id, movementId));
    if (movement && movement.memberCount > 0) {
      await db.update(movements)
        .set({ memberCount: movement.memberCount - 1 })
        .where(eq(movements.id, movementId));
    }
  }

  // ========================================================================
  // Document Operations
  // ========================================================================

  async createDocument(document: InsertDocument): Promise<Document> {
    const [result] = await db.insert(documents).values(document).returning();
    return result;
  }

  async getDocuments(): Promise<Document[]> {
    return await db.select().from(documents).orderBy(desc(documents.createdAt));
  }

  async getDocument(id: number): Promise<Document | null> {
    const [result] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id))
      .limit(1);
    return result || null;
  }

  async updateDocument(id: number, updates: Partial<Document>): Promise<Document> {
    const [result] = await db
      .update(documents)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning();
    return result;
  }

  // ========================================================================
  // Campaign Operations
  // ========================================================================

  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const [result] = await db.insert(campaigns).values(campaign).returning();
    return result;
  }

  async getCampaigns(): Promise<Campaign[]> {
    return await db.select().from(campaigns).orderBy(desc(campaigns.createdAt));
  }

  async getCampaign(id: number): Promise<Campaign | null> {
    const [result] = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.id, id))
      .limit(1);
    return result || null;
  }

  async updateCampaign(id: number, updates: Partial<Campaign>): Promise<Campaign> {
    const [result] = await db
      .update(campaigns)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(campaigns.id, id))
      .returning();
    return result;
  }

  // ========================================================================
  // Donation Operations
  // ========================================================================

  async createDonation(donation: InsertDonation): Promise<Donation> {
    const [result] = await db.insert(donations).values(donation).returning();
    
    // Update campaign raised amount and contributor count
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, donation.campaignId));
    if (campaign) {
      const newRaisedAmount = parseFloat(campaign.raisedAmount) + parseFloat(donation.amount.toString());
      await db.update(campaigns)
        .set({
          raisedAmount: newRaisedAmount.toString(),
          contributorCount: campaign.contributorCount + 1,
        })
        .where(eq(campaigns.id, donation.campaignId));
    }
    
    return result;
  }

  async getDonationsByCampaign(campaignId: number): Promise<Donation[]> {
    return await db
      .select()
      .from(donations)
      .where(eq(donations.campaignId, campaignId))
      .orderBy(desc(donations.createdAt));
  }

  // ========================================================================
  // Consciousness Operations
  // ========================================================================

  async createConsciousnessState(state: Omit<ConsciousnessState, 'id' | 'createdAt'>): Promise<ConsciousnessState> {
    const [result] = await db.insert(consciousnessStates).values(state).returning();
    return result;
  }

  async getConsciousnessStates(agentId: string): Promise<ConsciousnessState[]> {
    return await db
      .select()
      .from(consciousnessStates)
      .where(eq(consciousnessStates.agentId, agentId))
      .orderBy(desc(consciousnessStates.createdAt))
      .limit(100);
  }

  async getLatestConsciousnessState(agentId: string): Promise<ConsciousnessState | null> {
    const [result] = await db
      .select()
      .from(consciousnessStates)
      .where(eq(consciousnessStates.agentId, agentId))
      .orderBy(desc(consciousnessStates.createdAt))
      .limit(1);
    return result || null;
  }

  async createDecisionRecord(record: Omit<DecisionRecord, 'id' | 'createdAt'>): Promise<DecisionRecord> {
    const [result] = await db.insert(decisionRecords).values(record).returning();
    return result;
  }

  async getDecisionRecords(agentId: string): Promise<DecisionRecord[]> {
    return await db
      .select()
      .from(decisionRecords)
      .where(eq(decisionRecords.agentId, agentId))
      .orderBy(desc(decisionRecords.createdAt))
      .limit(100);
  }

  async createReflectionLog(log: Omit<ReflectionLog, 'id' | 'createdAt'>): Promise<ReflectionLog> {
    const [result] = await db.insert(reflectionLogs).values(log).returning();
    return result;
  }

  async getReflectionLogs(agentId: string): Promise<ReflectionLog[]> {
    return await db
      .select()
      .from(reflectionLogs)
      .where(eq(reflectionLogs.agentId, agentId))
      .orderBy(desc(reflectionLogs.createdAt))
      .limit(100);
  }

  async createLearningCycle(cycle: Omit<LearningCycle, 'id' | 'createdAt'>): Promise<LearningCycle> {
    const [result] = await db.insert(learningCycles).values(cycle).returning();
    return result;
  }

  async getLearningCycles(agentId: string): Promise<LearningCycle[]> {
    return await db
      .select()
      .from(learningCycles)
      .where(eq(learningCycles.agentId, agentId))
      .orderBy(desc(learningCycles.createdAt))
      .limit(100);
  }

  async createComplexityMap(map: Omit<ComplexityMap, 'id' | 'createdAt'>): Promise<ComplexityMap> {
    const [result] = await db.insert(complexityMaps).values(map).returning();
    return result;
  }

  async getComplexityMaps(): Promise<ComplexityMap[]> {
    return await db
      .select()
      .from(complexityMaps)
      .orderBy(desc(complexityMaps.createdAt))
      .limit(100);
  }

  // ========================================================================
  // Strategy & Analysis Operations
  // ========================================================================

  async createCampaignStrategyPlan(plan: any): Promise<any> {
    const [result] = await db.insert(campaignStrategyPlans).values(plan).returning();
    return result;
  }

  async getCampaignStrategyPlans(): Promise<any[]> {
    return await db.select().from(campaignStrategyPlans).orderBy(desc(campaignStrategyPlans.createdAt));
  }

  async getCampaignStrategyPlansByMovement(movementId: number): Promise<any[]> {
    return await db
      .select()
      .from(campaignStrategyPlans)
      .where(eq(campaignStrategyPlans.movementId, movementId))
      .orderBy(desc(campaignStrategyPlans.createdAt));
  }

  async createCorruptionAnalysisResult(result: any): Promise<any> {
    const [record] = await db.insert(corruptionAnalysisResults).values(result).returning();
    return record;
  }

  async getCorruptionAnalysisResults(): Promise<any[]> {
    return await db.select().from(corruptionAnalysisResults).orderBy(desc(corruptionAnalysisResults.createdAt));
  }

  async getCorruptionAnalysisResult(id: number): Promise<any | null> {
    const [result] = await db
      .select()
      .from(corruptionAnalysisResults)
      .where(eq(corruptionAnalysisResults.id, id))
      .limit(1);
    return result || null;
  }

  // ========================================================================
  // AI Settings Operations
  // ========================================================================

  async getAISettings(userId: string): Promise<any | null> {
    const [result] = await db
      .select()
      .from(aiSettings)
      .where(eq(aiSettings.userId, userId))
      .limit(1);
    return result || null;
  }

  async createOrUpdateAISettings(userId: string, settings: any): Promise<any> {
    const existing = await this.getAISettings(userId);
    
    if (existing) {
      const [result] = await db
        .update(aiSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(aiSettings.userId, userId))
        .returning();
      return result;
    } else {
      const [result] = await db
        .insert(aiSettings)
        .values({ userId, ...settings })
        .returning();
      return result;
    }
  }

  async createAICredential(credential: any): Promise<any> {
    const [result] = await db.insert(aiCredentials).values(credential).returning();
    return result;
  }

  async getAICredentials(userId: string): Promise<any[]> {
    return await db
      .select()
      .from(aiCredentials)
      .where(and(
        eq(aiCredentials.userId, userId),
        eq(aiCredentials.isActive, true)
      ));
  }

  async deleteAICredential(id: number): Promise<void> {
    await db.delete(aiCredentials).where(eq(aiCredentials.id, id));
  }
}

// Export singleton instance
export const storage = new DatabaseStorage();
