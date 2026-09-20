import { describe, it, expect } from 'vitest';
import {
  blockerAdviceSchema,
  buildBlockerAdvisorPrompt,
  BLOCKER_ADVISOR_SYSTEM_PROMPT,
} from '../prompts/blocker-advisor';

describe('Blocker Advisor Prompt & Schema', () => {
  it('should validate complete blocker advice output', () => {
    const sample = {
      rootCauseHypotheses: [
        'Query .single() menghasilkan multiple rows karena data duplikat',
        'RLS policy membatasi pembacaan baris yang dimaksud',
      ],
      investigationSteps: [
        'Cek isi tabel di Supabase Dashboard untuk memeriksa jumlah baris',
        'Ganti .single() menjadi .maybeSingle() untuk logging hasil',
      ],
      potentialSolutions: [
        'Gunakan .maybeSingle() jika baris mungkin kosong',
        'Tambahkan klausa filter yang lebih spesifik',
      ],
      howToAskMentor:
        'Halo Kak, saya menemui error PGRST116 saat query user. Saya sudah mencoba cek schema dan mengganti query ke maybeSingle(), namun hasilnya null. Apakah RLS policy untuk tabel ini sudah dibuka untuk role authenticated?',
    };

    const parsed = blockerAdviceSchema.safeParse(sample);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.rootCauseHypotheses).toHaveLength(2);
      expect(parsed.data.howToAskMentor).toContain('Halo Kak');
    }
  });

  it('should reject invalid schema types', () => {
    const sample = {
      rootCauseHypotheses: 'bukan array',
      investigationSteps: [],
      potentialSolutions: [],
      howToAskMentor: 123,
    };

    const parsed = blockerAdviceSchema.safeParse(sample);
    expect(parsed.success).toBe(false);
  });

  it('should build prompt correctly with technology and attempted solutions', () => {
    const prompt = buildBlockerAdvisorPrompt({
      blockerText: 'CORS policy blocking API requests',
      technology: 'Next.js 16 & FastAPI',
      attemptedSolutions: 'Tambahkan header Access-Control-Allow-Origin: *',
    });

    expect(prompt).toContain('CORS policy blocking API requests');
    expect(prompt).toContain('Next.js 16 & FastAPI');
    expect(prompt).toContain('Access-Control-Allow-Origin');
    expect(prompt).toContain('format JSON');
  });

  it('should enforce professional communication format in system prompt', () => {
    expect(BLOCKER_ADVISOR_SYSTEM_PROMPT).toContain('howToAskMentor');
    expect(BLOCKER_ADVISOR_SYSTEM_PROMPT).toContain('format JSON');
  });
});
