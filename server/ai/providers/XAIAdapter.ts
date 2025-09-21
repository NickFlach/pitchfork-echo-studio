import axios, { AxiosInstance } from 'axios';
import { AIProviderAdapter, AIRequest, AIResponse, AIStreamResponse } from '../AIProviderAdapter';
import { AIProvider } from '../../../shared/schema';

/**
 * xAI (Grok) Provider Adapter
 * Implements xAI's Grok models using HTTP requests to xAI's API
 */
export class XAIAdapter extends AIProviderAdapter {
  private client: AxiosInstance | null = null;
  private readonly apiBaseUrl = 'https://api.x.ai/v1';

  constructor(apiKey?: string, baseUrl?: string) {
    super('xai', apiKey, baseUrl);
    this.initializeClient();
  }

  private initializeClient(): void {
    const key = this.apiKey || process.env.XAI_API_KEY;
    const url = this.baseUrl || this.apiBaseUrl;
    
    if (key) {
      this.client = axios.create({
        baseURL: url,
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        timeout: 60000,
      });
      this.apiKey = key;
    }
  }

  async makeRequest(request: AIRequest, signal?: AbortSignal): Promise<AIResponse> {
    this.validateRequest(request);

    if (!this.client) {
      throw this.formatError(new Error('xAI client not initialized. Please provide XAI_API_KEY.'));
    }

    const startTime = Date.now();

    try {
      const messages: Array<{ role: string; content: string }> = [];
      
      if (request.systemPrompt) {
        messages.push({ role: 'system', content: request.systemPrompt });
      }
      
      messages.push({ role: 'user', content: request.prompt });

      const effectiveSignal = signal || request.signal;
      const response = await this.client.post('/chat/completions', {
        model: request.config?.model || 'grok-beta',
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
        model: data.model || request.config?.model || 'grok-beta',
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
        },
        finishReason: choice?.finish_reason || 'stop',
        requestId: data.id || `xai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        processingTime: Date.now() - startTime,
      };

      this.logRequest(request, aiResponse);
      return aiResponse;

    } catch (error: any) {
      const formattedError = this.formatError(error, 'makeRequest');
      this.logRequest(request, undefined, formattedError);
      
      // Update health status based on error type
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        this.healthy = false;
      }
      
      throw formattedError;
    }
  }

  async* makeStreamRequest(request: AIRequest, signal?: AbortSignal): AsyncIterable<AIStreamResponse> {
    this.validateRequest(request);

    if (!this.client) {
      throw this.formatError(new Error('xAI client not initialized. Please provide XAI_API_KEY.'));
    }

    try {
      const messages: Array<{ role: string; content: string }> = [];
      
      if (request.systemPrompt) {
        messages.push({ role: 'system', content: request.systemPrompt });
      }
      
      messages.push({ role: 'user', content: request.prompt });

      const effectiveSignal = signal || request.signal;
      const response = await this.client.post('/chat/completions', {
        model: request.config?.model || 'grok-beta',
        messages,
        temperature: request.config?.temperature || 0.7,
        max_tokens: request.config?.maxTokens || 4000,
        stream: true,
      }, {
        responseType: 'stream',
        signal: effectiveSignal
      });

      // Real-time xAI streaming - yield deltas immediately as they arrive
      try {
        const model = request.config?.model || 'grok-beta';
        yield* this.createXAIStreamIterator(response.data, model);
        return; // Streaming succeeded
      } catch (streamError) {
        console.warn('xAI real streaming failed, falling back to simulation:', streamError);
      }

      // Fall back to simulated streaming
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
          requestId: fullResponse.requestId || `xai-fallback-${Date.now()}`,
        };

        // Simulate streaming delay
        await new Promise(resolve => setTimeout(resolve, 30));
      }

    } catch (error: any) {
      const formattedError = this.formatError(error, 'makeStreamRequest');
      
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        this.healthy = false;
      }
      
      throw formattedError;
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      if (!this.client) {
        this.healthy = false;
        return false;
      }

      // Simple health check with minimal token usage
      await this.client.post('/chat/completions', {
        model: 'grok-beta',
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 1,
        temperature: 0,
      });

      this.healthy = true;
      this.lastHealthCheck = new Date();
      return true;

    } catch (error: any) {
      this.healthy = false;
      console.warn(`xAI health check failed: ${error?.message || error}`);
      return false;
    }
  }

  updateConfig(apiKey?: string, baseUrl?: string): void {
    super.updateConfig(apiKey, baseUrl);
    this.initializeClient();
  }

  /**
   * Create real-time async iterator for xAI streaming
   */
  private async* createXAIStreamIterator(stream: any, model: string): AsyncIterable<AIStreamResponse> {
    let content = '';
    let requestId = `xai-stream-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    let buffer = '';
    
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
    
    // Real-time yielding - yield chunks immediately as they become available
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
        // Wait a short time for more data (real-time streaming)
        await new Promise(resolve => setTimeout(resolve, 5));
      }
    }
  }
}