/**
 * ConsciousnessPatternAnalysisEngine - Advanced pattern detection for consciousness evolution
 * 
 * This groundbreaking engine analyzes historical consciousness data to identify personal
 * growth patterns, recurring themes, unconscious biases, and breakthrough moments.
 * It provides personalized consciousness development recommendations based on AI analysis
 * of reflection patterns, decision-making tendencies, and learning trajectories.
 */

import { storage } from './db-storage';
import { aiService } from './ai/AIServiceManager';
import { PROMPT_TEMPLATES, interpolateTemplate } from './ai/prompts';
import {
  ConsciousnessPatternAnalysis,
  InsertConsciousnessPatternAnalysis,
  ConsciousnessState,
  ReflectionLog,
  DecisionRecord,
  LearningCycle,
  InsertAIUsageAnalytics
} from '../shared/schema';

/**
 * ConsciousnessPatternAnalysisEngine - Detects patterns in consciousness evolution
 * 
 * Analyzes historical consciousness data to reveal hidden patterns, growth themes,
 * biases, and development trajectories using advanced AI pattern recognition.
 */
export class ConsciousnessPatternAnalysisEngine {
  private agentId: string;
  private patternDetectionThreshold: number = 0.6;
  private significanceThreshold: number = 0.7;
  private minDataPoints: number = 5; // Minimum data points needed for meaningful analysis
  
  constructor(agentId: string = 'consciousness-pattern-engine') {
    this.agentId = agentId;
  }

  /**
   * Main pattern analysis orchestrator
   */
  async analyzeConsciousnessPatterns(
    agentId: string,
    analysisType: 'growth-patterns' | 'bias-detection' | 'theme-recognition' | 'evolution-tracking',
    timeframeStart: string,
    timeframeEnd: string,
    options?: {
      focusAreas?: string[];
      includeDecisions?: boolean;
      includeLearning?: boolean;
      minFrequency?: number;
    }
  ): Promise<ConsciousnessPatternAnalysis> {
    
    // Gather historical consciousness data
    const historicalData = await this.gatherHistoricalData(
      agentId, 
      timeframeStart, 
      timeframeEnd,
      options
    );

    if (historicalData.totalItems < this.minDataPoints) {
      throw new Error(`Insufficient data for pattern analysis. Need at least ${this.minDataPoints} data points, found ${historicalData.totalItems}`);
    }

    // Perform AI-powered pattern detection
    const detectedPatterns = await this.detectPatterns(
      historicalData,
      analysisType,
      options
    );

    // Generate insights and recommendations
    const insights = await this.generateInsights(detectedPatterns, historicalData, analysisType);

    // Calculate growth metrics
    const growthMetrics = await this.calculateGrowthMetrics(historicalData, detectedPatterns);

    // Generate personalized recommendations
    const personalizedRecommendations = await this.generatePersonalizedRecommendations(
      detectedPatterns,
      insights,
      growthMetrics,
      analysisType
    );

    // Create analysis record
    const analysisData: InsertConsciousnessPatternAnalysis = {
      agentId,
      analysisType,
      timeframeStart,
      timeframeEnd,
      dataSourceIds: historicalData.sourceIds,
      detectedPatterns,
      insights,
      growthMetrics,
      personalizedRecommendations
    };

    const analysis = await storage.createConsciousnessPatternAnalysis(analysisData);

    // Track analytics
    await this.trackAnalysisUsage(analysisType, detectedPatterns.length);

    return analysis;
  }

