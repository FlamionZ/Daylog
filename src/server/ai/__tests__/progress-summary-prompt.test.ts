import { describe, it, expect } from 'vitest';
import {
  progressSummarySchema,
  buildProgressSummaryPrompt,
  PROGRESS_SUMMARY_SYSTEM_PROMPT,
} from '../prompts/progress-summary';

describe('Progress Summary Prompt & Schema', () => {
  it('should validate a progress summary output', () => {
    const sample = {
      headline: 'Progres 7 Hari: 5 Tugas Tuntas, Fokus Pembuatan AI Assistant',
      highlights: [
        'Menyelesaikan integrasi Gemini API provider',
        'Menyusun skema database AI usage dan preferences',
      ],
      focusAreas: ['AI Assistant', 'Dashboard Quick Capture'],
      recommendation: 'Selesaikan modul refleksi magang untuk melengkapi kapabilitas asisten.',
    };

    const parsed = progressSummarySchema.safeParse(sample);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.highlights).toHaveLength(2);
      expect(parsed.data.focusAreas).toHaveLength(2);
    }
  });

  it('should reject non-array highlights', () => {
    const sample = {
      headline: 'Progres',
      highlights: 'Bukan array',
      focusAreas: [],
      recommendation: 'Lanjut kerja',
    };

    const parsed = progressSummarySchema.safeParse(sample);
    expect(parsed.success).toBe(false);
  });

  it('should build progress summary prompt with recent context', () => {
    const prompt = buildProgressSummaryPrompt({
      periodText: '7 hari terakhir',
      attendanceText: '5 hari hadir, total 40 jam kerja',
      recentTasksText: '- Task 1 (done)\n- Task 2 (in_progress)',
      recentJournalsText: '- Journal 1: Auth\n- Journal 2: Drizzle',
      recentLearningsText: '- Next.js 16 Server Actions',
    });

    expect(prompt).toContain('Periode Analisis: 7 hari terakhir');
    expect(prompt).toContain('Ringkasan Presensi: 5 hari hadir, total 40 jam kerja');
    expect(prompt).toContain('Tugas Terbaru (Selesai & Berjalan):');
    expect(prompt).toContain('Task 1 (done)');
    expect(prompt).toContain('Pembelajaran Terkini:');
    expect(prompt).toContain('Next.js 16 Server Actions');
  });

  it('should enforce factual constraints in system prompt', () => {
    expect(PROGRESS_SUMMARY_SYSTEM_PROMPT).toContain('DILARANG MENGARANG aktivitas');
    expect(PROGRESS_SUMMARY_SYSTEM_PROMPT).toContain('format JSON');
  });
});
