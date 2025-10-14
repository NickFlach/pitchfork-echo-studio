import { AISettings, AIProvider, AIModelConfig } from '../../shared/schema';
import { storage } from '../storage';
import type { InsertAIUsageAnalytics } from '../../shared/schema';
import { AIProviderAdapter, AIResponse, AIRequest, AIStreamResponse } from './AIProviderAdapter';
import { OpenAIAdapter } from './providers/OpenAIAdapter';
import { ClaudeAdapter } from './providers/ClaudeAdapter';
import { GeminiAdapter } from './providers/GeminiAdapter';
import { XAIAdapter } from './providers/XAIAdapter';
import { LiteLLMAdapter } from './providers/LiteLLMAdapter';

/**
 * Main AI Service Manager - handles routing, fallbacks, and provider selection
 * Implements multi-provider AI system with intelligent routing and retry logic
 */
export class AIServiceManager {
  private providers: Map<AIProvider, AIProviderAdapter> = new Map();
  private currentSettings: AISettings | null = null;
  private circuitBreakers: Map<AIProvider, { failures: number; openUntil: number }> = new Map();
  private maxFailuresBeforeOpen = 5;
  private breakerOpenMs = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Initialize all providers on startup (async, but don't wait)
    this.initializeProviders().catch(error => {
      console.error('AI Service Manager: Failed to initialize providers:', error);
    });
  }

  /**
   * Initialize all available AI provider adapters with stored credentials
   */
  private async initializeProviders(): Promise<void> {
    try {
      console.log('AI Service Manager: Initializing providers with stored credentials...');
      
      // Load all stored credentials
      const allCredentials = await storage.getAllAICredentials();
      const credentialMap = new Map();
      
      for (const cred of allCredentials) {
        const decryptedKey = await storage.getDecryptedAPIKey(cred.provider);
        if (decryptedKey && decryptedKey !== 'placeholder-key') {
          credentialMap.set(cred.provider, {
            apiKey: decryptedKey,
            baseUrl: cred.baseUrl
          });
        }
      }
      
      // Initialize providers with stored credentials or fallback to env vars
      const providers = [
        { name: 'openai' as AIProvider, envKey: 'OPENAI_API_KEY', AdapterClass: OpenAIAdapter },
        { name: 'claude' as AIProvider, envKey: 'ANTHROPIC_API_KEY', AdapterClass: ClaudeAdapter },
        { name: 'gemini' as AIProvider, envKey: 'GOOGLE_AI_API_KEY', AdapterClass: GeminiAdapter },
        { name: 'xai' as AIProvider, envKey: 'XAI_API_KEY', AdapterClass: XAIAdapter },
        { name: 'litellm' as AIProvider, envKey: 'LITELLM_API_KEY', AdapterClass: LiteLLMAdapter }
      ];
      
      for (const { name, envKey, AdapterClass } of providers) {
        try {
          const storedCred = credentialMap.get(name);
          const apiKey = storedCred?.apiKey || process.env[envKey];
          const baseUrl = storedCred?.baseUrl;
          
          let adapter: AIProviderAdapter;
          if (name === 'xai' || name === 'litellm') {
            adapter = new AdapterClass(apiKey, baseUrl);
          } else {
            adapter = new AdapterClass(apiKey);
          }
          
          this.registerProvider(name, adapter);
          
          const source = storedCred ? 'stored credentials' : 'environment variables';
          console.log(`AI Service Manager: Initialized ${name} provider from ${source}`);
        } catch (error) {
          console.warn(`AI Service Manager: Failed to initialize ${name} provider:`, error);
          // Continue with other providers
        }
      }
      
      console.log('AI Service Manager: Provider initialization completed');
    } catch (error) {
      console.error('AI Service Manager: Error initializing providers:', error);
    }
  }

  /**
   * Register an AI provider adapter
   */
  registerProvider(provider: AIProvider, adapter: AIProviderAdapter): void {
    this.providers.set(provider, adapter);
    console.log(`AI Service Manager: Registered ${provider} provider`);
    // initialize circuit breaker state
    if (!this.circuitBreakers.has(provider)) {
      this.circuitBreakers.set(provider, { failures: 0, openUntil: 0 });
    }
  }

  /**
   * Update provider configuration (API keys, base URLs, etc.)
   */
  updateProviderConfig(provider: AIProvider, apiKey?: string, baseUrl?: string): void {
    const adapter = this.providers.get(provider);
    if (adapter) {
      adapter.updateConfig(apiKey, baseUrl);
      console.log(`AI Service Manager: Updated configuration for ${provider} provider`);
    } else {
      console.warn(`AI Service Manager: Provider ${provider} not found for config update`);
    }
  }

