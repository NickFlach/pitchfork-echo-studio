import type { 
  ConsciousnessState, 
  DecisionRecord, 
  ReflectionLog, 
  LearningCycle, 
  ComplexityMap,
  InsertConsciousnessState,
  InsertDecisionRecord,
  InsertReflectionLog,
  InsertLearningCycle,
  InsertComplexityMap,
  CorruptionAnalysisResult,
  SystemicCorruptionReport,
  CampaignStrategyPlan,
  ResourceProfile,
  InsertCorruptionAnalysisResult,
  InsertSystemicCorruptionReport,
  InsertCampaignStrategyPlan,
  InsertResourceProfile
} from '../../shared/schema';
import { apiRequest } from './queryClient';

export const consciousnessApi = {
  // Consciousness States
  async getConsciousnessStates(agentId: string): Promise<ConsciousnessState[]> {
    return apiRequest(`/api/consciousness-states/${agentId}`);
  },

  async createConsciousnessState(data: InsertConsciousnessState): Promise<ConsciousnessState> {
    return apiRequest('/api/consciousness-states', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Decision Records
  async getDecisionRecords(agentId: string): Promise<DecisionRecord[]> {
    return apiRequest(`/api/decisions/${agentId}`);
  },

  async createDecisionRecord(data: InsertDecisionRecord): Promise<DecisionRecord> {
    return apiRequest('/api/decisions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Reflection Logs
  async getReflectionLogs(agentId: string): Promise<ReflectionLog[]> {
    return apiRequest(`/api/reflections/${agentId}`);
  },

  async createReflectionLog(data: InsertReflectionLog): Promise<ReflectionLog> {
    return apiRequest('/api/reflections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Learning Cycles
  async getLearningCycles(agentId: string): Promise<LearningCycle[]> {
    return apiRequest(`/api/learning-cycles/${agentId}`);
  },

  async createLearningCycle(data: InsertLearningCycle): Promise<LearningCycle> {
    return apiRequest('/api/learning-cycles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Complexity Maps
  async getComplexityMaps(): Promise<ComplexityMap[]> {
    return apiRequest('/api/complexity-maps');
  },

  async createComplexityMap(data: InsertComplexityMap): Promise<ComplexityMap> {
    return apiRequest('/api/complexity-maps', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // High-level Consciousness Engine APIs
  async processDecision(context: any, options?: any): Promise<any> {
    return apiRequest('/api/consciousness/process-decision', {
      method: 'POST',
      body: JSON.stringify({ context, options }),
    });
  },

  async reflect(trigger: any): Promise<any> {
    return apiRequest('/api/consciousness/reflect', {
      method: 'POST',
      body: JSON.stringify({ trigger }),
    });
  },

  async learn(experience: any): Promise<any> {
    return apiRequest('/api/consciousness/learn', {
      method: 'POST',
      body: JSON.stringify({ experience }),
    });
  },

  async handleCrisis(crisis: any): Promise<any> {
    return apiRequest('/api/consciousness/handle-crisis', {
      method: 'POST',
      body: JSON.stringify({ crisis }),
    });
  },

  // Multiscale Decision Framework APIs
  async processMultiscaleDecision(context: string, options: any[], urgency: string = 'medium'): Promise<any> {
    return apiRequest('/api/multiscale-decision', {
      method: 'POST',
      body: JSON.stringify({ context, options, urgency }),
    });
  },

  async getDecisionSyntheses(agentId: string): Promise<any[]> {
    return apiRequest(`/api/decision-syntheses/${agentId}`);
  },

  async createDecisionSynthesis(data: any): Promise<any> {
    return apiRequest('/api/decision-syntheses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getDecisionArchetypes(): Promise<any[]> {
    return apiRequest('/api/decision-archetypes');
  },

  async createDecisionArchetype(data: any): Promise<any> {
    return apiRequest('/api/decision-archetypes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getDecisionEvolutions(originalDecisionId: string): Promise<any[]> {
    return apiRequest(`/api/decision-evolutions/${originalDecisionId}`);
  },

  async createDecisionEvolution(data: any): Promise<any> {
    return apiRequest('/api/decision-evolutions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Demo API
  async runMultiscaleDemo(): Promise<any> {
    return apiRequest('/api/demo/multiscale-decision-demo', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },

  // Corruption Detection Engine APIs
  async getCorruptionAnalysisResults(): Promise<CorruptionAnalysisResult[]> {
    return apiRequest('/api/corruption-analysis');
  },

  async getCorruptionAnalysisResult(id: string): Promise<CorruptionAnalysisResult> {
    return apiRequest(`/api/corruption-analysis/${id}`);
  },

  async createCorruptionAnalysisResult(data: InsertCorruptionAnalysisResult): Promise<CorruptionAnalysisResult> {
    return apiRequest('/api/corruption-analysis', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async analyzeDocumentForCorruption(documentId: string): Promise<CorruptionAnalysisResult> {
    return apiRequest('/api/corruption-analysis/analyze-document', {
      method: 'POST',
      body: JSON.stringify({ documentId }),
    });
  },

  async analyzeEntityForCorruption(entityId: string, entityType?: string): Promise<CorruptionAnalysisResult> {
    return apiRequest('/api/corruption-analysis/analyze-entity', {
      method: 'POST',
      body: JSON.stringify({ entityId, entityType }),
    });
  },

  async detectSystemicCorruption(entityIds: string[], timeframe?: string): Promise<SystemicCorruptionReport> {
    return apiRequest('/api/corruption-analysis/detect-systemic', {
      method: 'POST',
      body: JSON.stringify({ entityIds, timeframe }),
    });
  },

  // Strategic Intelligence Engine APIs
  async getCampaignStrategyPlans(): Promise<CampaignStrategyPlan[]> {
    return apiRequest('/api/strategy-plans');
  },

  async getCampaignStrategyPlan(id: string): Promise<CampaignStrategyPlan> {
    return apiRequest(`/api/strategy-plans/${id}`);
  },

  async getCampaignStrategyPlansByMovement(movementId: string): Promise<CampaignStrategyPlan[]> {
    return apiRequest(`/api/strategy-plans/movement/${movementId}`);
  },

  async generateCampaignStrategy(data: {
    movementId: string;
    objective: string;
    timeframe: string;
    resources: any;
    constraints?: string[];
  }): Promise<CampaignStrategyPlan> {
    return apiRequest('/api/strategy/generate-campaign', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getResourceProfiles(): Promise<ResourceProfile[]> {
    return apiRequest('/api/resource-profiles');
  },

  async createResourceProfile(data: InsertResourceProfile): Promise<ResourceProfile> {
    return apiRequest('/api/resource-profiles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getStrategyPatterns(): Promise<any[]> {
    return apiRequest('/api/strategy-patterns');
  },

  async getTacticalFrameworks(): Promise<any[]> {
    return apiRequest('/api/tactical-frameworks');
  },

  // Dashboard utility functions
  async getCorruptionStats(): Promise<{
    documentsAnalyzed: number;
    corruptionDetected: number;
    systemicCasesFound: number;
    movementsProtected: number;
    averageConfidence: number;
    criticalAlerts: number;
  }> {
    try {
      const results = await this.getCorruptionAnalysisResults();
      
      return {
        documentsAnalyzed: results.filter(r => r.documentId).length,
        corruptionDetected: results.filter(r => r.riskLevel === 'high' || r.riskLevel === 'critical').length,
        systemicCasesFound: results.filter(r => r.detectedPatterns?.some(p => p.patternType?.includes('systemic'))).length,
        movementsProtected: results.filter(r => (r as any).movementId).length,
        averageConfidence: results.length > 0 ? results.reduce((acc, r) => acc + (r.overallCorruptionScore || 0), 0) / results.length : 0,
        criticalAlerts: results.filter(r => r.urgencyLevel === 'critical').length,
      };
    } catch (error) {
      console.error('Failed to fetch corruption stats:', error);
      return {
        documentsAnalyzed: 0,
        corruptionDetected: 0,
        systemicCasesFound: 0,
        movementsProtected: 0,
        averageConfidence: 0,
        criticalAlerts: 0,
      };
    }
  },

  async getRecentDetections(): Promise<Array<{
    id: string;
    type: string;
    target: string;
    confidence: number;
    severity: string;
    timestamp: string;
    status: string;
  }>> {
    try {
      const results = await this.getCorruptionAnalysisResults();
      
      return results
        .slice(0, 5)
        .map(result => ({
          id: result.id,
          type: result.detectedPatterns?.[0]?.patternType || 'unknown',
          target: result.documentId || result.entityId || 'Unknown Target',
          confidence: result.overallCorruptionScore || 0,
          severity: result.riskLevel || 'low',
          timestamp: result.createdAt || result.analysisTimestamp || new Date().toISOString(),
          status: result.urgencyLevel === 'critical' ? 'investigating' : 'evidence-gathering',
        }));
    } catch (error) {
      console.error('Failed to fetch recent detections:', error);
      return [];
    }
  },
};