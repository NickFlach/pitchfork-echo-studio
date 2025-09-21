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
  InsertComplexityMap
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
};