  /**
   * Reinitialize a specific provider (useful for API key updates)
   */
  reinitializeProvider(provider: AIProvider, apiKey?: string, baseUrl?: string): void {
    try {
      let adapter: AIProviderAdapter;

      switch (provider) {
        case 'openai':
          adapter = new OpenAIAdapter(apiKey);
          break;
        case 'claude':
          adapter = new ClaudeAdapter(apiKey);
          break;
        case 'gemini':
          adapter = new GeminiAdapter(apiKey);
          break;
        case 'xai':
          adapter = new XAIAdapter(apiKey, baseUrl);
          break;
        case 'litellm':
          adapter = new LiteLLMAdapter(apiKey, baseUrl);
          break;
        default:
          throw new Error(`Unknown provider: ${provider}`);
      }

      this.registerProvider(provider, adapter);
      console.log(`AI Service Manager: Reinitialized ${provider} provider`);
    } catch (error) {
      console.error(`AI Service Manager: Error reinitializing ${provider} provider:`, error);
    }
  }

  /**
   * Get current AI settings from storage
   */
  private async getSettings(): Promise<AISettings> {
    if (!this.currentSettings) {
      this.currentSettings = await storage.getAISettings();
      
      // If no settings exist, use defaults
      if (!this.currentSettings) {
        const defaultSettings: AISettings = {
          id: 'default',
          mode: 'direct',
          routing: {
            primary: 'openai',
            fallbacks: ['claude', 'gemini'],
            timeoutMs: 30000,
            retry: {
              maxAttempts: 3,
              backoffMs: 1000,
            },
          },
          providerPrefs: {},
          updatedAt: new Date().toISOString(),
        };
        
        // Cache the default settings
        this.currentSettings = defaultSettings;
      }
    }
    
    return this.currentSettings;
  }

  /**
   * Refresh settings cache
   */
  async refreshSettings(): Promise<void> {
    this.currentSettings = null;
    await this.getSettings();
  }
  
  /**
   * Refresh configuration - reload credentials and reinitialize providers
   */
  async refreshConfiguration(): Promise<void> {
    console.log('AI Service Manager: Refreshing configuration...');
    
    try {
      // Clear current settings cache
      this.currentSettings = null;
      
      // Reinitialize all providers with latest credentials
      await this.initializeProviders();
      
      console.log('AI Service Manager: Configuration refresh completed');
    } catch (error) {
      console.error('AI Service Manager: Failed to refresh configuration:', error);
      throw error;
    }
  }

  /**
   * Make a streaming AI request with automatic routing, fallback, and retry logic
   */
  async* makeStreamRequest(request: AIRequest): AsyncIterable<AIStreamResponse> {
    const settings = await this.getSettings();
    const { routing } = settings;
    
    // Try primary provider first
    let lastError: Error | null = null;
    
    try {
      yield* this.attemptProviderStreamRequest(routing.primary, request, settings);
      return;
    } catch (error) {
      lastError = error as Error;
      console.warn(`Primary provider ${routing.primary} streaming failed:`, error);
    }
    
    // Try fallback providers
    for (const fallbackProvider of routing.fallbacks) {
      if (fallbackProvider === routing.primary) continue; // Skip if same as primary
      
      try {
        console.log(`Attempting fallback provider for streaming: ${fallbackProvider}`);
        yield* this.attemptProviderStreamRequest(fallbackProvider, request, settings);
        return;
      } catch (error) {
        lastError = error as Error;
        console.warn(`Fallback provider ${fallbackProvider} streaming failed:`, error);
      }
    }
    
    // All providers failed
    throw new Error(`All AI providers failed for streaming. Last error: ${lastError?.message || 'Unknown error'}`);
  }

