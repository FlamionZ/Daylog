import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { z } from 'zod';
import { GeminiProvider } from '../providers/gemini';
import { AIError } from '../errors/ai-error';

const testSchema = z.object({
  greeting: z.string(),
  points: z.array(z.string()),
});

describe('GeminiProvider', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('throws authentication error if API key is empty', async () => {
    const provider = new GeminiProvider({ apiKey: '' });
    await expect(
      provider.generateStructuredOutput({
        prompt: 'test',
        schema: testSchema,
      }),
    ).rejects.toThrow(AIError);

    try {
      await provider.generateStructuredOutput({
        prompt: 'test',
        schema: testSchema,
      });
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(AIError);
      expect((err as AIError).code).toBe('AUTHENTICATION_ERROR');
    }
  });

  it('successfully generates structured output and parses JSON', async () => {
    const provider = new GeminiProvider({ apiKey: 'fake-test-key' });

    const mockResponsePayload = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  greeting: 'Halo Rakha',
                  points: ['Poin 1', 'Poin 2'],
                }),
              },
            ],
          },
          finishReason: 'STOP',
        },
      ],
      usageMetadata: {
        promptTokenCount: 50,
        candidatesTokenCount: 30,
        totalTokenCount: 80,
      },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponsePayload,
    } as Response);

    const result = await provider.generateStructuredOutput({
      prompt: 'Buat salam',
      schema: testSchema,
    });

    expect(result.data).toEqual({
      greeting: 'Halo Rakha',
      points: ['Poin 1', 'Poin 2'],
    });
    expect(result.usage?.totalTokens).toBe(80);
    expect(result.provider).toBe('gemini');
  });

  it('strips markdown code fences from JSON output', async () => {
    const provider = new GeminiProvider({ apiKey: 'fake-test-key' });

    const markdownJson = `\`\`\`json
{
  "greeting": "Selamat Pagi",
  "points": ["Aktivitas 1"]
}
\`\`\``;

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [{ text: markdownJson }],
            },
          },
        ],
      }),
    } as Response);

    const result = await provider.generateStructuredOutput({
      prompt: 'Buat salam',
      schema: testSchema,
    });

    expect(result.data.greeting).toBe('Selamat Pagi');
  });

  it('throws SAFETY_VIOLATION when finishReason is SAFETY', async () => {
    const provider = new GeminiProvider({ apiKey: 'fake-test-key' });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          {
            finishReason: 'SAFETY',
          },
        ],
      }),
    } as Response);

    await expect(
      provider.generateStructuredOutput({
        prompt: 'test safety',
        schema: testSchema,
      }),
    ).rejects.toThrow(AIError);
  });

  it('retries once on transient 503 error then succeeds', async () => {
    const provider = new GeminiProvider({ apiKey: 'fake-test-key' });

    let callCount = 0;
    global.fetch = vi.fn().mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        return {
          ok: false,
          status: 503,
          statusText: 'Service Unavailable',
          text: async () => 'Service Unavailable',
        } as Response;
      }
      return {
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      greeting: 'Sukses setelah retry',
                      points: [],
                    }),
                  },
                ],
              },
            },
          ],
        }),
      } as Response;
    });

    const result = await provider.generateStructuredOutput({
      prompt: 'test retry',
      schema: testSchema,
    });

    expect(callCount).toBe(2);
    expect(result.data.greeting).toBe('Sukses setelah retry');
  });

  it('does NOT retry on 401 authentication error', async () => {
    const provider = new GeminiProvider({ apiKey: 'bad-key' });

    let callCount = 0;
    global.fetch = vi.fn().mockImplementation(async () => {
      callCount++;
      return {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: async () => 'API key invalid',
      } as Response;
    });

    await expect(
      provider.generateStructuredOutput({
        prompt: 'test no retry',
        schema: testSchema,
      }),
    ).rejects.toThrow(AIError);

    expect(callCount).toBe(1);
  });

  it('automatically falls back to next model when primary model gets 429 rate limit', async () => {
    const provider = new GeminiProvider({
      apiKey: 'test-key',
      defaultModel: 'gemini-3.8-flash',
      fallbackModels: ['gemini-3.7-flash', 'gemini-3.6-flash'],
    });

    const calls: string[] = [];
    global.fetch = vi.fn().mockImplementation(async (url: string) => {
      calls.push(url);
      if (url.includes('gemini-3.8-flash')) {
        return {
          ok: false,
          status: 429,
          statusText: 'Too Many Requests',
          text: async () => JSON.stringify({ error: { message: 'Quota exceeded for 3.8-flash' } }),
        } as Response;
      }

      return {
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      greeting: 'Halo dari model fallback 3.7!',
                      points: ['Poin fallback'],
                    }),
                  },
                ],
              },
            },
          ],
        }),
      } as Response;
    });

    const result = await provider.generateStructuredOutput({
      prompt: 'test fallback',
      schema: testSchema,
    });

    expect(result.data.greeting).toBe('Halo dari model fallback 3.7!');
    expect(result.model).toBe('gemini-3.7-flash');
    expect(calls.length).toBe(2);
    expect(calls[0]).toContain('gemini-3.8-flash');
    expect(calls[1]).toContain('gemini-3.7-flash');
  });

  it('falls back when model returns 404 not found', async () => {
    const provider = new GeminiProvider({
      apiKey: 'test-key',
      defaultModel: 'gemini-3.8-flash',
      fallbackModels: ['gemini-3.7-flash'],
    });

    global.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('gemini-3.8-flash')) {
        return {
          ok: false,
          status: 404,
          statusText: 'Not Found',
          text: async () => JSON.stringify({ error: { message: 'Model not found' } }),
        } as Response;
      }

      return {
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      greeting: 'Halo dari fallback setelah 404!',
                      points: [],
                    }),
                  },
                ],
              },
            },
          ],
        }),
      } as Response;
    });

    const result = await provider.generateStructuredOutput({
      prompt: 'test 404 fallback',
      schema: testSchema,
    });

    expect(result.data.greeting).toBe('Halo dari fallback setelah 404!');
    expect(result.model).toBe('gemini-3.7-flash');
  });

  it('throws rate limit error when all models in fallback chain fail with 429', async () => {
    const provider = new GeminiProvider({
      apiKey: 'test-key',
      defaultModel: 'gemini-3.8-flash',
      fallbackModels: ['gemini-3.7-flash'],
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      text: async () => JSON.stringify({ error: { message: 'Quota exhausted' } }),
    } as Response);

    await expect(
      provider.generateStructuredOutput({
        prompt: 'test all exhausted',
        schema: testSchema,
      }),
    ).rejects.toThrow(AIError);
  });
});
