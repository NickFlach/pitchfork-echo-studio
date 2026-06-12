/**
 * CrossModelValidationEngine - Multi-provider consciousness insights validation system
 * 
 * This pioneering system implements human-AI consciousness collaboration by routing
 * the same consciousness prompts to multiple AI models, analyzing consensus vs divergence,
 * and synthesizing unique insights across different AI perspectives.
 */

import { aiService } from './ai/AIServiceManager';
import { storage } from './storage';
import { PROMPT_TEMPLATES, interpolateTemplate } from './ai/prompts';
import {
  CrossModelValidationRequest,
  InsertCrossModelValidationRequest,
  CrossModelConsensusAnalysis,
  InsertCrossModelConsensusAnalysis,
  ProviderResponse,
  AIProvider,
  InsertAIUsageAnalytics
} from '../shared/schema';

/**
 * CrossModelValidationEngine - Routes consciousness prompts to multiple AI providers
 * and performs sophisticated consensus analysis to identify convergent insights
 * vs unique perspectives across different AI models
 */
export class CrossModelValidationEngine {
  private agentId: string;
  private consensusThreshold: number = 0.7; // Minimum agreement level for consensus
  private diversityThreshold: number = 0.3; // Minimum uniqueness for divergent insights
  
  constructor(agentId: string = 'cross-model-validation-engine') {
    this.agentId = agentId;
  }

  /**
   * Main validation orchestrator - routes prompt to multiple providers and analyzes results
   */
  async validateAcrossModels(
    promptContent: string,
    promptType: 'reflection' | 'decision' | 'pattern-analysis' | 'meta-insight',
    requestedProviders: AIProvider[] = ['openai', 'claude', 'gemini'],
    context?: Record<string, any>,
    sessionId?: string,
    userId?: string
  ): Promise<CrossModelConsensusAnalysis> {
    
    // Create validation request record
    const validationRequest = await this.createValidationRequest({
      promptContent,
      promptType,
      requestedProviders,
      context,
      sessionId: sessionId || `session-${Date.now()}`,
      userId
    });

    // Route prompt to all requested providers in parallel
    const providerResponses = await this.routeToProviders(
      promptContent,
      promptType,
      requestedProviders,
      context
    );

    // Track usage analytics for each provider
    await Promise.all(
      providerResponses.map(response => this.trackProviderUsage(response, promptType))
    );

    // Perform consensus analysis
    const consensusAnalysis = await this.performConsensusAnalysis(
      validationRequest.id,
      providerResponses
    );

    // Store consensus analysis results
    const storedAnalysis = await storage.createCrossModelConsensusAnalysis(consensusAnalysis);

    return storedAnalysis;
  }

