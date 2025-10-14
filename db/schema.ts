/**
 * Pitchfork Protocol - Database Schema
 * Replaces in-memory storage with real PostgreSQL persistence
 * Based on existing shared/schema.ts types
 */

import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, serial, decimal, index } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { relations } from 'drizzle-orm';

// ============================================================================
// Identity & Authentication
// ============================================================================

export const identities = pgTable('identities', {
  id: serial('id').primaryKey(),
  walletAddress: varchar('wallet_address', { length: 42 }).notNull().unique(),
  verificationLevel: varchar('verification_level', { length: 20 }).notNull().default('none'),
  verificationHash: text('verification_hash'),
  verifiedAt: timestamp('verified_at'),
  expiresAt: timestamp('expires_at'),
  signature: text('signature'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const identitiesRelations = relations(identities, ({ many }) => ({
  movements: many(movements),
  campaigns: many(campaigns),
  documents: many(documents),
}));

// ============================================================================
// Movements & Organizations
// ============================================================================

export const movements = pgTable('movements', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description').notNull(),
  creatorAddress: varchar('creator_address', { length: 42 }).notNull(),
  memberCount: integer('member_count').default(0).notNull(),
  location: varchar('location', { length: 100 }),
  category: varchar('category', { length: 50 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  nextEventDate: timestamp('next_event_date'),
  encryptionKey: text('encryption_key'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  idxCreator: index('idx_movements_creator').on(t.creatorAddress),
  idxStatus: index('idx_movements_status').on(t.status),
  idxCreatedAt: index('idx_movements_created_at').on(t.createdAt),
}));

export const movementsRelations = relations(movements, ({ one, many }) => ({
  creator: one(identities, {
    fields: [movements.creatorAddress],
    references: [identities.walletAddress],
  }),
  campaigns: many(campaigns),
  memberships: many(memberships),
}));

export const memberships = pgTable('memberships', {
  id: serial('id').primaryKey(),
  movementId: integer('movement_id').notNull(),
  walletAddress: varchar('wallet_address', { length: 42 }).notNull(),
  role: varchar('role', { length: 50 }).default('member').notNull(),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
}, (t) => ({
  idxMovement: index('idx_memberships_movement').on(t.movementId),
  idxWallet: index('idx_memberships_wallet').on(t.walletAddress),
}));

export const membershipsRelations = relations(memberships, ({ one }) => ({
  movement: one(movements, {
    fields: [memberships.movementId],
    references: [movements.id],
  }),
  member: one(identities, {
    fields: [memberships.walletAddress],
    references: [identities.walletAddress],
  }),
}));

// ============================================================================
// Documents & Evidence
// ============================================================================

export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description').notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  submitterAddress: varchar('submitter_address', { length: 42 }).notNull(),
  fileHash: text('file_hash').notNull(), // IPFS hash
  verificationStatus: varchar('verification_status', { length: 20 }).default('pending').notNull(),
  verifiedBy: varchar('verified_by', { length: 42 }),
  verifiedAt: timestamp('verified_at'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  idxSubmitter: index('idx_documents_submitter').on(t.submitterAddress),
  idxCategory: index('idx_documents_category').on(t.category),
  idxCreatedAt: index('idx_documents_created_at').on(t.createdAt),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  submitter: one(identities, {
    fields: [documents.submitterAddress],
    references: [identities.walletAddress],
  }),
}));

// ============================================================================
// Campaigns & Funding
// ============================================================================

export const campaigns = pgTable('campaigns', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description').notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  goalAmount: decimal('goal_amount', { precision: 18, scale: 2 }).notNull(),
  raisedAmount: decimal('raised_amount', { precision: 18, scale: 2 }).default('0').notNull(),
  contributorCount: integer('contributor_count').default(0).notNull(),
  creatorAddress: varchar('creator_address', { length: 42 }).notNull(),
  walletAddress: varchar('wallet_address', { length: 42 }).notNull(),
  endDate: timestamp('end_date').notNull(),
  status: varchar('status', { length: 20 }).default('active').notNull(),
  urgent: boolean('urgent').default(false).notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  idxCreator: index('idx_campaigns_creator').on(t.creatorAddress),
  idxStatus: index('idx_campaigns_status').on(t.status),
  idxEndDate: index('idx_campaigns_end_date').on(t.endDate),
  idxCreatedAt: index('idx_campaigns_created_at').on(t.createdAt),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  creator: one(identities, {
    fields: [campaigns.creatorAddress],
    references: [identities.walletAddress],
  }),
  donations: many(donations),
}));

export const donations = pgTable('donations', {
  id: serial('id').primaryKey(),
  campaignId: integer('campaign_id').notNull(),
  donorAddress: varchar('donor_address', { length: 42 }).notNull(),
  amount: decimal('amount', { precision: 18, scale: 2 }).notNull(),
  transactionHash: varchar('transaction_hash', { length: 66 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  idxCampaign: index('idx_donations_campaign').on(t.campaignId),
  idxDonor: index('idx_donations_donor').on(t.donorAddress),
  idxCreatedAt: index('idx_donations_created_at').on(t.createdAt),
}));

export const donationsRelations = relations(donations, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [donations.campaignId],
    references: [campaigns.id],
  }),
}));

// ============================================================================
// Consciousness Integration
// ============================================================================

