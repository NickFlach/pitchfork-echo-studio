import axios, { AxiosInstance } from 'axios';
import { AIProviderAdapter, AIRequest, AIResponse, AIStreamResponse } from '../AIProviderAdapter';
import { AIProvider } from '../../../shared/schema';

/**
 * LiteLLM Proxy Provider Adapter
 * Implements LiteLLM proxy integration for accessing 100+ AI models through a unified interface
 * Uses OpenAI-compatible API format with LiteLLM proxy
 */
export class LiteLLMAdapter extends AIProviderAdapter {
  private client: AxiosInstance | null = null;
  private proxyBaseUrl: string;

  constructor(apiKey?: string, baseUrl?: string) {
    super('litellm', apiKey, baseUrl);
    this.proxyBaseUrl = baseUrl || process.env.LITELLM_API_BASE || '';
    if (this.proxyBaseUrl) {
      this.initializeClient();
    } else {
      console.warn('LiteLLM adapter: No proxy base URL provided. Set LITELLM_API_BASE environment variable or provide baseUrl parameter.');
    }
  }

  private initializeClient(): void {
    const key = this.apiKey || process.env.LITELLM_API_KEY || 'sk-1234'; // LiteLLM proxy might not require auth
    
    this.client = axios.create({
      baseURL: this.proxyBaseUrl,
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000,
    });
    this.apiKey = key;
  }

