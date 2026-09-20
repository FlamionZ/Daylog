import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { MockProvider } from '../providers/mock';
import { AIError } from '../errors/ai-error';

const sampleSchema = z.object({
  title: z.string(),
  priority: z.enum(['low', 'medium', 'high']),
});

describe('MockProvider', () => {
  it('generates structured output using a custom mock handler', async () => {
    const provider = new MockProvider({
      customHandler: () => ({
        title: 'Review PR Modul AI',
        priority: 'high',
      }),
    });

    const result = await provider.generateStructuredOutput({
      prompt: 'Buat task',
      schema: sampleSchema,
    });

    expect(result.data).toEqual({
      title: 'Review PR Modul AI',
      priority: 'high',
    });
    expect(result.provider).toBe('mock');
    expect(result.usage?.totalTokens).toBe(250);
  });

  it('fails when simulated failure is set', async () => {
    const provider = new MockProvider();
    provider.setFailure(AIError.rateLimit());

    await expect(
      provider.generateStructuredOutput({
        prompt: 'test',
        schema: sampleSchema,
      }),
    ).rejects.toThrow(AIError);
  });

  it('fails when mock handler produces invalid schema data', async () => {
    const provider = new MockProvider({
      customHandler: () => ({
        title: 'Invalid task',
        priority: 'super_urgent_invalid',
      }),
    });

    await expect(
      provider.generateStructuredOutput({
        prompt: 'test',
        schema: sampleSchema,
      }),
    ).rejects.toThrow(AIError);
  });
});
