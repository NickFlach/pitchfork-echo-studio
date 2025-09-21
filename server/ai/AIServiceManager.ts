import { AISettings, AIProvider, AIModelConfig } from '../../shared/schema';
import { storage } from '../storage';
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

  constructor() {
    // Initialize all providers on startup
    this.initializeProviders();
  }

  /**
   * Initialize all available AI provider adapters
   */
  private initializeProviders(): void {
    try {
      // Initialize OpenAI adapter
      const openaiAdapter = new OpenAIAdapter();
      this.registerProvider('openai', openaiAdapter);

      // Initialize Claude adapter
      const claudeAdapter = new ClaudeAdapter();
      this.registerProvider('claude', claudeAdapter);

      // Initialize Gemini adapter
      const geminiAdapter = new GeminiAdapter();
      this.registerProvider('gemini', geminiAdapter);

      // Initialize xAI adapter
      const xaiAdapter = new XAIAdapter();
      this.registerProvider('xai', xaiAdapter);

      // Initialize LiteLLM adapter
      const litellmAdapter = new LiteLLMAdapter();
      this.registerProvider('litellm', litellmAdapter);

      console.log('AI Service Manager: All providers initialized');
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
          return;
          
        } finally {
          clearTimeout(timeoutId);
        }
        
      } catch (error) {
        lastError = error as Error;
        
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
   * Public generate method - main entry point for AI generation
   * Applies routing policy with retry logic, timeouts, and fallback chain
   */
  async generate(request: AIRequest): Promise<AIResponse> {
    return this.makeRequest(request);
  }

  /**
   * Public streaming generate method - main entry point for streaming AI generation
   * Applies routing policy with retry logic, timeouts, and fallback chain
   */
  async* generateStream(request: AIRequest): AsyncIterable<AIStreamResponse> {
    yield* this.makeStreamRequest(request);
  }

  /**
   * Make an AI request with automatic routing, fallback, and retry logic
   */
  async makeRequest(request: AIRequest): Promise<AIResponse> {
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
    const adapter = this.providers.get(provider);
    if (!adapter) {
      throw new Error(`Provider ${provider} not registered`);
    }

    const { retry, timeoutMs } = settings.routing;
    const providerConfig = settings.providerPrefs[provider] || this.getDefaultConfig(provider);

    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= retry.maxAttempts; attempt++) {
      try {
        // Add timeout to the request
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
        });

        const requestPromise = adapter.makeRequest({
          ...request,
          config: providerConfig,
        });

        return await Promise.race([requestPromise, timeoutPromise]);
        
      } catch (error) {
        lastError = error as Error;
        
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
}

// Export singleton instance
export const aiService = new AIServiceManager();