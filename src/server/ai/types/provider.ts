import type { ZodType } from 'zod';

export interface TokenUsage {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

export interface AIRequest<T> {
  systemPrompt?: string;
  prompt: string;
  schema: ZodType<T>;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  model?: string;
}

export interface AIResult<T> {
  data: T;
  rawText: string;
  usage?: TokenUsage;
  model: string;
  provider: string;
}

export interface AIProvider {
  readonly name: string;
  generateStructuredOutput<T>(request: AIRequest<T>): Promise<AIResult<T>>;
}