  async makeRequest(request: AIRequest, signal?: AbortSignal): Promise<AIResponse> {
    this.validateRequest(request);

    if (!this.client) {
      throw this.formatError(new Error('LiteLLM client not initialized. Please provide LITELLM_API_BASE and optionally LITELLM_API_KEY.'));
    }

    const startTime = Date.now();

    try {
      const messages: Array<{ role: string; content: string }> = [];
      
      if (request.systemPrompt) {
        messages.push({ role: 'system', content: request.systemPrompt });
      }
      
      messages.push({ role: 'user', content: request.prompt });

      // LiteLLM uses provider/model format for cross-provider support
      // Examples: "openai/gpt-4", "anthropic/claude-3-sonnet-20240229", "google/gemini-pro"
      const model = request.config?.model || 'openai/gpt-3.5-turbo';

      const effectiveSignal = signal || request.signal;
      const response = await this.client.post('/chat/completions', {
        model,
        messages,
        temperature: request.config?.temperature || 0.7,
        max_tokens: request.config?.maxTokens || 4000,
        stream: false,
      }, {
        signal: effectiveSignal
      });

      const data = response.data;
      const choice = data.choices?.[0];
      const content = choice?.message?.content || '';

      const aiResponse: AIResponse = {
        content,
        provider: this.provider,
        model: data.model || model,
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
        },
        finishReason: choice?.finish_reason || 'stop',
        requestId: data.id || `litellm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        processingTime: Date.now() - startTime,
      };

      this.logRequest(request, aiResponse);
      return aiResponse;

    } catch (error: any) {
      const formattedError = this.formatError(error, 'makeRequest');
      this.logRequest(request, undefined, formattedError);
      
      // Update health status based on error type
      if (error?.response?.status === 401 || error?.response?.status === 403 || error?.code === 'ECONNREFUSED') {
        this.healthy = false;
      }
      
      throw formattedError;
    }
  }

  async* makeStreamRequest(request: AIRequest, signal?: AbortSignal): AsyncIterable<AIStreamResponse> {
    this.validateRequest(request);

    if (!this.client) {
      throw this.formatError(new Error('LiteLLM client not initialized. Please provide LITELLM_API_BASE and optionally LITELLM_API_KEY.'));
    }

    try {
      const messages: Array<{ role: string; content: string }> = [];
      
      if (request.systemPrompt) {
        messages.push({ role: 'system', content: request.systemPrompt });
      }
      
      messages.push({ role: 'user', content: request.prompt });

      const model = request.config?.model || 'openai/gpt-3.5-turbo';

      const effectiveSignal = signal || request.signal;
      const response = await this.client.post('/chat/completions', {
        model,
        messages,
        temperature: request.config?.temperature || 0.7,
        max_tokens: request.config?.maxTokens || 4000,
        stream: true,
      }, {
        responseType: 'stream',
        signal: effectiveSignal
      });

      // Use proper async iterator for streaming
      yield* this.createStreamIterator(response.data, model);

    } catch (error: any) {
      // If streaming fails, fall back to regular request and simulate streaming
      try {
        const fullResponse = await this.makeRequest(request);
        const words = fullResponse.content.split(' ');
        
        let content = '';
        for (let i = 0; i < words.length; i++) {
          const word = words[i];
          const delta = (i === 0 ? word : ' ' + word);
          content += delta;

          yield {
            content,
            delta,
            done: i === words.length - 1,
            provider: this.provider,
            model: fullResponse.model,
            requestId: fullResponse.requestId || `litellm-fallback-${Date.now()}`,
          };

          // Simulate streaming delay
          await new Promise(resolve => setTimeout(resolve, 30));
        }
      } catch (fallbackError: any) {
        const formattedError = this.formatError(fallbackError, 'makeStreamRequest');
        
        if (error?.response?.status === 401 || error?.response?.status === 403 || error?.code === 'ECONNREFUSED') {
          this.healthy = false;
        }
        
        throw formattedError;
      }
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      if (!this.client) {
        this.healthy = false;
        return false;
      }

      // Check if LiteLLM proxy is accessible
      const response = await this.client.get('/health', { timeout: 5000 }).catch(() => {
        // If /health endpoint doesn't exist, try a simple completion
        return this.client!.post('/chat/completions', {
          model: 'openai/gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 1,
          temperature: 0,
        });
      });

      this.healthy = true;
      this.lastHealthCheck = new Date();
      return true;

    } catch (error: any) {
      this.healthy = false;
      console.warn(`LiteLLM health check failed: ${error?.message || error}`);
      return false;
    }
  }

  updateConfig(apiKey?: string, baseUrl?: string): void {
    super.updateConfig(apiKey, baseUrl);
    if (baseUrl) {
      this.proxyBaseUrl = baseUrl;
    }
    this.initializeClient();
  }

  /**
   * Create proper async iterator from Node.js stream for LiteLLM SSE responses
   */
  private async* createStreamIterator(stream: any, model: string): AsyncIterable<AIStreamResponse> {
    let content = '';
    let requestId = `litellm-stream-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    let buffer = '';
    
    // Convert Node.js stream to async iterable
    const streamQueue: AIStreamResponse[] = [];
    let streamEnded = false;
    let streamError: Error | null = null;
    
    stream.on('data', (chunk: Buffer) => {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim() === '') continue;
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            streamQueue.push({
              content,
              delta: '',
              done: true,
              provider: this.provider,
              model,
              requestId,
            });
            streamEnded = true;
            return;
          }
          
          try {
            const parsed = JSON.parse(data);
            const choice = parsed.choices?.[0];
            const delta = choice?.delta?.content || '';
            
            if (delta) {
              content += delta;
              requestId = parsed.id || requestId;
              
              streamQueue.push({
                content,
                delta,
                done: false,
                provider: this.provider,
                model: parsed.model || model,
                requestId,
              });
            }
          } catch (e) {
            // Ignore JSON parse errors in streaming
          }
        }
      }
    });
    
    stream.on('end', () => {
      streamEnded = true;
    });
    
    stream.on('error', (error: Error) => {
      streamError = error;
      streamEnded = true;
    });
    
    // Yield chunks as they become available
    let yieldedCount = 0;
    while (!streamEnded || yieldedCount < streamQueue.length) {
      if (streamError) {
        throw streamError;
      }
      
      if (yieldedCount < streamQueue.length) {
        const chunk = streamQueue[yieldedCount];
        yield chunk;
        yieldedCount++;
        
        if (chunk.done) {
          break;
        }
      } else {
        // Wait for more data
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
  }

  /**
   * Get supported models from LiteLLM proxy
   * This is a LiteLLM-specific feature
   */
  async getSupportedModels(): Promise<string[]> {
    try {
      if (!this.client) {
        return [];
      }

      const response = await this.client.get('/models');
      const models = response.data?.data || [];
      return models.map((model: any) => model.id || model.model);
    } catch (error) {
      console.warn('Failed to fetch supported models from LiteLLM:', error);
      return [];
    }
  }
}