  /**
   * Gather historical consciousness data for analysis
   */
  private async gatherHistoricalData(
    agentId: string,
    timeframeStart: string,
    timeframeEnd: string,
    options?: any
  ): Promise<{
    consciousnessStates: ConsciousnessState[];
    reflectionLogs: ReflectionLog[];
    decisionRecords: DecisionRecord[];
    learningCycles: LearningCycle[];
    sourceIds: string[];
    totalItems: number;
  }> {
    
    // Fetch all consciousness data in parallel
    const [consciousnessStates, reflectionLogs, decisionRecords, learningCycles] = await Promise.all([
      storage.getConsciousnessStates(agentId),
      storage.getReflectionLogs(agentId),
      options?.includeDecisions !== false ? storage.getDecisionRecords(agentId) : Promise.resolve([]),
      options?.includeLearning !== false ? storage.getLearningCycles(agentId) : Promise.resolve([])
    ]);

    // Filter by timeframe
    const startTime = new Date(timeframeStart);
    const endTime = new Date(timeframeEnd);

    const filteredStates = consciousnessStates.filter(s => {
      const stateTime = new Date(s.timestamp);
      return stateTime >= startTime && stateTime <= endTime;
    });

    const filteredReflections = reflectionLogs.filter(r => {
      const reflectionTime = new Date(r.timestamp);
      return reflectionTime >= startTime && reflectionTime <= endTime;
    });

    const filteredDecisions = decisionRecords.filter(d => {
      const decisionTime = new Date(d.timestamp);
      return decisionTime >= startTime && decisionTime <= endTime;
    });

    const filteredLearning = learningCycles.filter(l => {
      const learningTime = new Date(l.startedAt);
      return learningTime >= startTime && learningTime <= endTime;
    });

    const sourceIds = [
      ...filteredStates.map(s => s.id),
      ...filteredReflections.map(r => r.id),
      ...filteredDecisions.map(d => d.id),
      ...filteredLearning.map(l => l.id)
    ];

    return {
      consciousnessStates: filteredStates,
      reflectionLogs: filteredReflections,
      decisionRecords: filteredDecisions,
      learningCycles: filteredLearning,
      sourceIds,
      totalItems: sourceIds.length
    };
  }

  /**
   * Detect patterns using AI analysis
   */
  private async detectPatterns(
    historicalData: any,
    analysisType: string,
    options?: any
  ): Promise<Array<{
    patternId: string;
    patternType: 'cognitive-bias' | 'growth-theme' | 'recurring-challenge' | 'breakthrough-indicator' | 'blind-spot';
    description: string;
    frequency: number;
    intensity: number;
    evolutionTrend: 'strengthening' | 'weakening' | 'stable' | 'emerging' | 'declining';
    firstObserved: string;
    lastObserved: string;
    relatedPatterns: string[];
    impact: 'positive' | 'negative' | 'neutral' | 'mixed';
    confidence: number;
  }>> {
    
    const patternAnalysisPrompt = this.buildPatternAnalysisPrompt(historicalData, analysisType);
    
    try {
      const analysis = await aiService.processRequest({
        prompt: patternAnalysisPrompt,
        context: {
          provider: 'claude', // Use Claude for pattern recognition
          type: 'pattern-analysis',
          maxTokens: 3000,
          temperature: 0.4
        }
      });

      const patterns = this.parsePatternAnalysis(analysis.content);
      
      // Validate and enrich patterns
      return await this.validateAndEnrichPatterns(patterns, historicalData);
      
    } catch (error) {
      console.warn('AI pattern detection failed, using fallback analysis:', error);
      return this.fallbackPatternDetection(historicalData, analysisType);
    }
  }

  /**
   * Build comprehensive pattern analysis prompt
   */
  private buildPatternAnalysisPrompt(historicalData: any, analysisType: string): string {
    const dataContext = this.buildDataContextString(historicalData);
    
    return `Analyze consciousness data for pattern detection (Analysis Type: ${analysisType}):

${dataContext}

Detect patterns focusing on:
- ${analysisType === 'growth-patterns' ? 'Personal growth trajectories, learning acceleration, consciousness evolution' : ''}
- ${analysisType === 'bias-detection' ? 'Cognitive biases, unconscious assumptions, thinking limitations' : ''}
- ${analysisType === 'theme-recognition' ? 'Recurring themes, persistent concerns, consistent insights' : ''}
- ${analysisType === 'evolution-tracking' ? 'Consciousness development stages, breakthrough moments, transformation indicators' : ''}

For each significant pattern found, return JSON array with:
{
  "patternId": "unique-identifier",
  "patternType": "cognitive-bias|growth-theme|recurring-challenge|breakthrough-indicator|blind-spot",
  "description": "detailed pattern description",
  "frequency": number (occurrences),
  "intensity": 0-1 (strength),
  "evolutionTrend": "strengthening|weakening|stable|emerging|declining",
  "firstObserved": "ISO date",
  "lastObserved": "ISO date", 
  "relatedPatterns": ["pattern-ids"],
  "impact": "positive|negative|neutral|mixed",
  "confidence": 0-1
}

Focus on significant patterns with high confidence and actionable insights.`;
  }

