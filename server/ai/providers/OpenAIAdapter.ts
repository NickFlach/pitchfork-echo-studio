import OpenAI from 'openai';
import { AIProviderAdapter, AIRequest, AIResponse, AIStreamResponse } from '../AIProviderAdapter';
import { AIProvider } from '../../../shared/schema';

/**
 * OpenAI Provider Adapter
 * Implements OpenAI GPT models using the official OpenAI SDK
 */
export class OpenAIAdapter extends AIProviderAdapter {
  private client: OpenAI | null = null;

  constructor(apiKey?: string) {
    super('openai', apiKey);
    this.initializeClient();
  }

  private initializeClient(): void {
    if (this.apiKey) {
      this.client = new OpenAI({
        apiKey: this.apiKey,
      });
    } else {
      // Try to use environment variable
      const envApiKey = process.env.OPENAI_API_KEY;
      if (envApiKey) {
        this.client = new OpenAI({
          apiKey: envApiKey,
        });
        this.apiKey = envApiKey;
      }
    }
  }

  async makeRequest(request: AIRequest, signal?: AbortSignal): Promise<AIResponse> {
    this.validateRequest(request);

    if (!this.client) {
      throw this.formatError(new Error('OpenAI client not initialized. Please provide OPENAI_API_KEY.'));
    }

    const startTime = Date.now();

    try {
      const effectiveSignal = signal || request.signal;
      const completion = await this.client.chat.completions.create({
        model: request.config?.model || 'gpt-4',
        messages: [
          ...(request.systemPrompt ? [{ role: 'system' as const, content: request.systemPrompt }] : []),
          { role: 'user' as const, content: request.prompt }
        ],
        temperature: request.config?.temperature || 0.7,
        max_tokens: request.config?.maxTokens || 4000,
        stream: false,
      }, {
        signal: effectiveSignal
      });

      const response: AIResponse = {
        content: completion.choices[0]?.message?.content || '',
        provider: this.provider,
        model: completion.model,
        usage: {
          promptTokens: completion.usage?.prompt_tokens || 0,
          completionTokens: completion.usage?.completion_tokens || 0,
          totalTokens: completion.usage?.total_tokens || 0,
        },
        finishReason: completion.choices[0]?.finish_reason as any || 'stop',
        requestId: completion.id,
        processingTime: Date.now() - startTime,
      };

      this.logRequest(request, response);
      return response;

    } catch (error: any) {
      const formattedError = this.formatError(error, 'makeRequest');
      this.logRequest(request, undefined, formattedError);
      
      // Update health status based on error type
      if (error?.status === 401 || error?.status === 403) {
        this.healthy = false;
      }
      
      throw formattedError;
    }
  }

  async* makeStreamRequest(request: AIRequest, signal?: AbortSignal): AsyncIterable<AIStreamResponse> {
    this.validateRequest(request);

    if (!this.client) {
      throw this.formatError(new Error('OpenAI client not initialized. Please provide OPENAI_API_KEY.'));
    }

    try {
      const effectiveSignal = signal || request.signal;
      const stream = await this.client.chat.completions.create({
        model: request.config?.model || 'gpt-4',
        messages: [
          ...(request.systemPrompt ? [{ role: 'system' as const, content: request.systemPrompt }] : []),
          { role: 'user' as const, content: request.prompt }
        ],
        temperature: request.config?.temperature || 0.7,
        max_tokens: request.config?.maxTokens || 4000,
        stream: true,
      }, {
        signal: effectiveSignal
      });

      let content = '';
      let requestId: string | undefined;

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || '';
        content += delta;
        requestId = requestId || chunk.id;

        yield {
          content,
          delta,
          done: chunk.choices[0]?.finish_reason !== null,
          provider: this.provider,
          model: chunk.model,
          requestId,
        };
      }

    } catch (error: any) {
      const formattedError = this.formatError(error, 'makeStreamRequest');
      
      // Update health status based on error type
      if (error?.status === 401 || error?.status === 403) {
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
      await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 1,
        temperature: 0,
      });

      this.healthy = true;
      this.lastHealthCheck = new Date();
      return true;

    } catch (error: any) {
      this.healthy = false;
      
      // Log the health check failure
      console.warn(`OpenAI health check failed: ${error?.message || error}`);
      
      return false;
    }
  }

  updateConfig(apiKey?: string, baseUrl?: string): void {
    super.updateConfig(apiKey, baseUrl);
    this.initializeClient();
  }
}