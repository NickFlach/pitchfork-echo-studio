import { AIProviderAdapter, AIRequest, AIResponse, AIStreamResponse } from '../AIProviderAdapter';
import { AIProvider } from '../../../shared/schema';

/**
 * Lovable AI Adapter
 * Uses Lovable's AI Gateway for accessing Google Gemini and OpenAI models
 * No API key required - uses LOVABLE_API_KEY automatically provisioned
 */
export class LovableAIAdapter extends AIProviderAdapter {
  private readonly gatewayUrl = 'https://ai.gateway.lovable.dev/v1/chat/completions';
  private readonly defaultModel = 'google/gemini-2.5-flash';

  constructor(apiKey?: string) {
    super('lovable' as AIProvider, apiKey);
  }

  async makeRequest(request: AIRequest, signal?: AbortSignal): Promise<AIResponse> {
    this.validateRequest(request);

    const startTime = Date.now();
    const effectiveSignal = signal || request.signal;

    try {
      if (effectiveSignal?.aborted) {
        throw new Error('Request was aborted');
      }

      const model = request.config?.model || this.defaultModel;
      const messages = this.buildMessages(request);

      const requestBody: Record<string, unknown> = {
        model,
        messages,
        stream: false,
      };

      if (request.config?.temperature !== undefined) {
        requestBody.temperature = request.config.temperature;
      }
      if (request.config?.maxTokens !== undefined) {
        requestBody.max_tokens = request.config.maxTokens;
      }

      const response = await fetch(this.gatewayUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: effectiveSignal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Lovable AI API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      const usage = data.usage;

      const aiResponse: AIResponse = {
        content,
        provider: 'lovable' as AIProvider,
        model,
        usage: usage ? {
          promptTokens: usage.prompt_tokens || 0,
          completionTokens: usage.completion_tokens || 0,
          totalTokens: usage.total_tokens || 0,
        } : undefined,
        finishReason: data.choices?.[0]?.finish_reason || 'stop',
        requestId: data.id || `lovable-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        processingTime: Date.now() - startTime,
      };

      this.logRequest(request, aiResponse);
      return aiResponse;

    } catch (error) {
      const formattedError = this.formatError(error, 'makeRequest');
      this.logRequest(request, undefined, formattedError);
      throw formattedError;
    }
  }

  async* makeStreamRequest(request: AIRequest, signal?: AbortSignal): AsyncIterable<AIStreamResponse> {
    this.validateRequest(request);

    const effectiveSignal = signal || request.signal;
    const model = request.config?.model || this.defaultModel;
    const messages = this.buildMessages(request);
    const requestId = `lovable-stream-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      if (effectiveSignal?.aborted) {
        throw new Error('Stream was aborted');
      }

      const requestBody: Record<string, unknown> = {
        model,
        messages,
        stream: true,
      };

      if (request.config?.temperature !== undefined) {
        requestBody.temperature = request.config.temperature;
      }
      if (request.config?.maxTokens !== undefined) {
        requestBody.max_tokens = request.config.maxTokens;
      }

      const response = await fetch(this.gatewayUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: effectiveSignal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Lovable AI streaming error (${response.status}): ${errorText}`);
      }

      if (!response.body) {
        throw new Error('No response body for streaming');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let content = '';
      let textBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        if (effectiveSignal?.aborted) {
          reader.cancel();
          throw new Error('Stream was aborted');
        }

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') {
            yield {
              content,
              delta: '',
              done: true,
              provider: 'lovable' as AIProvider,
              model,
              requestId,
            };
            return;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content || '';
            if (delta) {
              content += delta;
              yield {
                content,
                delta,
                done: false,
                provider: 'lovable' as AIProvider,
                model,
                requestId,
              };
            }
          } catch {
            // Incomplete JSON, put back and wait for more data
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Final chunk if not already done
      yield {
        content,
        delta: '',
        done: true,
        provider: 'lovable' as AIProvider,
        model,
        requestId,
      };

    } catch (error) {
      throw this.formatError(error, 'makeStreamRequest');
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      // Simple health check - just verify we have an API key
      this.healthy = Boolean(this.apiKey);
      this.lastHealthCheck = new Date();
      return this.healthy;
    } catch (error) {
      this.healthy = false;
      return false;
    }
  }

  private buildMessages(request: AIRequest): Array<{ role: string; content: string }> {
    const messages: Array<{ role: string; content: string }> = [];

    if (request.systemPrompt) {
      messages.push({ role: 'system', content: request.systemPrompt });
    }

    messages.push({ role: 'user', content: request.prompt });

    return messages;
  }
}