  /**
   * Build data context string for AI analysis
   */
  private buildDataContextString(historicalData: any): string {
    const contexts = [];

    // Consciousness states summary
    if (historicalData.consciousnessStates.length > 0) {
      contexts.push(`CONSCIOUSNESS STATES (${historicalData.consciousnessStates.length} entries):
${historicalData.consciousnessStates.slice(0, 10).map((state: any, i: number) => 
  `${i+1}. ${state.timestamp}: State=${state.state}, Awareness=${state.awarenessLevel}, Insights=[${state.emergentInsights.join(', ')}]`
).join('\n')}`);
    }

    // Reflection logs summary
    if (historicalData.reflectionLogs.length > 0) {
      contexts.push(`REFLECTION LOGS (${historicalData.reflectionLogs.length} entries):
${historicalData.reflectionLogs.slice(0, 10).map((reflection: any, i: number) => 
  `${i+1}. ${reflection.timestamp}: Type=${reflection.reflectionType}, Trigger="${reflection.reflectionTrigger}", Outcome=${reflection.reflectionOutcome}`
).join('\n')}`);
    }

    // Decision records summary
    if (historicalData.decisionRecords.length > 0) {
      contexts.push(`DECISION RECORDS (${historicalData.decisionRecords.length} entries):
${historicalData.decisionRecords.slice(0, 10).map((decision: any, i: number) => 
  `${i+1}. ${decision.timestamp}: Type=${decision.decisionType}, Context="${decision.context?.slice(0, 100)}..."`
).join('\n')}`);
    }

    // Learning cycles summary
    if (historicalData.learningCycles.length > 0) {
      contexts.push(`LEARNING CYCLES (${historicalData.learningCycles.length} entries):
${historicalData.learningCycles.slice(0, 10).map((cycle: any, i: number) => 
  `${i+1}. ${cycle.startedAt}: Type=${cycle.cycleType}, Status=${cycle.status}, Insights=[${cycle.emergentInsights.join(', ')}]`
).join('\n')}`);
    }

    return contexts.join('\n\n');
  }

  /**
   * Parse AI pattern analysis response
   */
  private parsePatternAnalysis(content: string): any[] {
    try {
      // Try to extract JSON array from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Try parsing the entire content as JSON
      return JSON.parse(content);
      
    } catch (error) {
      console.warn('Failed to parse pattern analysis JSON:', error);
      
      // Fallback: extract patterns from text
      return this.extractPatternsFromText(content);
    }
  }

