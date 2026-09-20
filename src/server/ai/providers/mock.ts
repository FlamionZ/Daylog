import { AIError } from '../errors/ai-error';
import type { AIProvider, AIRequest, AIResult } from '../types/provider';

type MockHandler = (request: AIRequest<unknown>) => Promise<unknown> | unknown;

export class MockProvider implements AIProvider {
  readonly name = 'mock';
  private customHandler?: MockHandler;
  private shouldFailWith?: AIError;

  constructor(options?: {
    customHandler?: MockHandler;
    shouldFailWith?: AIError;
  }) {
    this.customHandler = options?.customHandler;
    this.shouldFailWith = options?.shouldFailWith;
  }

  setMockHandler(handler: MockHandler): void {
    this.customHandler = handler;
  }

  setFailure(error?: AIError): void {
    this.shouldFailWith = error;
  }

  async generateStructuredOutput<T>(request: AIRequest<T>): Promise<AIResult<T>> {
    if (this.shouldFailWith) {
      throw this.shouldFailWith;
    }

    let mockData: unknown;
    if (this.customHandler) {
      mockData = await this.customHandler(request as AIRequest<unknown>);
    } else {
      mockData = this.generateFallbackData();
    }

    const validation = request.schema.safeParse(mockData);
    if (!validation.success) {
      throw AIError.invalidOutput(
        `Mock data failed schema validation: ${validation.error.message}`,
        validation.error.format(),
      );
    }

    const rawText = JSON.stringify(validation.data, null, 2);

    return {
      data: validation.data,
      rawText,
      usage: {
        promptTokens: 100,
        completionTokens: 150,
        totalTokens: 250,
      },
      model: request.model || 'mock-model',
      provider: this.name,
    };
  }

  private generateFallbackData(): unknown {
    return {};
  }
}
