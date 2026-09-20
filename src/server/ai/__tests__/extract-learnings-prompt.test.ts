import { describe, it, expect } from 'vitest';
import {
  extractedLearningsSchema,
  buildExtractLearningsPrompt,
  EXTRACT_LEARNINGS_SYSTEM_PROMPT,
} from '../prompts/extract-learnings';

describe('Extract Learnings Prompt & Schema', () => {
  it('should validate an extracted learnings list', () => {
    const sample = {
      learnings: [
        {
          topic: 'Supabase Row Level Security',
          technology: 'PostgreSQL / Supabase',
          summary: 'Memahami cara membatasi akses data per user_id dengan policy auth.uid()',
          level: 'practicing' as const,
          evidence: 'sempat setup RLS policy untuk tabel ai_generations dan ai_usage_daily',
        },
      ],
    };

    const parsed = extractedLearningsSchema.safeParse(sample);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.learnings).toHaveLength(1);
      expect(parsed.data.learnings[0].level).toBe('practicing');
      expect(parsed.data.learnings[0].evidence).toContain('setup RLS policy');
    }
  });

  it('should allow empty learnings array', () => {
    const sample = { learnings: [] };
    const parsed = extractedLearningsSchema.safeParse(sample);
    expect(parsed.success).toBe(true);
  });

  it('should reject invalid level values', () => {
    const sample = {
      learnings: [
        {
          topic: 'Test',
          technology: 'Test',
          summary: 'Test',
          level: 'master', // not in enum
          evidence: 'Test',
        },
      ],
    };
    const parsed = extractedLearningsSchema.safeParse(sample);
    expect(parsed.success).toBe(false);
  });

  it('should build prompt correctly with notes', () => {
    const prompt = buildExtractLearningsPrompt(
      'Hari ini belajar konsep Server Actions vs Route Handlers di Next.js 16.',
    );

    expect(prompt).toContain('Catatan Aktivitas Pengguna:');
    expect(prompt).toContain('Server Actions vs Route Handlers');
    expect(prompt).toContain('format JSON');
  });

  it('should enforce evidence grounding and anti-hallucination in system prompt', () => {
    expect(EXTRACT_LEARNINGS_SYSTEM_PROMPT).toContain('WAJIB didasari bukti eksplisit');
    expect(EXTRACT_LEARNINGS_SYSTEM_PROMPT).toContain('DILARANG KERAS MENGARANG');
  });
});