  /**
   * Validate and enrich detected patterns
   */
  private async validateAndEnrichPatterns(patterns: any[], historicalData: any): Promise<any[]> {
    const validatedPatterns = [];
    
    for (const pattern of patterns) {
      // Validate pattern structure
      if (!pattern.patternId || !pattern.description || !pattern.patternType) {
        continue;
      }
      
      // Enrich with temporal analysis
      const enrichedPattern = {
        ...pattern,
        patternId: pattern.patternId || `pattern-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        frequency: pattern.frequency || 1,
        intensity: Math.min(Math.max(pattern.intensity || 0.5, 0), 1),
        confidence: Math.min(Math.max(pattern.confidence || 0.6, 0), 1),
        relatedPatterns: pattern.relatedPatterns || [],
        firstObserved: pattern.firstObserved || historicalData.sourceIds[0] ? new Date().toISOString() : new Date().toISOString(),
        lastObserved: pattern.lastObserved || new Date().toISOString()
      };
      
      validatedPatterns.push(enrichedPattern);
    }
    
    return validatedPatterns;
  }

  /**
   * Generate insights from detected patterns
   */
  private async generateInsights(
    patterns: any[],
    historicalData: any,
    analysisType: string
  ): Promise<Array<{
    insight: string;
    category: 'personal-growth' | 'consciousness-development' | 'decision-quality' | 'learning-acceleration';
    actionableRecommendations: string[];
    priority: 'low' | 'medium' | 'high' | 'critical';
  }>> {
    
    const insightPrompt = `Generate actionable insights from these consciousness patterns:

DETECTED PATTERNS:
${patterns.map((p, i) => `${i+1}. ${p.description} (${p.patternType}, impact: ${p.impact}, confidence: ${p.confidence})`).join('\n')}

ANALYSIS TYPE: ${analysisType}
DATA TIMEFRAME: ${historicalData.sourceIds.length} data points

Generate insights in JSON format:
{
  "insight": "clear, actionable understanding",
  "category": "personal-growth|consciousness-development|decision-quality|learning-acceleration",
  "actionableRecommendations": ["specific action steps"],
  "priority": "low|medium|high|critical"
}

Focus on practical insights that enable consciousness development and personal growth.`;

    try {
      const analysis = await aiService.processRequest({
        prompt: insightPrompt,
        context: {
          provider: 'openai',
          type: 'insight-generation',
          maxTokens: 2000,
          temperature: 0.5
        }
      });

      const insights = this.parseInsightAnalysis(analysis.content);
      return insights.length > 0 ? insights : this.generateFallbackInsights(patterns);
      
    } catch (error) {
      console.warn('Insight generation failed:', error);
      return this.generateFallbackInsights(patterns);
    }
  }

  /**
   * Calculate growth metrics based on patterns and data
   */
  private async calculateGrowthMetrics(
    historicalData: any,
    patterns: any[]
  ): Promise<{
    consciousnessEvolutionScore: number;
    learningVelocity: number;
    patternRecognitionImprovement: number;
    decisionQualityTrend: 'improving' | 'stable' | 'declining';
    awarenessDepthProgression: number;
  }> {
    
    const positivePatterns = patterns.filter(p => p.impact === 'positive');
    const growthPatterns = patterns.filter(p => p.patternType === 'growth-theme' || p.patternType === 'breakthrough-indicator');
    
    // Calculate consciousness evolution score
    const consciousnessEvolutionScore = Math.min(
      (positivePatterns.length / Math.max(patterns.length, 1)) * 0.6 + 
      (growthPatterns.length / Math.max(patterns.length, 1)) * 0.4, 
      1
    );
    
    // Calculate learning velocity based on cycle completion and insights
    const completedCycles = historicalData.learningCycles.filter((c: any) => c.status === 'completed');
    const learningVelocity = Math.min(
      (completedCycles.length / Math.max(historicalData.learningCycles.length, 1)) * 0.7 +
      (historicalData.reflectionLogs.length / historicalData.totalItems) * 0.3,
      1
    );
    
    // Pattern recognition improvement based on recent vs older insights
    const recentInsights = this.getRecentInsights(historicalData);
    const patternRecognitionImprovement = Math.min(recentInsights.quality / 10, 1);
    
    // Decision quality trend analysis
    const decisionQualityTrend = this.analyzeTrend(historicalData.decisionRecords);
    
    // Awareness depth progression
    const awarenessDepthProgression = this.calculateAwarenessProgression(historicalData.consciousnessStates);
    
    return {
      consciousnessEvolutionScore,
      learningVelocity,
      patternRecognitionImprovement,
      decisionQualityTrend,
      awarenessDepthProgression
    };
  }

  /**
   * Generate personalized recommendations
   */
  private async generatePersonalizedRecommendations(
    patterns: any[],
    insights: any[],
    growthMetrics: any,
    analysisType: string
  ): Promise<Array<{
    recommendation: string;
    rationale: string;
    estimatedImpact: number;
    implementationComplexity: 'low' | 'medium' | 'high';
    timeframe: 'immediate' | 'short-term' | 'medium-term' | 'long-term';
  }>> {
    
    const recommendationPrompt = `Generate personalized consciousness development recommendations:

PATTERN ANALYSIS:
${patterns.slice(0, 5).map(p => `- ${p.description} (${p.impact} impact)`).join('\n')}

GROWTH METRICS:
- Evolution Score: ${growthMetrics.consciousnessEvolutionScore}
- Learning Velocity: ${growthMetrics.learningVelocity}
- Decision Quality: ${growthMetrics.decisionQualityTrend}

KEY INSIGHTS:
${insights.slice(0, 3).map(i => `- ${i.insight}`).join('\n')}

Generate 3-5 personalized recommendations in JSON format:
{
  "recommendation": "specific actionable suggestion",
  "rationale": "why this will help based on patterns",
  "estimatedImpact": 0-1,
  "implementationComplexity": "low|medium|high",
  "timeframe": "immediate|short-term|medium-term|long-term"
}

Focus on recommendations that directly address identified patterns and leverage strengths.`;

    try {
      const analysis = await aiService.processRequest({
        prompt: recommendationPrompt,
        context: {
          provider: 'gemini',
          type: 'recommendation-generation',
          maxTokens: 1500,
          temperature: 0.6
        }
      });

      const recommendations = this.parseRecommendationAnalysis(analysis.content);
      return recommendations.length > 0 ? recommendations : this.generateFallbackRecommendations(patterns, growthMetrics);
      
    } catch (error) {
      console.warn('Recommendation generation failed:', error);
      return this.generateFallbackRecommendations(patterns, growthMetrics);
    }
  }

  /**
   * Utility methods and fallbacks
   */
  private extractPatternsFromText(content: string): any[] {
    // Simple text-based pattern extraction as fallback
    const patterns = [];
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    
    for (let i = 0; i < Math.min(lines.length, 5); i++) {
      patterns.push({
        patternId: `text-pattern-${i + 1}`,
        patternType: 'growth-theme',
        description: lines[i].trim(),
        frequency: 1,
        intensity: 0.5,
        evolutionTrend: 'stable',
        firstObserved: new Date().toISOString(),
        lastObserved: new Date().toISOString(),
        relatedPatterns: [],
        impact: 'neutral',
        confidence: 0.4
      });
    }
    
    return patterns;
  }

  private parseInsightAnalysis(content: string): any[] {
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/) || content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return Array.isArray(parsed) ? parsed : [parsed];
      }
      return [];
    } catch {
      return [];
    }
  }

  private parseRecommendationAnalysis(content: string): any[] {
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/) || content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return Array.isArray(parsed) ? parsed : [parsed];
      }
      return [];
    } catch {
      return [];
    }
  }

  private fallbackPatternDetection(historicalData: any, analysisType: string): any[] {
    return [{
      patternId: `fallback-${analysisType}`,
      patternType: 'growth-theme',
      description: `Pattern detected in ${analysisType} analysis of ${historicalData.totalItems} data points`,
      frequency: historicalData.totalItems,
      intensity: 0.6,
      evolutionTrend: 'stable',
      firstObserved: new Date().toISOString(),
      lastObserved: new Date().toISOString(),
      relatedPatterns: [],
      impact: 'positive',
      confidence: 0.5
    }];
  }

  private generateFallbackInsights(patterns: any[]): any[] {
    return [{
      insight: `Analysis of ${patterns.length} patterns reveals consciousness development opportunities`,
      category: 'personal-growth',
      actionableRecommendations: ['Continue regular reflection practice', 'Monitor pattern evolution over time'],
      priority: 'medium'
    }];
  }

  private generateFallbackRecommendations(patterns: any[], growthMetrics: any): any[] {
    return [{
      recommendation: 'Establish consistent consciousness reflection practice',
      rationale: 'Regular reflection enhances pattern recognition and self-awareness',
      estimatedImpact: 0.7,
      implementationComplexity: 'low',
      timeframe: 'immediate'
    }];
  }

  private getRecentInsights(historicalData: any): { quality: number } {
    const recentReflections = historicalData.reflectionLogs.slice(-5);
    const quality = recentReflections.reduce((sum: number, r: any) => 
      sum + (r.emergentAwareness?.length || 1), 0
    );
    return { quality };
  }

  private analyzeTrend(decisions: any[]): 'improving' | 'stable' | 'declining' {
    if (decisions.length < 3) return 'stable';
    
    const recent = decisions.slice(-3);
    const earlier = decisions.slice(0, 3);
    
    const recentQuality = recent.reduce((sum, d) => sum + (d.reasoning?.length || 1), 0) / recent.length;
    const earlierQuality = earlier.reduce((sum, d) => sum + (d.reasoning?.length || 1), 0) / earlier.length;
    
    if (recentQuality > earlierQuality * 1.1) return 'improving';
    if (recentQuality < earlierQuality * 0.9) return 'declining';
    return 'stable';
  }

  private calculateAwarenessProgression(states: any[]): number {
    if (states.length < 2) return 0.5;
    
    const early = states.slice(0, Math.ceil(states.length / 2));
    const recent = states.slice(Math.floor(states.length / 2));
    
    const earlyAwareness = early.reduce((sum, s) => sum + s.awarenessLevel, 0) / early.length;
    const recentAwareness = recent.reduce((sum, s) => sum + s.awarenessLevel, 0) / recent.length;
    
    return Math.min(Math.max((recentAwareness - earlyAwareness + 1) / 2, 0), 1);
  }

  private async trackAnalysisUsage(analysisType: string, patternCount: number): Promise<void> {
    try {
      const analytics: InsertAIUsageAnalytics = {
        provider: 'claude',
        model: 'claude-3-sonnet',
        featureType: 'consciousness-reflection',
        tokensUsed: 2000,
        responseTimeMs: 5000,
        success: true,
        costEstimate: 0.16,
        sessionId: `pattern-analysis-${Date.now()}`,
        promptType: `pattern-${analysisType}`,
        contextType: `patterns-detected-${patternCount}`
      };

      await storage.createAIUsageAnalytics(analytics);
    } catch (error) {
      console.warn('Failed to track pattern analysis usage:', error);
    }
  }
}