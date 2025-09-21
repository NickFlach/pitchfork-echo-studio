import axios, { AxiosInstance } from 'axios';
import { AIProviderAdapter, AIRequest, AIResponse, AIStreamResponse } from '../AIProviderAdapter';
import { AIProvider } from '../../../shared/schema';

/**
 * Claude (Anthropic) Provider Adapter
 * Implements Claude models using HTTP requests to Anthropic's API
 */
export class ClaudeAdapter extends AIProviderAdapter {
  private client: AxiosInstance | null = null;
  private readonly apiBaseUrl = 'https://api.anthropic.com/v1';

  constructor(apiKey?: string) {
    super('claude', apiKey);
    this.initializeClient();
  }

  private initializeClient(): void {
    const key = this.apiKey || process.env.ANTHROPIC_API_KEY;
    
    if (key) {
      this.client = axios.create({
        baseURL: this.apiBaseUrl,
        headers: {
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        timeout: 60000,
      });
      this.apiKey = key;
    }
  }

  async makeRequest(request: AIRequest, signal?: AbortSignal): Promise<AIResponse> {
    this.validateRequest(request);

    if (!this.client) {
      throw this.formatError(new Error('Claude client not initialized. Please provide ANTHROPIC_API_KEY.'));
    }

    const startTime = Date.now();

    try {
      const messages = [
        {
          role: 'user',
          content: [{ type: 'text', text: request.prompt }]
        }
      ];

      const requestBody: any = {
        model: request.config?.model || 'claude-3-sonnet-20240229',
        max_tokens: request.config?.maxTokens || 4000,
        temperature: request.config?.temperature || 0.7,
        messages: messages,
      };

      // Add system prompt if provided
      if (request.systemPrompt) {
        requestBody.system = request.systemPrompt;
      }

      const effectiveSignal = signal || request.signal;
      const response = await this.client.post('/messages', requestBody, {
        signal: effectiveSignal
      });

      const data = response.data;
      const content = data.content?.[0]?.text || '';

      const aiResponse: AIResponse = {
        content,
        provider: this.provider,
        model: data.model || request.config?.model || 'claude-3-sonnet-20240229',
        usage: {
          promptTokens: data.usage?.input_tokens || 0,
          completionTokens: data.usage?.output_tokens || 0,
          totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
        },
        finishReason: data.stop_reason || 'stop',
        requestId: data.id,
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
      throw this.formatError(new Error('Claude client not initialized. Please provide ANTHROPIC_API_KEY.'));
    }

    try {
      const messages = [
        {
          role: 'user',
          content: [{ type: 'text', text: request.prompt }]
        }
      ];

      const requestBody: any = {
        model: request.config?.model || 'claude-3-sonnet-20240229',
        max_tokens: request.config?.maxTokens || 4000,
        temperature: request.config?.temperature || 0.7,
        messages: messages,
        stream: true,
      };

      // Add system prompt if provided
      if (request.systemPrompt) {
        requestBody.system = request.systemPrompt;
      }

      const effectiveSignal = signal || request.signal;
      const response = await this.client.post('/messages', requestBody, {
        responseType: 'stream',
        signal: effectiveSignal
      });

      // Real-time Claude streaming - yield deltas immediately as they arrive
      try {
        yield* this.createClaudeStreamIterator(response.data, requestBody.model);
        return; // Streaming succeeded
      } catch (streamError) {
        console.warn('Claude real streaming failed, falling back to simulation:', streamError);
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
          requestId: fullResponse.requestId || `claude-fallback-${Date.now()}`,
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
      await this.client.post('/messages', {
        model: 'claude-3-haiku-20240307', // Fastest model for health checks
        max_tokens: 1,
        messages: [{ role: 'user', content: [{ type: 'text', text: 'Hi' }] }],
      });

      this.healthy = true;
      this.lastHealthCheck = new Date();
      return true;

    } catch (error: any) {
      this.healthy = false;
      console.warn(`Claude health check failed: ${error?.message || error}`);
      return false;
    }
  }

  updateConfig(apiKey?: string, baseUrl?: string): void {
    super.updateConfig(apiKey, baseUrl);
    this.initializeClient();
  }

  /**
   * Create real-time async iterator for Claude streaming
   */
  private async* createClaudeStreamIterator(stream: any, model: string): AsyncIterable<AIStreamResponse> {
    let content = '';
    let requestId = `claude-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
            
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              const delta = parsed.delta.text;
              content += delta;
              requestId = parsed.id || requestId;
              
              streamQueue.push({
                content,
                delta,
                done: false,
                provider: this.provider,
                model,
                requestId,
              });
            } else if (parsed.type === 'message_stop') {
              streamQueue.push({
                content,
                delta: '',
                done: true,
                provider: this.provider,
                model,
                requestId,
              });
              streamEnded = true;
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