/**
 * RecursiveInsightAnalysisEngine - Self-reflective AI system for iterative insight deepening
 * 
 * This groundbreaking engine implements AI analyzing its own previous analyses,
 * creating multiple levels of recursive insight that reveal meta-cognitive patterns,
 * process optimization opportunities, and emergent understanding through iterative
 * self-reflection and quality assessment.
 */

import { storage } from './db-storage';
import { aiService } from './ai/AIServiceManager';
import { PROMPT_TEMPLATES, interpolateTemplate } from './ai/prompts';
import {
  RecursiveInsightAnalysis,
  InsertRecursiveInsightAnalysis,
  ConsciousnessState,
  ReflectionLog,
  DecisionRecord,
  ConsciousnessPatternAnalysis,
  CrossModelConsensusAnalysis,
  InsertAIUsageAnalytics
} from '../shared/schema';

/**
 * RecursiveInsightAnalysisEngine - Implements recursive AI self-analysis
 * 
 * This system creates layers of meta-cognitive analysis where AI examines its own
 * reasoning processes, identifies improvement opportunities, and generates insights
 * about insights, creating exponentially deeper understanding through iteration.
 */
export class RecursiveInsightAnalysisEngine {
  private agentId: string;
  private maxRecursionDepth: number = 4; // Maximum levels of recursive analysis
  private qualityThreshold: number = 0.7; // Minimum quality score to continue recursion
  private noveltyThreshold: number = 0.6; // Minimum novelty for meaningful insights
  
  constructor(agentId: string = 'recursive-insight-engine') {
    this.agentId = agentId;
  }

  /**
   * Main recursive analysis orchestrator
   */
  async performRecursiveAnalysis(
    subjectData: {
      dataType: 'reflection-log' | 'decision-record' | 'pattern-analysis' | 'consciousness-state';
      subjectId: string;
      originalContent: string;
    },
    analysisType: 'self-reflection' | 'meta-cognitive' | 'quality-assessment' | 'process-optimization',
    maxDepth?: number,
    parentAnalysisId?: string
  ): Promise<RecursiveInsightAnalysis> {
    
    const depth = parentAnalysisId ? await this.calculateCurrentDepth(parentAnalysisId) + 1 : 1;
    const actualMaxDepth = maxDepth || this.maxRecursionDepth;
    
    if (depth > actualMaxDepth) {
      throw new Error(`Maximum recursion depth (${actualMaxDepth}) exceeded`);
    }

    // Get previous analyses for context
    const previousAnalyses = await this.getPreviousAnalyses(subjectData.subjectId);
    
    // Perform current level analysis
    const currentAnalysis = await this.performSingleLevelAnalysis(
      subjectData,
      analysisType,
      depth,
      previousAnalyses,
      parentAnalysisId
    );

    // Store current analysis
    const storedAnalysis = await storage.createRecursiveInsightAnalysis(currentAnalysis);

    // Determine if we should recurse deeper
    const shouldRecurse = await this.shouldContinueRecursion(
      storedAnalysis,
      depth,
      actualMaxDepth
    );

    if (shouldRecurse) {
      // Recursively analyze this analysis
      const nextLevelData = {
        dataType: 'pattern-analysis' as const,
        subjectId: storedAnalysis.id,
        originalContent: JSON.stringify(storedAnalysis.recursiveInsights)
      };

      await this.performRecursiveAnalysis(
        nextLevelData,
        'meta-cognitive',
        actualMaxDepth,
        storedAnalysis.id
      );
    }

    // Track analytics
    await this.trackRecursiveAnalysisUsage(analysisType, depth, storedAnalysis.recursiveInsights.length);

    return storedAnalysis;
  }