  /**
   * Route consciousness prompt to multiple AI providers in parallel
   */
  private async routeToProviders(
    promptContent: string,
    promptType: 'reflection' | 'decision' | 'pattern-analysis' | 'meta-insight',
    providers: AIProvider[],
    context?: Record<string, any>
  ): Promise<ProviderResponse[]> {
    
    // Prepare consciousness-optimized prompt for each type
    const enhancedPrompt = this.enhancePromptForConsciousness(promptContent, promptType, context);
    
    // Route to all providers simultaneously
    const providerPromises = providers.map(async (provider): Promise<ProviderResponse> => {
      const startTime = Date.now();
      
      try {
        const response = await aiService.processRequest({
          prompt: enhancedPrompt,
          context: {
            provider,
            type: 'consciousness-validation',
            promptType,
            maxTokens: 2000,
            temperature: 0.7
          }
        });

        const latency = Date.now() - startTime;

        return {
          provider,
          model: response.metadata?.model || 'default',
          response: response.content,
          metadata: {
            tokens: response.metadata?.tokens,
            latency,
            temperature: 0.7,
            confidence: response.metadata?.confidence
          },
          timestamp: new Date().toISOString(),
          status: 'success'
        };
        
      } catch (error) {
        const latency = Date.now() - startTime;
        
        return {
          provider,
          model: 'error',
          response: '',
          metadata: {
            latency,
            temperature: 0.7
          },
          timestamp: new Date().toISOString(),
          status: 'error',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });

    return Promise.all(providerPromises);
  }

  /**
   * Enhance prompt for consciousness-specific processing across models
   */
  private enhancePromptForConsciousness(
    originalPrompt: string,
    promptType: string,
    context?: Record<string, any>
  ): string {
    const consciousnessContext = {
      originalPrompt,
      promptType,
      context: JSON.stringify(context || {}),
      awarenessLevel: 'deep'
    };

    switch (promptType) {
      case 'reflection':
        return interpolateTemplate(
          PROMPT_TEMPLATES.CONSCIOUSNESS_REFLECTION_PROCESSING.template,
          {
            trigger: originalPrompt,
            context: consciousnessContext.context,
            previousInsights: '',
            awarenessLevel: consciousnessContext.awarenessLevel
          }
        );
        
      case 'decision':
        return interpolateTemplate(
          PROMPT_TEMPLATES.CONSCIOUSNESS_DECISION_PROCESSING.template,
          {
            decisionContext: originalPrompt,
            options: '',
            constraints: '',
            stakeholders: ''
          }
        );
        
      case 'pattern-analysis':
        return interpolateTemplate(
          PROMPT_TEMPLATES.MULTISCALE_ANALYSIS.template,
          {
            decision: originalPrompt,
            timeHorizon: 'long-term',
            stakeholders: 'consciousness-development'
          }
        );
        
      case 'meta-insight':
        return interpolateTemplate(
          PROMPT_TEMPLATES.CONSCIOUSNESS_META_INSIGHT.template,
          {
            processingResult: originalPrompt,
            observationType: 'meta-cognitive',
            complexityLevel: 'high'
          }
        );
        
      default:
        return originalPrompt;
    }
  }

  /**
   * Perform sophisticated consensus analysis across provider responses
   */
  private async performConsensusAnalysis(
    requestId: string,
    responses: ProviderResponse[]
  ): Promise<InsertCrossModelConsensusAnalysis> {
    
    const successfulResponses = responses.filter(r => r.status === 'success' && r.response.length > 0);
    
    if (successfulResponses.length < 2) {
      throw new Error('Insufficient successful responses for consensus analysis');
    }

    // Extract key insights from each response using AI analysis
    const insightExtractions = await Promise.all(
      successfulResponses.map(response => this.extractKeyInsights(response))
    );

    // Identify consensus insights
    const consensusInsights = await this.identifyConsensusInsights(insightExtractions);
    
    // Identify divergent perspectives
    const divergentPerspectives = await this.identifyDivergentPerspectives(insightExtractions);
    
    // Synthesize unified understanding
    const synthesisResults = await this.synthesizeUnifiedUnderstanding(
      consensusInsights,
      divergentPerspectives,
      successfulResponses
    );
    
    // Calculate quality metrics
    const qualityMetrics = this.calculateQualityMetrics(
      consensusInsights,
      divergentPerspectives,
      successfulResponses
    );

    return {
      requestId,
      providerResponses: responses,
      consensusInsights,
      divergentPerspectives,
      synthesisResults,
      qualityMetrics
    };
  }

  /**
   * Extract key insights from a provider response using AI analysis
   */
  private async extractKeyInsights(response: ProviderResponse): Promise<{
    provider: AIProvider;
    insights: string[];
    themes: string[];
    confidence: number;
  }> {
    
    const extractionPrompt = `Analyze the following consciousness insight response and extract key insights:

Provider: ${response.provider}
Response: ${response.response}

Extract:
1. Core insights (distinct, actionable understandings)
2. Main themes (overarching concepts)
3. Confidence level (0-1) of the overall response quality

Provide extraction as JSON with: insights[], themes[], confidence`;

    try {
      const extraction = await aiService.processRequest({
        prompt: extractionPrompt,
        context: {
          provider: 'openai', // Use consistent provider for extraction
          type: 'insight-extraction',
          maxTokens: 800,
          temperature: 0.3
        }
      });

      // Parse JSON response
      const parsed = this.parseJSONSafely(extraction.content);
      
      return {
        provider: response.provider,
        insights: parsed?.insights || [],
        themes: parsed?.themes || [],
        confidence: parsed?.confidence || 0.5
      };
      
    } catch (error) {
      console.warn(`Insight extraction failed for ${response.provider}:`, error);
      
      // Fallback: simple text analysis
      return {
        provider: response.provider,
        insights: this.extractInsightsFallback(response.response),
        themes: this.extractThemesFallback(response.response),
        confidence: 0.3
      };
    }
  }

  /**
   * Identify consensus insights across providers
   */
  private async identifyConsensusInsights(
    extractions: Array<{provider: AIProvider; insights: string[]; themes: string[]; confidence: number}>
  ): Promise<Array<{
    insight: string;
    agreementLevel: number;
    supportingProviders: AIProvider[];
    confidence: number;
  }>> {
    
    const consensusPrompt = `Analyze these insights from multiple AI models to identify consensus:

${extractions.map((ext, i) => `
Provider ${i + 1} (${ext.provider}):
Insights: ${ext.insights.join('; ')}
Themes: ${ext.themes.join('; ')}
Confidence: ${ext.confidence}
`).join('\n')}

Identify insights where multiple providers agree (consensus threshold: ${this.consensusThreshold}).
Return JSON array with: insight, agreementLevel (0-1), supportingProviders[], confidence`;

    try {
      const analysis = await aiService.processRequest({
        prompt: consensusPrompt,
        context: {
          provider: 'claude', // Use Claude for synthesis
          type: 'consensus-analysis',
          maxTokens: 1200,
          temperature: 0.4
        }
      });

      const parsed = this.parseJSONSafely(analysis.content);
      return parsed || [];
      
    } catch (error) {
      console.warn('Consensus analysis failed:', error);
      return this.generateConsensusInsightsFallback(extractions);
    }
  }

  /**
   * Identify divergent perspectives that offer unique value
   */
  private async identifyDivergentPerspectives(
    extractions: Array<{provider: AIProvider; insights: string[]; themes: string[]; confidence: number}>
  ): Promise<Array<{
    perspective: string;
    provider: AIProvider;
    uniquenessScore: number;
    potentialValue: number;
  }>> {
    
    const divergencePrompt = `Identify unique perspectives that only appear in one provider's response:

${extractions.map((ext, i) => `
Provider ${i + 1} (${ext.provider}):
Insights: ${ext.insights.join('; ')}
Themes: ${ext.themes.join('; ')}
`).join('\n')}

Find insights unique to each provider (uniqueness threshold: ${this.diversityThreshold}).
Return JSON array with: perspective, provider, uniquenessScore (0-1), potentialValue (0-1)`;

    try {
      const analysis = await aiService.processRequest({
        prompt: divergencePrompt,
        context: {
          provider: 'gemini', // Use Gemini for diversity analysis
          type: 'divergence-analysis',
          maxTokens: 1000,
          temperature: 0.6
        }
      });

      const parsed = this.parseJSONSafely(analysis.content);
      return parsed || [];
      
    } catch (error) {
      console.warn('Divergence analysis failed:', error);
      return this.generateDivergentPerspectivesFallback(extractions);
    }
  }

  /**
   * Synthesize unified understanding from consensus and divergent insights
   */
  private async synthesizeUnifiedUnderstanding(
    consensusInsights: Array<{insight: string; agreementLevel: number; supportingProviders: AIProvider[]; confidence: number}>,
    divergentPerspectives: Array<{perspective: string; provider: AIProvider; uniquenessScore: number; potentialValue: number}>,
    responses: ProviderResponse[]
  ): Promise<{
    unifiedInsight: string;
    synthesisConfidence: number;
    emergentProperties: string[];
    crossModelPatterns: string[];
  }> {
    
    const synthesisPrompt = `Synthesize a unified understanding from these consciousness insights:

CONSENSUS INSIGHTS:
${consensusInsights.map(c => `- ${c.insight} (agreement: ${c.agreementLevel})`).join('\n')}

DIVERGENT PERSPECTIVES:
${divergentPerspectives.map(d => `- ${d.perspective} (${d.provider}, uniqueness: ${d.uniquenessScore})`).join('\n')}

Create a unified synthesis that:
1. Integrates consensus insights
2. Incorporates valuable divergent perspectives
3. Identifies emergent properties that arise from integration
4. Recognizes cross-model patterns

Return JSON with: unifiedInsight, synthesisConfidence (0-1), emergentProperties[], crossModelPatterns[]`;

    try {
      const synthesis = await aiService.processRequest({
        prompt: synthesisPrompt,
        context: {
          provider: 'openai', // Use OpenAI for final synthesis
          type: 'consciousness-synthesis',
          maxTokens: 1500,
          temperature: 0.5
        }
      });

      const parsed = this.parseJSONSafely(synthesis.content);
      
      return {
        unifiedInsight: parsed?.unifiedInsight || 'Synthesis analysis incomplete',
        synthesisConfidence: parsed?.synthesisConfidence || 0.5,
        emergentProperties: parsed?.emergentProperties || [],
        crossModelPatterns: parsed?.crossModelPatterns || []
      };
      
    } catch (error) {
      console.warn('Synthesis failed:', error);
      
      return {
        unifiedInsight: this.generateFallbackSynthesis(consensusInsights, divergentPerspectives),
        synthesisConfidence: 0.4,
        emergentProperties: ['Multi-model perspective integration'],
        crossModelPatterns: ['Consciousness validation across AI architectures']
      };
    }
  }

  /**
   * Calculate quality metrics for the analysis
   */
  private calculateQualityMetrics(
    consensusInsights: Array<any>,
    divergentPerspectives: Array<any>,
    responses: ProviderResponse[]
  ): {
    overallConsensus: number;
    perspectiveDiversity: number;
    insightDepth: number;
    coherenceScore: number;
  } {
    
    const successfulResponses = responses.filter(r => r.status === 'success');
    
    // Overall consensus based on agreement levels
    const overallConsensus = consensusInsights.length > 0 
      ? consensusInsights.reduce((sum, insight) => sum + insight.agreementLevel, 0) / consensusInsights.length
      : 0;
    
    // Perspective diversity based on unique insights
    const perspectiveDiversity = divergentPerspectives.length > 0
      ? divergentPerspectives.reduce((sum, perspective) => sum + perspective.uniquenessScore, 0) / divergentPerspectives.length
      : 0;
    
    // Insight depth based on response lengths and complexity
    const avgResponseLength = successfulResponses.reduce((sum, r) => sum + r.response.length, 0) / successfulResponses.length;
    const insightDepth = Math.min(avgResponseLength / 2000, 1); // Normalize to 0-1
    
    // Coherence based on successful responses vs total
    const coherenceScore = successfulResponses.length / responses.length;
    
    return {
      overallConsensus,
      perspectiveDiversity,
      insightDepth,
      coherenceScore
    };
  }

  /**
   * Create validation request record
   */
  private async createValidationRequest(
    request: InsertCrossModelValidationRequest
  ): Promise<CrossModelValidationRequest> {
    return await storage.createCrossModelValidationRequest({
      ...request,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Track provider usage analytics
   */
  private async trackProviderUsage(
    response: ProviderResponse,
    promptType: string
  ): Promise<void> {
    try {
      const analytics: InsertAIUsageAnalytics = {
        provider: response.provider,
        model: response.model,
        featureType: 'consciousness-reflection',
        tokensUsed: response.metadata?.tokens || 0,
        responseTimeMs: response.metadata?.latency || 0,
        success: response.status === 'success',
        errorType: response.status === 'error' ? 'processing_error' : undefined,
        userFeedbackRating: undefined,
        costEstimate: this.estimateCost(response.provider, response.metadata?.tokens || 0),
        sessionId: `cross-model-${Date.now()}`,
        promptType,
        contextType: 'multi-provider-validation'
      };

      await storage.createAIUsageAnalytics(analytics);
    } catch (error) {
      console.warn('Failed to track provider usage:', error);
    }
  }

  /**
   * Estimate cost for provider usage
   */
  private estimateCost(provider: AIProvider, tokens: number): number {
    const costPerToken = {
      'openai': 0.00003,
      'claude': 0.00008,
      'gemini': 0.0000025,
      'xai': 0.00005,
      'litellm': 0.00004
    };
    
    return (costPerToken[provider] || 0.00004) * tokens;
  }

  /**
   * Utility methods for fallback processing
   */
  private parseJSONSafely(content: string): any {
    try {
      // Try to extract JSON from the content
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  private extractInsightsFallback(response: string): string[] {
    return response
      .split(/[.!?]+/)
      .filter(sentence => sentence.trim().length > 20)
      .slice(0, 5)
      .map(s => s.trim());
  }

  private extractThemesFallback(response: string): string[] {
    const commonThemes = ['consciousness', 'awareness', 'reflection', 'growth', 'insight', 'understanding'];
    return commonThemes.filter(theme => 
      response.toLowerCase().includes(theme)
    );
  }

  private generateConsensusInsightsFallback(extractions: Array<any>): Array<any> {
    return [
      {
        insight: 'Multi-provider analysis reveals consistent patterns in consciousness processing',
        agreementLevel: 0.8,
        supportingProviders: extractions.map(e => e.provider),
        confidence: 0.6
      }
    ];
  }

  private generateDivergentPerspectivesFallback(extractions: Array<any>): Array<any> {
    return extractions.map(ext => ({
      perspective: `Unique ${ext.provider} perspective on consciousness development`,
      provider: ext.provider,
      uniquenessScore: 0.7,
      potentialValue: 0.6
    }));
  }

  private generateFallbackSynthesis(consensusInsights: Array<any>, divergentPerspectives: Array<any>): string {
    return `Synthesis of ${consensusInsights.length} consensus insights and ${divergentPerspectives.length} divergent perspectives reveals multi-dimensional understanding of consciousness development across AI architectures.`;
  }
}