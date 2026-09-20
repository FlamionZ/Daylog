import { describe, it, expect } from 'vitest';
import {
  dailyReflectionSchema,
  buildDailyReflectionPrompt,
  DAILY_REFLECTION_SYSTEM_PROMPT,
} from '../prompts/daily-reflection';

describe('Daily Reflection Prompt & Schema', () => {
  it('should validate structured daily reflection based on Gibbs cycle', () => {
    const sample = {
      description: 'Menyelesaikan implementasi 3 endpoint dan melakukan refactor skema database.',
      feelingsAndChallenges:
        'Awalnya merasa kewalahan karena banyaknya breaking changes, namun merasa puas setelah unit test lulus.',
      evaluation:
        'Estimasi waktu cukup akurat, namun dokumentasi perubahan kode masih minim.',
      analysis:
        'Penggunaan checklist terbukti mempercepat tracking tugas dan meminimalkan regresi.',
      actionPlan:
        'Besok pagi akan melengkapi komentar kode dan mengajukan Pull Request lebih awal.',
    };

    const parsed = dailyReflectionSchema.safeParse(sample);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.description).toBe(sample.description);
      expect(parsed.data.actionPlan).toBe(sample.actionPlan);
    }
  });

  it('should reject non-string fields', () => {
    const sample = {
      description: 123,
      feelingsAndChallenges: 'test',
      evaluation: 'test',
      analysis: 'test',
      actionPlan: 'test',
    };

    const parsed = dailyReflectionSchema.safeParse(sample);
    expect(parsed.success).toBe(false);
  });

  it('should build prompt with complete daily context', () => {
    const prompt = buildDailyReflectionPrompt({
      date: '2026-09-20',
      summary: 'Hari ini mengerjakan modul AI.',
      activities: '- Setup Gemini Provider\n- Buat schema',
      learnings: 'Memahami JSON schema mode di LLM.',
      blockers: 'Rate limit harian.',
    });

    expect(prompt).toContain('Tanggal Aktivitas: 2026-09-20');
    expect(prompt).toContain('Hari ini mengerjakan modul AI.');
    expect(prompt).toContain('Setup Gemini Provider');
    expect(prompt).toContain('Memahami JSON schema mode di LLM.');
    expect(prompt).toContain('Rate limit harian.');
  });

  it('should enforce growth mindset and anti-cliche in system prompt', () => {
    expect(DAILY_REFLECTION_SYSTEM_PROMPT).toContain('Gibbs Reflective Cycle');
    expect(DAILY_REFLECTION_SYSTEM_PROMPT).toContain('growth mindset');
    expect(DAILY_REFLECTION_SYSTEM_PROMPT).toContain('Hindari kalimat klise');
  });
});