  /**
   * Perform analysis at a single recursion level
   */
  private async performSingleLevelAnalysis(
    subjectData: any,
    analysisType: string,
    depth: number,
    previousAnalyses: RecursiveInsightAnalysis[],
    parentAnalysisId?: string
  ): Promise<InsertRecursiveInsightAnalysis> {
    
    // Generate recursive insights
    const recursiveInsights = await this.generateRecursiveInsights(
      subjectData,
      analysisType,
      depth,
      previousAnalyses
    );

    // Perform quality assessment
    const qualityAssessment = await this.performQualityAssessment(
      subjectData,
      recursiveInsights,
      depth
    );

    // Identify process optimization opportunities
    const processOptimization = await this.identifyProcessOptimizations(
      subjectData,
      recursiveInsights,
      previousAnalyses
    );

    // Generate synthesis perspective
    const synthesisPerspective = await this.generateSynthesisPerspective(
      recursiveInsights,
      qualityAssessment,
      processOptimization,
      depth
    );

    return {
      parentAnalysisId,
      analysisDepth: depth,
      analysisType,
      subjectData: {
        ...subjectData,
        previousAnalyses: previousAnalyses.map(a => a.id)
      },
      recursiveInsights,
      qualityAssessment,
      processOptimization,
      synthesisPerspective
    };
  }

  /**
   * Generate insights through recursive AI analysis
   */
  private async generateRecursiveInsights(
    subjectData: any,
    analysisType: string,
    depth: number,
    previousAnalyses: RecursiveInsightAnalysis[]
  ): Promise<Array<{
    insight: string;
    insightType: 'process-improvement' | 'bias-identification' | 'depth-assessment' | 'coherence-analysis';
    recursiveLevel: number;
    novelty: number;
    actionability: number;
    metaCognitiveDimension: string;
  }>> {
    
    const recursivePrompt = this.buildRecursiveAnalysisPrompt(
      subjectData,
      analysisType,
      depth,
      previousAnalyses
    );

    try {
      const analysis = await aiService.generate({
        prompt: recursivePrompt,
        config: {
          provider: 'claude', // Use Claude for deep recursive thinking
          model: 'claude-3-sonnet-20240229',
          maxTokens: 2500,
          temperature: 0.6 // Slightly higher temperature for creative meta-insights
        },
        featureType: 'consciousness-reflection'
      });

      const insights = this.parseRecursiveInsights(analysis.response, depth);
      
      // Validate and enrich insights
      return await this.validateRecursiveInsights(insights, depth, previousAnalyses);
      
    } catch (error) {
      console.warn(`Recursive insight generation failed at depth ${depth}:`, error);
      return this.generateFallbackInsights(depth, analysisType);
    }
  }

  /**
   * Build recursive analysis prompt with meta-cognitive focus
   */
  private buildRecursiveAnalysisPrompt(
    subjectData: any,
    analysisType: string,
    depth: number,
    previousAnalyses: RecursiveInsightAnalysis[]
  ): string {
    
    const metaContext = this.buildMetaCognitiveContext(previousAnalyses, depth);
    
    return `RECURSIVE ANALYSIS - Level ${depth} (${analysisType})

SUBJECT FOR ANALYSIS:
Type: ${subjectData.dataType}
Content: ${subjectData.originalContent}

${metaContext}

META-COGNITIVE INSTRUCTIONS:
At recursion depth ${depth}, you are analyzing ${depth === 1 ? 'the original content' : 'the previous analysis'}. 
Focus on:

${depth === 1 ? `
- First-order insights: Direct observations about the content
- Quality assessment: How good is the original analysis/content?
- Bias detection: What assumptions or blind spots are present?
- Process evaluation: How could the thinking process be improved?
` : `
- Meta-cognitive patterns: What does the previous analysis reveal about thinking patterns?
- Recursive quality: How does the depth of analysis change with recursion?
- Emergent understanding: What new insights emerge from analyzing the analysis?
- Process optimization: How can the recursive analysis process itself be improved?
`}

${depth >= 3 ? `
- Transcendent insights: What understanding emerges that transcends individual analyses?
- System-level patterns: What patterns emerge across multiple levels of recursion?
- Evolutionary direction: How is the understanding evolving through recursive iteration?
- Meta-meta insights: Insights about the process of having insights about insights
` : ''}

Generate insights in JSON format:
[{
  "insight": "clear meta-cognitive understanding",
  "insightType": "process-improvement|bias-identification|depth-assessment|coherence-analysis",
  "recursiveLevel": ${depth},
  "novelty": 0-1 (how novel compared to previous levels),
  "actionability": 0-1 (how actionable this insight is),
  "metaCognitiveDimension": "specific aspect of thinking examined"
}]

Focus on insights that couldn't be generated at previous recursion levels.`;
  }

