import { env } from '@/lib/env';
import { AIError } from '../errors/ai-error';
import type { AIProvider } from '../types/provider';
import { GeminiProvider } from './gemini';
import { MockProvider } from './mock';

let cachedProvider: AIProvider | null = null;

export interface ProviderOptions {
  provider?: 'gemini' | 'mock';
  apiKey?: string;
  defaultModel?: string;
  forceFresh?: boolean;
}

export function getAIProvider(options?: ProviderOptions): AIProvider {
  if (!env.AI_FEATURES_ENABLED) {
    throw AIError.disabled('Fitur AI sedang dinonaktifkan dalam konfigurasi aplikasi.');
  }

  const providerType = options?.provider || env.AI_PROVIDER || 'gemini';

  if (!options?.forceFresh && cachedProvider && cachedProvider.name === providerType) {
    return cachedProvider;
  }

  let provider: AIProvider;
  switch (providerType) {
    case 'gemini':
      provider = new GeminiProvider({
        apiKey: options?.apiKey,
        defaultModel: options?.defaultModel,
      });
      break;
    case 'mock':
      provider = new MockProvider();
      break;
    default:
      throw AIError.provider(`Provider AI tidak dikenal: ${providerType}`, 400);
  }

  if (!options?.forceFresh) {
    cachedProvider = provider;
  }

  return provider;
}
