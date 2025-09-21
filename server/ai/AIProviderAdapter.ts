import { AIModelConfig, AIProvider } from '../../shared/schema';

/**
 * Base interface for AI requests
 */
export interface AIRequest {
  prompt: string;
  systemPrompt?: string;
  config?: AIModelConfig;
  context?: Record<string, any>;
  stream?: boolean;
}

/**
 * Base interface for AI responses
 */
export interface AIResponse {
  content: string;
  provider: AIProvider;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: 'stop' | 'length' | 'content_filter' | 'tool_calls';
  requestId?: string;
  processingTime?: number;
}

/**
 * Base interface for streaming AI responses
 */
export interface AIStreamResponse {
  content: string;
  delta: string;
  done: boolean;
  provider: AIProvider;
  model: string;
  requestId?: string;
}

/**
 * Base abstract class for AI provider adapters
 * Each provider (OpenAI, Claude, Gemini, etc.) should extend this class
 */
export abstract class AIProviderAdapter {
  protected provider: AIProvider;
  protected apiKey?: string;
  protected baseUrl?: string;
  protected healthy: boolean = true;
  protected lastHealthCheck: Date = new Date();

  constructor(provider: AIProvider, apiKey?: string, baseUrl?: string) {
    this.provider = provider;
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  /**
   * Make a request to the AI provider
   */
  abstract makeRequest(request: AIRequest): Promise<AIResponse>;

  /**
   * Make a streaming request to the AI provider
   */
  abstract makeStreamRequest(request: AIRequest): AsyncIterable<AIStreamResponse>;

  /**
   * Health check for the provider
   */
  abstract checkHealth(): Promise<boolean>;

  /**
   * Get the current health status
   */
  isHealthy(): boolean {
    return this.healthy;
  }

  /**
   * Update provider configuration
   */
  updateConfig(apiKey?: string, baseUrl?: string): void {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  /**
   * Get provider information
   */
  getProviderInfo(): {
    provider: AIProvider;
    healthy: boolean;
    lastHealthCheck: Date;
    hasApiKey: boolean;
  } {
    return {
      provider: this.provider,
      healthy: this.healthy,
      lastHealthCheck: this.lastHealthCheck,
      hasApiKey: Boolean(this.apiKey),
    };
  }

  /**
   * Validate request before sending
   */
  protected validateRequest(request: AIRequest): void {
    if (!request.prompt || request.prompt.trim().length === 0) {
      throw new Error('Prompt is required and cannot be empty');
    }

    if (request.config) {
      if (request.config.temperature < 0 || request.config.temperature > 2) {
        throw new Error('Temperature must be between 0 and 2');
      }

      if (request.config.maxTokens < 1 || request.config.maxTokens > 100000) {
        throw new Error('Max tokens must be between 1 and 100000');
      }
    }
  }

  /**
   * Format error messages consistently
   */
  protected formatError(error: any, context?: string): Error {
    const contextStr = context ? `[${context}] ` : '';
    const message = error?.message || error?.toString() || 'Unknown error';
    return new Error(`${contextStr}${this.provider} provider error: ${message}`);
  }

  /**
   * Log request for debugging/monitoring
   */
  protected logRequest(request: AIRequest, response?: AIResponse, error?: Error): void {
    const logData = {
      provider: this.provider,
      timestamp: new Date().toISOString(),
      prompt: request.prompt.substring(0, 100) + '...',
      config: request.config,
      response: response ? {
        success: true,
        model: response.model,
        usage: response.usage,
        processingTime: response.processingTime,
      } : undefined,
      error: error ? {
        success: false,
        message: error.message,
      } : undefined,
    };

    // In a real implementation, this would go to a proper logging system
    console.log('AI Request Log:', JSON.stringify(logData, null, 2));
  }
}

/**
 * Placeholder implementation for development/testing
 * This would be replaced by actual provider implementations
 */
export class PlaceholderAIAdapter extends AIProviderAdapter {
  constructor(provider: AIProvider) {
    super(provider);
  }

  async makeRequest(request: AIRequest): Promise<AIResponse> {
    this.validateRequest(request);

    const startTime = Date.now();

    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 500));

      const response: AIResponse = {
        content: `[${this.provider.toUpperCase()} PLACEHOLDER] Response to: "${request.prompt.substring(0, 50)}..."`,
        provider: this.provider,
        model: request.config?.model || 'placeholder-model',
        usage: {
          promptTokens: Math.floor(request.prompt.length / 4),
          completionTokens: 100,
          totalTokens: Math.floor(request.prompt.length / 4) + 100,
        },
        finishReason: 'stop',
        requestId: `${this.provider}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        processingTime: Date.now() - startTime,
      };

      this.logRequest(request, response);
      return response;

    } catch (error) {
      const formattedError = this.formatError(error, 'makeRequest');
      this.logRequest(request, undefined, formattedError);
      throw formattedError;
    }
  }

  async* makeStreamRequest(request: AIRequest): AsyncIterable<AIStreamResponse> {
    this.validateRequest(request);

    const words = `[${this.provider.toUpperCase()} STREAMING PLACEHOLDER] Response to: "${request.prompt.substring(0, 50)}..."`.split(' ');
    const requestId = `${this.provider}-stream-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    let content = '';
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const delta = (i === 0 ? word : ' ' + word);
      content += delta;

      yield {
        content,
        delta,
        done: false,
        provider: this.provider,
        model: request.config?.model || 'placeholder-model',
        requestId,
      };

      // Simulate streaming delay
      await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
    }

    // Final chunk
    yield {
      content,
      delta: '',
      done: true,
      provider: this.provider,
      model: request.config?.model || 'placeholder-model',
      requestId,
    };
  }

  async checkHealth(): Promise<boolean> {
    try {
      // Simulate health check
      await new Promise(resolve => setTimeout(resolve, 10));
      this.healthy = true;
      this.lastHealthCheck = new Date();
      return true;
    } catch (error) {
      this.healthy = false;
      return false;
    }
  }
}