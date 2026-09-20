import { describe, it, expect } from 'vitest';
import {
  weeklyReportEnhancementSchema,
  buildWeeklyReportPrompt,
  WEEKLY_REPORT_SYSTEM_PROMPT,
} from '../prompts/weekly-report';

describe('Weekly Report Prompt & Schema', () => {
  it('should validate a complete weekly report enhancement', () => {
    const sample = {
      executiveSummary:
        'Pekan ini difokuskan pada penyelesaian fitur AI Assistant dan pengujian end-to-end.',
      keyAchievements: [
        'Menyelesaikan integrasi Gemini API provider',
        'Mengimplementasikan modul ekstraksi tugas',
      ],
      challengesFaced: [
        'Kendala pembatasan rate limit yang diatasi dengan caching dan backoff',
      ],
      nextWeekPlan: [
        'Melanjutkan pengembangan modul refleksi magang dan laporan akhir',
      ],
    };

    const parsed = weeklyReportEnhancementSchema.safeParse(sample);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.keyAchievements).toHaveLength(2);
    }
  });

  it('should reject invalid schema types', () => {
    const sample = {
      executiveSummary: 123,
      keyAchievements: 'Bukan array',
      challengesFaced: [],
      nextWeekPlan: [],
    };

    const parsed = weeklyReportEnhancementSchema.safeParse(sample);
    expect(parsed.success).toBe(false);
  });

  it('should build prompt containing strict statistics enforcement', () => {
    const prompt = buildWeeklyReportPrompt({
      periodStart: '2026-09-14',
      periodEnd: '2026-09-20',
      statisticsText: 'Hari Kerja: 5 hari | Total Jam: 40 jam | Tugas: 6 selesai',
      journalsSummary: 'Jurnal harian 14-20 September.',
      tasksCompletedText: '- Task A\n- Task B',
      learningsText: '- Next.js 16 App Router',
      userNotes: 'Sorot pengerjaan auth.',
    });

    expect(prompt).toContain('Periode Laporan: 2026-09-14 s.d. 2026-09-20');
    expect(prompt).toContain('Statistik Resmi (TIDAK BOLEH DIUBAH):');
    expect(prompt).toContain('Total Jam: 40 jam');
    expect(prompt).toContain('Sorot pengerjaan auth.');
  });

  it('should enforce anti-hallucination and deterministic metrics in system prompt', () => {
    expect(WEEKLY_REPORT_SYSTEM_PROMPT).toContain('DILARANG MENGUBAH ATAU MENGARANG ANGKA STATISTIK');
    expect(WEEKLY_REPORT_SYSTEM_PROMPT).toContain('FINAL dan DETERMINISTIK');
    expect(WEEKLY_REPORT_SYSTEM_PROMPT).toContain('DILARANG KERAS MENGARANG');
  });
});