  /**
   * Attempt streaming request with a specific provider, including retry logic and timeout
   */
  private async* attemptProviderStreamRequest(
    provider: AIProvider, 
    request: AIRequest, 
    settings: AISettings
  ): AsyncIterable<AIStreamResponse> {
    // Circuit breaker
    if (this.isCircuitOpen(provider)) {
      throw new Error(`Circuit open for provider ${provider}`);
    }
    const adapter = this.providers.get(provider);
    if (!adapter) {
      throw new Error(`Provider ${provider} not registered`);
    }

    const { retry, timeoutMs } = settings.routing;
    const providerConfig = settings.providerPrefs[provider] || this.getDefaultConfig(provider);

    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= retry.maxAttempts; attempt++) {
      try {
        // Create timeout controller
        const abortController = new AbortController();
        const timeoutId = setTimeout(() => {
          abortController.abort();
        }, timeoutMs);

        try {
          // Start the streaming request
          const streamIterator = adapter.makeStreamRequest({
            ...request,
            config: providerConfig,
          });

          // Yield chunks with timeout monitoring
          const start = Date.now();
          for await (const chunk of streamIterator) {
            if (abortController.signal.aborted) {
              throw new Error('Request timeout during streaming');
            }
            yield chunk;
            
            // If stream is done, we can clear the timeout and return
            if (chunk.done) {
              clearTimeout(timeoutId);
              return;
            }
          }
          
          clearTimeout(timeoutId);
          this.onProviderSuccess(provider);
          const latency = Date.now() - start;
          await this.persistProviderPerformance(provider, {
            successRate: 1,
            avgLatencyMs: latency,
          });
          return;
          
        } finally {
          clearTimeout(timeoutId);
        }
        
      } catch (error) {
        lastError = error as Error;
        this.onProviderFailure(provider);
        
        if (attempt < retry.maxAttempts) {
          // Exponential backoff with jitter
          const backoffTime = retry.backoffMs * Math.pow(2, attempt - 1) + Math.random() * 1000;
          console.log(`Retrying ${provider} streaming in ${Math.round(backoffTime)}ms (attempt ${attempt + 1}/${retry.maxAttempts})`);
          await this.sleep(backoffTime);
        }
      }
    }
    
