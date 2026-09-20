import '@testing-library/jest-dom/vitest';

// Provide default test environment variables if not present
process.env.NEXT_PUBLIC_SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-anon-key';
process.env.NEXT_PUBLIC_APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
process.env.AI_PROVIDER = process.env.AI_PROVIDER || 'mock';
process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'dummy-gemini-key';
process.env.GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
process.env.AI_FEATURES_ENABLED = process.env.AI_FEATURES_ENABLED || 'true';
process.env.AI_DAILY_REQUEST_LIMIT = process.env.AI_DAILY_REQUEST_LIMIT || '30';