export const consciousnessStates = pgTable('consciousness_states', {
  id: serial('id').primaryKey(),
  agentId: varchar('agent_id', { length: 100 }).notNull(),
  consciousnessLevel: decimal('consciousness_level', { precision: 5, scale: 4 }).notNull(),
  temporalCoherence: decimal('temporal_coherence', { precision: 5, scale: 4 }).notNull(),
  ethicalAlignment: decimal('ethical_alignment', { precision: 5, scale: 4 }).notNull(),
  complexityScore: decimal('complexity_score', { precision: 5, scale: 4 }).notNull(),
  verificationHash: text('verification_hash'),
  verified: boolean('verified').default(false).notNull(),
  temporalData: jsonb('temporal_data'), // Phi, quantum coherence, etc.
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const decisionRecords = pgTable('decision_records', {
  id: serial('id').primaryKey(),
  agentId: varchar('agent_id', { length: 100 }).notNull(),
  context: text('context').notNull(),
  options: jsonb('options').notNull(),
  selectedOption: jsonb('selected_option').notNull(),
  consciousnessLevel: decimal('consciousness_level', { precision: 5, scale: 4 }).notNull(),
  ethicalScore: decimal('ethical_score', { precision: 5, scale: 4 }).notNull(),
  reasoning: jsonb('reasoning').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const reflectionLogs = pgTable('reflection_logs', {
  id: serial('id').primaryKey(),
  agentId: varchar('agent_id', { length: 100 }).notNull(),
  trigger: text('trigger').notNull(),
  depth: integer('depth').notNull(),
  insights: jsonb('insights').notNull(),
  consciousnessLevel: decimal('consciousness_level', { precision: 5, scale: 4 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const learningCycles = pgTable('learning_cycles', {
  id: serial('id').primaryKey(),
  agentId: varchar('agent_id', { length: 100 }).notNull(),
  experience: text('experience').notNull(),
  learnings: jsonb('learnings').notNull(),
  adaptations: jsonb('adaptations').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const complexityMaps = pgTable('complexity_maps', {
  id: serial('id').primaryKey(),
  systemId: varchar('system_id', { length: 100 }).notNull(),
  nodes: jsonb('nodes').notNull(),
  connections: jsonb('connections').notNull(),
  emergentProperties: jsonb('emergent_properties').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================================================
// Strategy & Intelligence
// ============================================================================

export const campaignStrategyPlans = pgTable('campaign_strategy_plans', {
  id: serial('id').primaryKey(),
  campaignId: integer('campaign_id'),
  movementId: integer('movement_id'),
  title: varchar('title', { length: 200 }).notNull(),
  strategies: jsonb('strategies').notNull(),
  consciousnessLevel: decimal('consciousness_level', { precision: 5, scale: 4 }),
  ethicalScore: decimal('ethical_score', { precision: 5, scale: 4 }),
  estimatedImpact: decimal('estimated_impact', { precision: 5, scale: 4 }),
  riskAssessment: jsonb('risk_assessment'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const corruptionAnalysisResults = pgTable('corruption_analysis_results', {
  id: serial('id').primaryKey(),
  entityId: varchar('entity_id', { length: 100 }).notNull(),
  entityName: varchar('entity_name', { length: 200 }).notNull(),
  suspicionLevel: decimal('suspicion_level', { precision: 5, scale: 4 }).notNull(),
  indicators: jsonb('indicators').notNull(),
  recommendations: jsonb('recommendations'),
  consciousnessVerified: boolean('consciousness_verified').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================================================
// AI Settings & Provider Management
// ============================================================================

export const aiSettings = pgTable('ai_settings', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 100 }).notNull().unique(),
  preferredProvider: varchar('preferred_provider', { length: 50 }),
  fallbackEnabled: boolean('fallback_enabled').default(true),
  fallbackPriority: jsonb('fallback_priority'),
  rateLimitStrategy: varchar('rate_limit_strategy', { length: 50 }),
  costOptimization: boolean('cost_optimization').default(false),
  modelPreferences: jsonb('model_preferences'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const aiCredentials = pgTable('ai_credentials', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 100 }).notNull(),
  provider: varchar('provider', { length: 50 }).notNull(),
  encryptedApiKey: text('encrypted_api_key').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================================================
// Type Exports (Zod schemas for validation)
// ============================================================================

export const insertIdentitySchema = createInsertSchema(identities);
export const selectIdentitySchema = createSelectSchema(identities);

export const insertMovementSchema = createInsertSchema(movements);
export const selectMovementSchema = createSelectSchema(movements);

export const insertDocumentSchema = createInsertSchema(documents);
export const selectDocumentSchema = createSelectSchema(documents);

export const insertCampaignSchema = createInsertSchema(campaigns);
export const selectCampaignSchema = createSelectSchema(campaigns);

export const insertDonationSchema = createInsertSchema(donations);
export const selectDonationSchema = createSelectSchema(donations);

export const insertConsciousnessStateSchema = createInsertSchema(consciousnessStates);
export const insertDecisionRecordSchema = createInsertSchema(decisionRecords);
export const insertReflectionLogSchema = createInsertSchema(reflectionLogs);
export const insertLearningCycleSchema = createInsertSchema(learningCycles);
export const insertComplexityMapSchema = createInsertSchema(complexityMaps);

// Type exports
export type Identity = typeof identities.$inferSelect;
export type InsertIdentity = typeof identities.$inferInsert;

export type Movement = typeof movements.$inferSelect;
export type InsertMovement = typeof movements.$inferInsert;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = typeof campaigns.$inferInsert;

export type Donation = typeof donations.$inferSelect;
export type InsertDonation = typeof donations.$inferInsert;

export type ConsciousnessState = typeof consciousnessStates.$inferSelect;
export type DecisionRecord = typeof decisionRecords.$inferSelect;
export type ReflectionLog = typeof reflectionLogs.$inferSelect;
export type LearningCycle = typeof learningCycles.$inferSelect;
export type ComplexityMap = typeof complexityMaps.$inferSelect;