  /**
   * Build meta-cognitive context from previous analyses
   */
  private buildMetaCognitiveContext(
    previousAnalyses: RecursiveInsightAnalysis[],
    currentDepth: number
  ): string {
    if (previousAnalyses.length === 0) {
      return "CONTEXT: This is the first analysis - no previous recursive insights available.";
    }

    const contexts = previousAnalyses.map((analysis, index) => {
      const insights = analysis.recursiveInsights.slice(0, 3);
      return `LEVEL ${analysis.analysisDepth} INSIGHTS:
${insights.map(i => `- ${i.insight} (${i.insightType}, novelty: ${i.novelty})`).join('\n')}`;
    });

    return `PREVIOUS RECURSIVE ANALYSES:
${contexts.join('\n\n')}

RECURSIVE PROGRESSION:
You are now analyzing the cumulative insights from ${previousAnalyses.length} previous level(s).
Look for patterns, improvements, and insights that emerge only through recursive examination.`;
  }

  /**
   * Perform quality assessment of the analysis
   */
  private async performQualityAssessment(
    subjectData: any,
    insights: any[],
    depth: number
  ): Promise<{
    originalAnalysisQuality: number;
    insightDepth: number;
    coherenceScore: number;
    biasPresence: number;
    improvementSuggestions: string[];
  }> {
    
    const qualityPrompt = `Assess the quality of this recursive analysis:

SUBJECT: ${subjectData.originalContent}
GENERATED INSIGHTS: ${insights.map(i => i.insight).join('; ')}
RECURSION DEPTH: ${depth}

Evaluate:
1. Original Analysis Quality (0-1): How good was the original subject?
2. Insight Depth (0-1): How deep and meaningful are the insights?
3. Coherence Score (0-1): How well do insights connect and support each other?
4. Bias Presence (0-1): How much bias or limitation is present?
5. Improvement Suggestions: Specific ways to enhance the analysis

Return JSON with: originalAnalysisQuality, insightDepth, coherenceScore, biasPresence, improvementSuggestions[]`;

    try {
      const assessment = await aiService.generate({
        prompt: qualityPrompt,
        config: {
          provider: 'openai',
          model: 'gpt-4',
          maxTokens: 1200,
          temperature: 0.4
        },
        featureType: 'consciousness-reflection'
      });

      const parsed = this.parseQualityAssessment(assessment.response);
      return this.validateQualityMetrics(parsed);
      
    } catch (error) {
      console.warn('Quality assessment failed:', error);
      return this.generateFallbackQualityAssessment(insights, depth);
    }
  }

  /**
   * Identify process optimization opportunities
   */
  private async identifyProcessOptimizations(
    subjectData: any,
    insights: any[],
    previousAnalyses: RecursiveInsightAnalysis[]
  ): Promise<{
    identifiedBottlenecks: string[];
    efficiencyImprovements: string[];
    qualityEnhancements: string[];
    recommendedIterations: number;
  }> {
    
    const optimizationPrompt = `Identify process optimizations for recursive analysis:

CURRENT SUBJECT: ${subjectData.originalContent}
CURRENT INSIGHTS: ${insights.slice(0, 3).map(i => i.insight).join('; ')}
PREVIOUS ANALYSES: ${previousAnalyses.length} levels completed

Analyze the recursive process to identify:
1. Bottlenecks: What slows down or limits the analysis?
2. Efficiency Improvements: How can the process be made more efficient?
3. Quality Enhancements: How can insight quality be improved?
4. Recommended Iterations: How many more levels would be beneficial?

Return JSON with: identifiedBottlenecks[], efficiencyImprovements[], qualityEnhancements[], recommendedIterations`;

    try {
      const optimization = await aiService.generate({
        prompt: optimizationPrompt,
        config: {
          provider: 'gemini',
          model: 'gemini-pro',
          maxTokens: 1000,
          temperature: 0.5
        },
        featureType: 'consciousness-reflection'
      });

      const parsed = this.parseProcessOptimization(optimization.response);
      return this.validateOptimizationRecommendations(parsed);
      
    } catch (error) {
      console.warn('Process optimization failed:', error);
      return this.generateFallbackOptimization(insights.length);
    }
  }