    throw lastError || new Error(`Provider ${provider} streaming failed after ${retry.maxAttempts} attempts`);
  }

  /**
   * Enhanced generate method with analytics tracking and metadata collection
   * Main entry point for AI generation with usage analytics
   */
  async generate(request: AIRequest & {
    sessionId?: string;
    featureType?: 'consciousness-reflection' | 'leadership-strategy' | 'decision-analysis' | 'corruption-detection' | 'campaign-planning';
    userId?: string;
  }): Promise<AIResponse & { analytics?: any }> {
    const startTime = Date.now();
    const requestId = `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const sessionId = request.sessionId || `session-${Date.now()}`;
    
    let response: AIResponse;
    let fallbackUsed = false;
    let fallbackProvider: string | undefined;
    let primaryProvider: string | undefined;
    
    try {
      // Get current settings to determine primary provider
      const settings = await this.getSettings();
      primaryProvider = settings.routing.primary;
      
      // Make the actual request
      response = await this.makeRequestWithAnalytics(request, requestId);
      
      // Check if a fallback was used by comparing actual provider vs primary
      if (response.provider !== primaryProvider) {
        fallbackUsed = true;
        fallbackProvider = response.provider;
      }
      
    } catch (error) {
      // Create analytics for failed request
      if (request.featureType) {
        await this.createUsageAnalytics({
          sessionId,
          featureType: request.featureType,
          aiProvider: primaryProvider as any || 'unknown',
          modelUsed: 'unknown',
          requestType: 'standard',
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          responseTimeMs: Date.now() - startTime,
          success: false,
          errorType: error instanceof Error ? error.message : 'Unknown error',
          fallbackUsed: false,
          userId: request.userId,
        });
      }
      throw error;
    }
    
    // Create success analytics
    if (request.featureType) {
      const analytics = await this.createUsageAnalytics({
        sessionId,
        featureType: request.featureType,
        aiProvider: response.provider,
        modelUsed: response.model,
        requestType: 'standard',
        promptTokens: response.usage?.promptTokens || 0,
        completionTokens: response.usage?.completionTokens || 0,
        totalTokens: response.usage?.totalTokens || 0,
        responseTimeMs: Date.now() - startTime,
        success: true,
        fallbackUsed,
        fallbackProvider: fallbackProvider as any,
        userId: request.userId,
        userContext: {
          consciousnessLevel: this.inferConsciousnessLevel(request.featureType),
          decisionComplexity: this.inferDecisionComplexity(request),
          urgencyLevel: 'medium',
        },
      });
      
      return {
        ...response,
        analytics,
      };
    }
    
    return response;
  }

  /**
   * Public streaming generate method - main entry point for streaming AI generation
   * Applies routing policy with retry logic, timeouts, and fallback chain
   */
  async* generateStream(request: AIRequest): AsyncIterable<AIStreamResponse> {
    yield* this.makeStreamRequest(request);
  }

  /**
   * Enhanced makeRequest with analytics tracking
   */
  async makeRequestWithAnalytics(request: AIRequest, requestId: string): Promise<AIResponse> {
    return this.makeRequest(request, requestId);
  }

  /**
   * Make an AI request with automatic routing, fallback, and retry logic
   */
  async makeRequest(request: AIRequest, requestId?: string): Promise<AIResponse> {
    const settings = await this.getSettings();
    const { routing } = settings;
    
    // Try primary provider first
    let lastError: Error | null = null;
    
    try {
      return await this.attemptProviderRequest(routing.primary, request, settings);
    } catch (error) {
      lastError = error as Error;
      console.warn(`Primary provider ${routing.primary} failed:`, error);
    }
    
    // Try fallback providers
    for (const fallbackProvider of routing.fallbacks) {
      if (fallbackProvider === routing.primary) continue; // Skip if same as primary
      
      try {
        console.log(`Attempting fallback provider: ${fallbackProvider}`);
        return await this.attemptProviderRequest(fallbackProvider, request, settings);
      } catch (error) {
        lastError = error as Error;
        console.warn(`Fallback provider ${fallbackProvider} failed:`, error);
      }
    }
    
    // All providers failed
    throw new Error(`All AI providers failed. Last error: ${lastError?.message || 'Unknown error'}`);
  }

  /**
   * Attempt request with a specific provider, including retry logic
   */
  private async attemptProviderRequest(
    provider: AIProvider, 
    request: AIRequest, 
    settings: AISettings
  ): Promise<AIResponse> {
    // Circuit breaker
    if (this.isCircuitOpen(provider)) {
      throw new Error(`Circuit open for provider ${provider}`);
    }
    const adapter = this.providers.get(provider);
    if (!adapter) {
      throw new Error(`Provider ${provider} not registered`);
    }

    const { retry, timeoutMs } = settings.routing;
    const providerConfig = this.applyBudgetCaps(
      settings.providerPrefs[provider] || this.getDefaultConfig(provider),
      settings
    );

    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= retry.maxAttempts; attempt++) {
      try {
        // Add timeout to the request
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
        });

        const startedAt = Date.now();
        const requestPromise = adapter.makeRequest({
          ...request,
          config: providerConfig,
        });

        const response = await Promise.race([requestPromise, timeoutPromise]);
        this.onProviderSuccess(provider);
        const latency = Date.now() - startedAt;
        // Persist provider performance snapshot (best-effort)
        await this.persistProviderPerformance(provider, {
          successRate: 1,
          avgLatencyMs: latency,
          totalTokens: (response as any)?.usage?.totalTokens,
        });
        
        // Enhance response with request metadata
        return {
          ...response,
          requestId: requestId || response.requestId,
          provider: provider, // Ensure provider is set correctly
        };
        
      } catch (error) {
        lastError = error as Error;
        this.onProviderFailure(provider);
        
        if (attempt < retry.maxAttempts) {
          // Wait before retrying (with exponential backoff)
          const backoffTime = retry.backoffMs * Math.pow(2, attempt - 1);
          console.log(`Retrying ${provider} in ${backoffTime}ms (attempt ${attempt + 1}/${retry.maxAttempts})`);
          await this.sleep(backoffTime);
        }
      }
    }
    
    throw lastError || new Error(`Provider ${provider} failed after ${retry.maxAttempts} attempts`);
  }

  /**
   * Get default configuration for a provider
   */
  private getDefaultConfig(provider: AIProvider): AIModelConfig {
    const defaults: Record<AIProvider, AIModelConfig> = {
      openai: { provider: 'openai', model: 'gpt-4', temperature: 0.7, maxTokens: 4000 },
      claude: { provider: 'claude', model: 'claude-3-sonnet-20240229', temperature: 0.7, maxTokens: 4000 },
      gemini: { provider: 'gemini', model: 'gemini-pro', temperature: 0.7, maxTokens: 4000 },
      xai: { provider: 'xai', model: 'grok-beta', temperature: 0.7, maxTokens: 4000 },
      litellm: { provider: 'litellm', model: 'gpt-4', temperature: 0.7, maxTokens: 4000 },
    };
    
    return defaults[provider];
  }

  // Apply budget caps from settings (basic: respect costOptimization by limiting maxTokens)
  private applyBudgetCaps(config: AIModelConfig, settings: AISettings): AIModelConfig {
    const capped = { ...config };
    if ((settings as any).costOptimization) {
      // Ensure a reasonable upper bound on tokens
      const MAX_TOKENS = 2000;
      if (!capped.maxTokens || capped.maxTokens > MAX_TOKENS) {
        capped.maxTokens = MAX_TOKENS;
      }
      // Lower temperature slightly for determinism/cost
      if (typeof capped.temperature === 'number' && capped.temperature > 0.7) {
        capped.temperature = 0.7;
      }
    }
    return capped;
  }

  // Circuit breaker helpers
  private isCircuitOpen(provider: AIProvider): boolean {
    const st = this.circuitBreakers.get(provider);
    if (!st) return false;
    const now = Date.now();
    return st.openUntil > now;
  }

  private onProviderFailure(provider: AIProvider): void {
    const now = Date.now();
    const st = this.circuitBreakers.get(provider) || { failures: 0, openUntil: 0 };
    st.failures += 1;
    if (st.failures >= this.maxFailuresBeforeOpen) {
      st.openUntil = now + this.breakerOpenMs;
      st.failures = 0;
      console.warn(`Circuit opened for provider ${provider} until ${new Date(st.openUntil).toISOString()}`);
    }
    this.circuitBreakers.set(provider, st);
  }

  private onProviderSuccess(provider: AIProvider): void {
    const st = this.circuitBreakers.get(provider) || { failures: 0, openUntil: 0 };
    st.failures = 0;
    st.openUntil = 0;
    this.circuitBreakers.set(provider, st);
  }

  // Persist provider performance snapshot (best-effort)
  private async persistProviderPerformance(provider: AIProvider, data: {
    successRate?: number;
    avgLatencyMs?: number;
    totalTokens?: number;
  }): Promise<void> {
    try {
      await storage.createAIProviderPerformance({
        provider,
        timeWindow: 'instant',
        successRate: data.successRate ?? 1,
        avgLatencyMs: data.avgLatencyMs ?? 0,
        errorRate: data.successRate !== undefined ? (1 - data.successRate) : 0,
        avgCostCents: 0,
        avgTokens: data.totalTokens ?? 0,
      } as any);
    } catch (e) {
      // swallow
    }
  }

  /**
   * Utility method for sleeping/waiting
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get status of all registered providers
   */
  getProviderStatus(): Record<AIProvider, boolean> {
    const status: Record<string, boolean> = {};
    
    for (const [provider, adapter] of this.providers.entries()) {
      status[provider] = adapter.isHealthy();
    }
    
    return status as Record<AIProvider, boolean>;
  }

  /**
   * Health check for the AI service
   */
  async healthCheck(): Promise<{ 
    status: 'healthy' | 'degraded' | 'unhealthy';
    providers: Record<AIProvider, boolean>;
    settings: AISettings;
  }> {
    const providerStatus = this.getProviderStatus();
    const settings = await this.getSettings();
    
    const healthyProviders = Object.values(providerStatus).filter(Boolean).length;
    const totalProviders = Object.values(providerStatus).length;
    
    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (healthyProviders === totalProviders) {
      status = 'healthy';
    } else if (healthyProviders > 0) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }
    
    return {
      status,
      providers: providerStatus,
      settings,
    };
  }

  /**
   * Create usage analytics record
   */
  private async createUsageAnalytics(data: InsertAIUsageAnalytics) {
    try {
      return await storage.createAIUsageAnalytics(data);
    } catch (error) {
      console.warn('Failed to create usage analytics:', error);
      return null;
    }
  }

  /**
   * Infer consciousness level from feature type
   */
  private inferConsciousnessLevel(featureType?: string): 'reactive' | 'adaptive' | 'creative' | 'integrative' | 'transcendent' {
    switch (featureType) {
      case 'consciousness-reflection':
        return 'transcendent';
      case 'leadership-strategy':
        return 'integrative';
      case 'decision-analysis':
        return 'creative';
      case 'corruption-detection':
        return 'adaptive';
      default:
        return 'reactive';
    }
  }

  /**
   * Infer decision complexity from request
   */
  private inferDecisionComplexity(request: AIRequest): 'simple' | 'moderate' | 'complex' | 'multiscale' {
    const promptLength = request.prompt?.length || 0;
    const hasContext = Boolean(request.context && Object.keys(request.context).length > 0);
    const hasSystemPrompt = Boolean(request.systemPrompt);
    
    if (promptLength > 1000 && hasContext && hasSystemPrompt) {
      return 'multiscale';
    } else if (promptLength > 500 && (hasContext || hasSystemPrompt)) {
      return 'complex';
    } else if (promptLength > 200) {
      return 'moderate';
    }
    return 'simple';
  }
}

// Export singleton instance
export const aiService = new AIServiceManager();