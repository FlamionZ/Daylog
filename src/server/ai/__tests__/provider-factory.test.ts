import { describe, it, expect } from 'vitest';
import { getAIProvider } from '../providers/provider';
import { GeminiProvider } from '../providers/gemini';
import { MockProvider } from '../providers/mock';

describe('getAIProvider Factory', () => {
  it('returns MockProvider when provider is set to mock', () => {
    const provider = getAIProvider({ provider: 'mock', forceFresh: true });
    expect(provider).toBeInstanceOf(MockProvider);
    expect(provider.name).toBe('mock');
  });

  it('returns GeminiProvider when provider is set to gemini', () => {
    const provider = getAIProvider({ provider: 'gemini', forceFresh: true });
    expect(provider).toBeInstanceOf(GeminiProvider);
    expect(provider.name).toBe('gemini');
  });
});
