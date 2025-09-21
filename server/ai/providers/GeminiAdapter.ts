import axios, { AxiosInstance } from 'axios';
import { AIProviderAdapter, AIRequest, AIResponse, AIStreamResponse } from '../AIProviderAdapter';
import { AIProvider } from '../../../shared/schema';

/**
 * Google Gemini Provider Adapter
 * Implements Gemini models using HTTP requests to Google's Generative AI API
 */
export class GeminiAdapter extends AIProviderAdapter {
  private client: AxiosInstance | null = null;
  private readonly apiBaseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor(apiKey?: string) {
    super('gemini', apiKey);
    this.initializeClient();
  }

  private initializeClient(): void {
    const key = this.apiKey || process.env.GEMINI_API_KEY;
    
    if (key) {
      this.client = axios.create({
        baseURL: this.apiBaseUrl,
        timeout: 60000,
      });
      this.apiKey = key;
    }
  }

  private buildContent(request: AIRequest): any[] {
    const parts: Array<{ text: string }> = [];
    
    if (request.systemPrompt) {
      parts.push({ text: `System: ${request.systemPrompt}\n\nUser: ${request.prompt}` });
    } else {
      parts.push({ text: request.prompt });
    }
    
    return [{ role: 'user', parts }];
  }

  async makeRequest(request: AIRequest, signal?: AbortSignal): Promise<AIResponse> {
    this.validateRequest(request);

    if (!this.client) {
      throw this.formatError(new Error('Gemini client not initialized. Please provide GEMINI_API_KEY.'));
    }

    const startTime = Date.now();
    const model = request.config?.model || 'gemini-pro';

    try {
      const effectiveSignal = signal || request.signal;
      const response = await this.client.post(
        `/models/${model}:generateContent?key=${this.apiKey}`,
        {
          contents: this.buildContent(request),
          generationConfig: {
            temperature: request.config?.temperature || 0.7,
            maxOutputTokens: request.config?.maxTokens || 4000,
          },
        },
        {
          signal: effectiveSignal
        }
      );

      const data = response.data;
      const candidate = data.candidates?.[0];
      const content = candidate?.content?.parts?.[0]?.text || '';

      const aiResponse: AIResponse = {
        content,
        provider: this.provider,
        model,
        usage: {
          promptTokens: data.usageMetadata?.promptTokenCount || 0,
          completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: data.usageMetadata?.totalTokenCount || 0,
        },
        finishReason: candidate?.finishReason?.toLowerCase() || 'stop',
        requestId: `gemini-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
      throw this.formatError(new Error('Gemini client not initialized. Please provide GEMINI_API_KEY.'));
    }

    const model = request.config?.model || 'gemini-pro';
    const requestId = `gemini-stream-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      const effectiveSignal = signal || request.signal;
      const response = await this.client.post(
        `/models/${model}:streamGenerateContent?key=${this.apiKey}`,
        {
          contents: this.buildContent(request),
          generationConfig: {
            temperature: request.config?.temperature || 0.7,
            maxOutputTokens: request.config?.maxTokens || 4000,
          },
        },
        {
          responseType: 'stream',
          signal: effectiveSignal
        }
      );

      let content = '';
      let buffer = '';

      for await (const chunk of response.data) {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '') continue;
          
          try {
            const data = JSON.parse(line);
            const candidate = data.candidates?.[0];
            const delta = candidate?.content?.parts?.[0]?.text || '';
            
            if (delta) {
              content += delta;
              
              yield {
                content,
                delta,
                done: candidate?.finishReason !== undefined,
                provider: this.provider,
                model,
                requestId,
              };
            }
          } catch (e) {
            // Ignore JSON parse errors in streaming
          }
        }
      }

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
            requestId: fullResponse.requestId || requestId,
          };

          // Simulate streaming delay
          await new Promise(resolve => setTimeout(resolve, 30));
        }
      } catch (fallbackError: any) {
        const formattedError = this.formatError(fallbackError, 'makeStreamRequest');
        
        if (error?.response?.status === 401 || error?.response?.status === 403) {
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

      // Simple health check with minimal token usage
      await this.client.post(
        `/models/gemini-pro:generateContent?key=${this.apiKey}`,
        {
          contents: [{ role: 'user', parts: [{ text: 'Hi' }] }],
          generationConfig: {
            maxOutputTokens: 1,
          },
        }
      );

      this.healthy = true;
      this.lastHealthCheck = new Date();
      return true;

    } catch (error: any) {
      this.healthy = false;
      console.warn(`Gemini health check failed: ${error?.message || error}`);
      return false;
    }
  }

  updateConfig(apiKey?: string, baseUrl?: string): void {
    super.updateConfig(apiKey, baseUrl);
    this.initializeClient();
  }
}