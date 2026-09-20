import { describe, it, expect } from 'vitest';
import {
  finalReportDraftSchema,
  buildFinalReportPrompt,
  FINAL_REPORT_SYSTEM_PROMPT,
} from '../prompts/final-report';

describe('Final Report Prompt & Schema', () => {
  it('should validate a structured final report draft', () => {
    const sample = {
      executiveSummary: 'Ringkasan program magang 6 bulan sebagai Software Developer Intern.',
      projectContributions: [
        {
          featureOrModule: 'Internship Companion System',
          roleAndResponsibility: 'Fullstack Developer',
          technicalDetails: 'Next.js 16, TypeScript, Supabase, Tailwind CSS',
          outcome: 'Meningkatkan kedisiplinan dan pelaporan aktivitas magang.',
        },
      ],
      skillsAcquired: [
        {
          category: 'Backend',
          skillName: 'Drizzle ORM & PostgreSQL',
          description: 'Mendesain skema relasional dan migrasi terstruktur.',
        },
      ],
      challengesAndSolutions: [
        {
          challenge: 'Integrasi cookie session pada Server Actions Next.js 16',
          solution: 'Menggunakan helper createServerClient dengan cookie store async.',
        },
      ],
      conclusion: 'Magang memberikan pengalaman nyata dalam industri rekayasa perangkat lunak.',
    };

    const parsed = finalReportDraftSchema.safeParse(sample);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.projectContributions).toHaveLength(1);
      expect(parsed.data.skillsAcquired).toHaveLength(1);
    }
  });

  it('should build final report prompt with complete internship history', () => {
    const prompt = buildFinalReportPrompt({
      internshipRole: 'Software Developer Intern',
      companyName: 'PT Tiga Serangkai',
      durationText: '180 hari',
      totalHours: '800 jam',
      tasksCompletedSummary: '25 tugas tuntas',
      learningsSummary: '15 topik pembelajaran',
      journalsSummary: '120 catatan jurnal',
    });

    expect(prompt).toContain('Posisi: Software Developer Intern');
    expect(prompt).toContain('Perusahaan: PT Tiga Serangkai');
    expect(prompt).toContain('Durasi & Kehadiran: 180 hari (800 jam)');
    expect(prompt).toContain('25 tugas tuntas');
    expect(prompt).toContain('format JSON terstruktur');
  });

  it('should enforce anti-hallucination and final metrics in system prompt', () => {
    expect(FINAL_REPORT_SYSTEM_PROMPT).toContain('DILARANG MENGARANG proyek atau teknologi');
    expect(FINAL_REPORT_SYSTEM_PROMPT).toContain('tidak boleh dimanipulasi');
  });
});