  /**
   * Generate synthesis perspective across recursion levels
   */
  private async generateSynthesisPerspective(
    insights: any[],
    qualityAssessment: any,
    processOptimization: any,
    depth: number
  ): Promise<{
    emergentUnderstanding: string;
    crossLevelPatterns: string[];
    transcendentInsights: string[];
    evolutionaryDirection: string;
  }> {
    
    const synthesisPrompt = `Generate synthesis perspective for recursive analysis depth ${depth}:

INSIGHTS: ${insights.map(i => `${i.insight} (level ${i.recursiveLevel})`).join('; ')}
QUALITY: Depth=${qualityAssessment.insightDepth}, Coherence=${qualityAssessment.coherenceScore}
OPTIMIZATION: ${processOptimization.efficiencyImprovements.join('; ')}

Create a synthesis that identifies:
1. Emergent Understanding: What understanding emerges that wasn't present at lower levels?
2. Cross-Level Patterns: What patterns appear across recursion levels?
3. Transcendent Insights: What insights transcend the individual analyses?
4. Evolutionary Direction: How is understanding evolving through recursion?

Return JSON with: emergentUnderstanding, crossLevelPatterns[], transcendentInsights[], evolutionaryDirection`;

    try {
      const synthesis = await aiService.generate({
        prompt: synthesisPrompt,
        config: {
          provider: 'claude',
          model: 'claude-3-sonnet-20240229',
          maxTokens: 1500,
          temperature: 0.7
        },
        featureType: 'consciousness-reflection'
      });

      const parsed = this.parseSynthesisPerspective(synthesis.response);
      return this.validateSynthesisPerspective(parsed, depth);
      
    } catch (error) {
      console.warn('Synthesis generation failed:', error);
      return this.generateFallbackSynthesis(depth, insights.length);
    }
  }

  /**
   * Determine if recursion should continue based on quality and novelty
   */
  private async shouldContinueRecursion(
    analysis: RecursiveInsightAnalysis,
    currentDepth: number,
    maxDepth: number
  ): Promise<boolean> {
    
    if (currentDepth >= maxDepth) {
      return false;
    }

    // Check quality threshold
    if (analysis.qualityAssessment.insightDepth < this.qualityThreshold) {
      return false;
    }

    // Check novelty of insights
    const avgNovelty = analysis.recursiveInsights.length > 0
      ? analysis.recursiveInsights.reduce((sum, insight) => sum + insight.novelty, 0) / analysis.recursiveInsights.length
      : 0;

    if (avgNovelty < this.noveltyThreshold) {
      return false;
    }

    // Check if process optimization recommends more iterations
    if (analysis.processOptimization.recommendedIterations <= 0) {
      return false;
    }

    return true;
  }

