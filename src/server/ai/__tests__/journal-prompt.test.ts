import { describe, it, expect } from 'vitest';
import {
  journalSuggestionSchema,
  buildJournalPrompt,
  JOURNAL_SYSTEM_PROMPT,
} from '../prompts/journal';

describe('Journal Prompt & Schema', () => {
  it('should validate a complete journal suggestion', () => {
    const sample = {
      summary: 'Menyelesaikan modul autentikasi.',
      activities: '- Integrasi Supabase Auth\n- Validasi form dengan Zod',
      learnings: 'Konfigurasi SSR cookie handling.',
      blockers: '',
      solutions: '',
      nextPlan: 'Lanjut ke fitur presensi.',
    };

    const parsed = journalSuggestionSchema.safeParse(sample);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.summary).toBe(sample.summary);
      expect(parsed.data.learnings).toBe(sample.learnings);
    }
  });

  it('should allow empty strings for learnings, blockers, and solutions', () => {
    const sample = {
      summary: 'Hari riset arsitektur.',
      activities: '- Membaca PRD dan Schema',
      learnings: '',
      blockers: '',
      solutions: '',
      nextPlan: 'Implementasi skema database.',
    };

    const parsed = journalSuggestionSchema.safeParse(sample);
    expect(parsed.success).toBe(true);
  });

  it('should reject invalid schema types', () => {
    const sample = {
      summary: 12345, // invalid type
      activities: '- Task 1',
      learnings: '',
      blockers: '',
      solutions: '',
      nextPlan: '',
    };

    const parsed = journalSuggestionSchema.safeParse(sample);
    expect(parsed.success).toBe(false);
  });

  it('should build prompt correctly with all optional fields', () => {
    const prompt = buildJournalPrompt({
      journalDate: '2026-09-20',
      notes: 'Meeting sprint dan fixing bug login.',
      tasksDone: ['Setup Supabase client'],
      tasksInProgress: ['Implementasi Auth UI'],
      attendanceInfo: 'Hadir 08:00 - 17:00 (8 jam)',
    });

    expect(prompt).toContain('Tanggal Jurnal: 2026-09-20');
    expect(prompt).toContain('Informasi Presensi: Hadir 08:00 - 17:00 (8 jam)');
    expect(prompt).toContain('Tugas yang Telah Selesai:\n- Setup Supabase client');
    expect(prompt).toContain('Tugas Sedang Dikerjakan:\n- Implementasi Auth UI');
    expect(prompt).toContain('Catatan Bebas Pengguna:\n"""\nMeeting sprint dan fixing bug login.\n"""');
  });

  it('should build prompt without optional tasks or attendance', () => {
    const prompt = buildJournalPrompt({
      journalDate: '2026-09-20',
      notes: 'Hanya riset dokumentasi.',
    });

    expect(prompt).toContain('Tanggal Jurnal: 2026-09-20');
    expect(prompt).not.toContain('Tugas yang Telah Selesai');
    expect(prompt).not.toContain('Informasi Presensi');
    expect(prompt).toContain('Catatan Bebas Pengguna:\n"""\nHanya riset dokumentasi.\n"""');
  });

  it('should enforce anti-hallucination in system prompt', () => {
    expect(JOURNAL_SYSTEM_PROMPT).toContain('DILARANG KERAS mengarang');
    expect(JOURNAL_SYSTEM_PROMPT).toContain('JANGAN PERNAH MENGARANG FAKTA');
    expect(JOURNAL_SYSTEM_PROMPT).toContain('Bahasa Indonesia');
  });
});
