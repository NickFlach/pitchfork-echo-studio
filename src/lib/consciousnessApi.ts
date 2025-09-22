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
  InsertResourceProfile,
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

  // Leadership-Specific AI-Enhanced Methods
  async analyzeLeadershipDecision(data: {
    decisionContext: string;
    options: any[];
    stakeholders?: string;
    timeframe?: string;
    urgency?: string;
  }): Promise<any> {
    return apiRequest('/api/leadership/analyze-decision', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async optimizeResources(data: {
    availableResources: any;
    objectives: any;
    constraints?: string[];
    priorities?: string[];
  }): Promise<any> {
    return apiRequest('/api/leadership/optimize-resources', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async analyzeOpposition(data: {
    oppositionForces: any;
    objectives: any;
    movementContext?: string;
    timeframe?: string;
  }): Promise<any> {
    return apiRequest('/api/leadership/analyze-opposition', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async coordinateMovements(data: {
    movements: any[];
    activities: any[];
    timeline?: string;
    challenges?: string[];
  }): Promise<any> {
    return apiRequest('/api/leadership/coordinate-movements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
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

  // =============================================================================
  // ENTERPRISE LEADERSHIP TOOLS API METHODS
  // =============================================================================

  // Executive Assessment APIs
  async getExecutiveAssessments(organizationId?: string, executiveId?: string): Promise<ExecutiveAssessment[]> {
    const params = new URLSearchParams();
    if (organizationId) params.append('organizationId', organizationId);
    if (executiveId) params.append('executiveId', executiveId);
    
    const queryString = params.toString();
    const url = `/api/enterprise/executive-assessments${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest(url);
  },

  async getExecutiveAssessment(id: string): Promise<ExecutiveAssessment> {
    return apiRequest(`/api/enterprise/executive-assessments/${id}`);
  },

  async createExecutiveAssessment(data: InsertExecutiveAssessment): Promise<ExecutiveAssessment> {
    return apiRequest('/api/enterprise/executive-assessments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateExecutiveAssessment(id: string, updates: Partial<ExecutiveAssessment>): Promise<ExecutiveAssessment> {
    return apiRequest(`/api/enterprise/executive-assessments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Strategic Plan APIs
  async getStrategicPlans(organizationId?: string): Promise<StrategicPlan[]> {
    const params = new URLSearchParams();
    if (organizationId) params.append('organizationId', organizationId);
    
    const queryString = params.toString();
    const url = `/api/enterprise/strategic-plans${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest(url);
  },

  async getStrategicPlan(id: string): Promise<StrategicPlan> {
    return apiRequest(`/api/enterprise/strategic-plans/${id}`);
  },

  async createStrategicPlan(data: InsertStrategicPlan): Promise<StrategicPlan> {
    return apiRequest('/api/enterprise/strategic-plans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateStrategicPlan(id: string, updates: Partial<StrategicPlan>): Promise<StrategicPlan> {
    return apiRequest(`/api/enterprise/strategic-plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Team Consciousness Assessment APIs
  async getTeamConsciousnessAssessments(organizationId?: string, teamId?: string): Promise<TeamConsciousnessAssessment[]> {
    const params = new URLSearchParams();
    if (organizationId) params.append('organizationId', organizationId);
    if (teamId) params.append('teamId', teamId);
    
    const queryString = params.toString();
    const url = `/api/enterprise/team-assessments${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest(url);
  },

  async getTeamConsciousnessAssessment(id: string): Promise<TeamConsciousnessAssessment> {
    return apiRequest(`/api/enterprise/team-assessments/${id}`);
  },

  async createTeamConsciousnessAssessment(data: InsertTeamConsciousnessAssessment): Promise<TeamConsciousnessAssessment> {
    return apiRequest('/api/enterprise/team-assessments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateTeamConsciousnessAssessment(id: string, updates: Partial<TeamConsciousnessAssessment>): Promise<TeamConsciousnessAssessment> {
    return apiRequest(`/api/enterprise/team-assessments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Leadership Development Tracking APIs
  async getLeadershipDevelopmentTrackings(organizationId?: string, executiveId?: string): Promise<LeadershipDevelopmentTracking[]> {
    const params = new URLSearchParams();
    if (organizationId) params.append('organizationId', organizationId);
    if (executiveId) params.append('executiveId', executiveId);
    
    const queryString = params.toString();
    const url = `/api/enterprise/leadership-development${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest(url);
  },

  async getLeadershipDevelopmentTracking(id: string): Promise<LeadershipDevelopmentTracking> {
    return apiRequest(`/api/enterprise/leadership-development/${id}`);
  },

  async createLeadershipDevelopmentTracking(data: InsertLeadershipDevelopmentTracking): Promise<LeadershipDevelopmentTracking> {
    return apiRequest('/api/enterprise/leadership-development', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateLeadershipDevelopmentTracking(id: string, updates: Partial<LeadershipDevelopmentTracking>): Promise<LeadershipDevelopmentTracking> {
    return apiRequest(`/api/enterprise/leadership-development/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Enterprise Analytics APIs
  async getEnterpriseAnalytics(organizationId?: string): Promise<EnterpriseAnalytics[]> {
    const params = new URLSearchParams();
    if (organizationId) params.append('organizationId', organizationId);
    
    const queryString = params.toString();
    const url = `/api/enterprise/analytics${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest(url);
  },

  async getEnterpriseAnalytic(id: string): Promise<EnterpriseAnalytics> {
    return apiRequest(`/api/enterprise/analytics/${id}`);
  },

  async createEnterpriseAnalytics(data: InsertEnterpriseAnalytics): Promise<EnterpriseAnalytics> {
    return apiRequest('/api/enterprise/analytics', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateEnterpriseAnalytics(id: string, updates: Partial<EnterpriseAnalytics>): Promise<EnterpriseAnalytics> {
    return apiRequest(`/api/enterprise/analytics/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // AI-Enhanced Enterprise APIs
  async generateAIEnhancedAssessment(data: {
    executiveId: string;
    assessmentType: string;
    context?: string;
    options?: any;
  }): Promise<any> {
    return apiRequest('/api/enterprise/ai-enhanced-assessment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async generateAIStrategicPlanning(data: {
    organizationId: string;
    objectives: any;
    timeframe?: string;
    constraints?: string[];
    resources?: any;
  }): Promise<any> {
    return apiRequest('/api/enterprise/ai-strategic-planning', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async generateAITeamAssessment(data: {
    teamId: string;
    assessmentData: any;
    focusAreas?: string[];
  }): Promise<any> {
    return apiRequest('/api/enterprise/ai-team-assessment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Enterprise Dashboard Utility Functions
  async getEnterpriseOverview(organizationId: string): Promise<{
    executiveCount: number;
    strategicPlansActive: number;
    teamAssessmentsCompleted: number;
    developmentProgramsActive: number;
    averageLeadershipEffectiveness: number;
    criticalDevelopmentAreas: number;
  }> {
    try {
      const [executives, plans, teams, developments] = await Promise.all([
        this.getExecutiveAssessments(organizationId),
        this.getStrategicPlans(organizationId),
        this.getTeamConsciousnessAssessments(organizationId),
        this.getLeadershipDevelopmentTrackings(organizationId)
      ]);

      return {
        executiveCount: executives.length,
        strategicPlansActive: plans.filter(p => p.status === 'active').length,
        teamAssessmentsCompleted: teams.filter(t => t.assessmentStatus === 'completed').length,
        developmentProgramsActive: developments.filter(d => d.status === 'active').length,
        averageLeadershipEffectiveness: executives.length > 0 
          ? executives.reduce((acc, e) => acc + (e.aiInsights?.leadershipStyle?.adaptabilityScore || 0), 0) / executives.length 
          : 0,
        criticalDevelopmentAreas: executives.reduce((acc, e) => 
          acc + (e.aiInsights?.developmentAreas?.filter(area => area.impact === 'critical').length || 0), 0
        )
      };
    } catch (error) {
      console.error('Failed to fetch enterprise overview:', error);
      return {
        executiveCount: 0,
        strategicPlansActive: 0,
        teamAssessmentsCompleted: 0,
        developmentProgramsActive: 0,
        averageLeadershipEffectiveness: 0,
        criticalDevelopmentAreas: 0,
      };
    }
  },

  async getRecentEnterpriseActivities(organizationId: string): Promise<Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    priority: string;
    executiveId?: string;
    teamId?: string;
  }>> {
    try {
      const [executives, plans, teams, developments] = await Promise.all([
        this.getExecutiveAssessments(organizationId),
        this.getStrategicPlans(organizationId),
        this.getTeamConsciousnessAssessments(organizationId),
        this.getLeadershipDevelopmentTrackings(organizationId)
      ]);

      const activities: any[] = [];

      // Add recent executive assessments
      executives.slice(0, 3).forEach(assessment => {
        activities.push({
          id: assessment.id,
          type: 'assessment',
          description: `Executive assessment completed for ${assessment.executiveId}`,
          timestamp: assessment.timestamp,
          priority: assessment.aiInsights?.developmentAreas?.some(area => area.impact === 'critical') ? 'high' : 'medium',
          executiveId: assessment.executiveId
        });
      });

      // Add recent strategic plans
      plans.slice(0, 2).forEach(plan => {
        activities.push({
          id: plan.id,
          type: 'strategic-plan',
          description: `Strategic plan updated: ${plan.title}`,
          timestamp: plan.updatedAt,
          priority: plan.strategicInitiatives?.some(init => init.priority === 'critical') ? 'high' : 'medium'
        });
      });

      // Add recent team assessments
      teams.slice(0, 2).forEach(team => {
        activities.push({
          id: team.id,
          type: 'team-assessment',
          description: `Team consciousness assessment: ${team.teamName}`,
          timestamp: team.timestamp,
          priority: team.consciousnessMetrics?.overallScore < 0.7 ? 'high' : 'medium',
          teamId: team.teamId
        });
      });

      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5);
    } catch (error) {
      console.error('Failed to fetch recent enterprise activities:', error);
      return [];
    }
  },
};