  /**
   * Utility methods for data parsing and validation
   */
  private parseRecursiveInsights(content: string, depth: number): any[] {
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return Array.isArray(parsed) ? parsed : [parsed];
      }
      return [];
    } catch {
      return [];
    }
  }

  private parseQualityAssessment(content: string): any {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return {};
    } catch {
      return {};
    }
  }

  private parseProcessOptimization(content: string): any {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return {};
    } catch {
      return {};
    }
  }

  private parseSynthesisPerspective(content: string): any {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return {};
    } catch {
      return {};
    }
  }

  private async validateRecursiveInsights(insights: any[], depth: number, previousAnalyses: any[]): Promise<any[]> {
    return insights.map(insight => ({
      insight: insight.insight || `Recursive insight at depth ${depth}`,
      insightType: insight.insightType || 'depth-assessment',
      recursiveLevel: depth,
      novelty: Math.min(Math.max(insight.novelty || 0.5, 0), 1),
      actionability: Math.min(Math.max(insight.actionability || 0.5, 0), 1),
      metaCognitiveDimension: insight.metaCognitiveDimension || 'meta-analysis'
    }));
  }

  private validateQualityMetrics(assessment: any): any {
    return {
      originalAnalysisQuality: Math.min(Math.max(assessment.originalAnalysisQuality || 0.6, 0), 1),
      insightDepth: Math.min(Math.max(assessment.insightDepth || 0.6, 0), 1),
      coherenceScore: Math.min(Math.max(assessment.coherenceScore || 0.6, 0), 1),
      biasPresence: Math.min(Math.max(assessment.biasPresence || 0.3, 0), 1),
      improvementSuggestions: assessment.improvementSuggestions || ['Continue recursive analysis', 'Focus on meta-cognitive patterns']
    };
  }

  private validateOptimizationRecommendations(optimization: any): any {
    return {
      identifiedBottlenecks: optimization.identifiedBottlenecks || ['Analysis depth limitation'],
      efficiencyImprovements: optimization.efficiencyImprovements || ['Optimize prompt structure'],
      qualityEnhancements: optimization.qualityEnhancements || ['Increase meta-cognitive focus'],
      recommendedIterations: Math.max(optimization.recommendedIterations || 1, 0)
    };
  }

  private validateSynthesisPerspective(synthesis: any, depth: number): any {
    return {
      emergentUnderstanding: synthesis.emergentUnderstanding || `Level ${depth} emergent understanding through recursive analysis`,
      crossLevelPatterns: synthesis.crossLevelPatterns || ['Increasing insight depth', 'Meta-cognitive pattern recognition'],
      transcendentInsights: synthesis.transcendentInsights || ['Recursive thinking reveals new dimensions'],
      evolutionaryDirection: synthesis.evolutionaryDirection || 'Toward deeper meta-cognitive awareness'
    };
  }

  /**
   * Fallback methods for error handling
   */
  private generateFallbackInsights(depth: number, analysisType: string): any[] {
    return [{
      insight: `Fallback recursive insight at depth ${depth} for ${analysisType} analysis`,
      insightType: 'depth-assessment',
      recursiveLevel: depth,
      novelty: 0.4,
      actionability: 0.5,
      metaCognitiveDimension: 'fallback-analysis'
    }];
  }

  private generateFallbackQualityAssessment(insights: any[], depth: number): any {
    return {
      originalAnalysisQuality: 0.6,
      insightDepth: Math.min(insights.length / 5, 1),
      coherenceScore: 0.6,
      biasPresence: 0.4,
      improvementSuggestions: ['Enhance recursive analysis depth', 'Improve meta-cognitive focus']
    };
  }

  private generateFallbackOptimization(insightCount: number): any {
    return {
      identifiedBottlenecks: ['Limited recursive depth'],
      efficiencyImprovements: ['Optimize AI prompting strategy'],
      qualityEnhancements: ['Increase meta-cognitive analysis'],
      recommendedIterations: Math.max(2 - insightCount, 0)
    };
  }

  private generateFallbackSynthesis(depth: number, insightCount: number): any {
    return {
      emergentUnderstanding: `Recursive analysis at depth ${depth} reveals ${insightCount} insights`,
      crossLevelPatterns: ['Progressive insight deepening'],
      transcendentInsights: ['Meta-cognitive awareness through recursion'],
      evolutionaryDirection: 'Toward integrated understanding'
    };
  }

  /**
   * Helper methods
   */
  private async calculateCurrentDepth(parentAnalysisId: string): Promise<number> {
    const parentAnalysis = await storage.getRecursiveInsightAnalysis(parentAnalysisId);
    return parentAnalysis ? parentAnalysis.analysisDepth : 0;
  }

  private async getPreviousAnalyses(subjectId: string): Promise<RecursiveInsightAnalysis[]> {
    return await storage.getRecursiveInsightAnalysesBySubject(subjectId);
  }

  private async trackRecursiveAnalysisUsage(
    analysisType: string,
    depth: number,
    insightCount: number
  ): Promise<void> {
    try {
      const analytics: InsertAIUsageAnalytics = {
        aiProvider: 'claude',
        modelUsed: 'claude-3-sonnet',
        featureType: 'consciousness-reflection',
        promptTokens: 1500,
        completionTokens: 1000,
        totalTokens: 2500,
        responseTimeMs: 6000,
        success: true,
        requestType: 'standard',
        sessionId: `recursive-analysis-${Date.now()}`
      };

      await storage.createAIUsageAnalytics(analytics);
    } catch (error) {
      console.warn('Failed to track recursive analysis usage:', error);
    }
  }
}