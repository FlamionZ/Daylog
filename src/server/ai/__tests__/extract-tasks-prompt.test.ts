import { describe, it, expect } from 'vitest';
import {
  extractedTasksSchema,
  buildExtractTasksPrompt,
  EXTRACT_TASKS_SYSTEM_PROMPT,
} from '../prompts/extract-tasks';

describe('Extract Tasks Prompt & Schema', () => {
  it('should validate an extracted tasks list', () => {
    const sample = {
      tasks: [
        {
          title: 'Implementasi RLS policy di Supabase',
          description: 'Tambahkan policy SELECT dan INSERT untuk tabel ai_generations',
          priority: 'high' as const,
        },
        {
          title: 'Perbaiki konversi timezone di helper date',
          description: 'Gunakan Asia/Jakarta secara konsisten',
          priority: 'medium' as const,
        },
      ],
    };

    const parsed = extractedTasksSchema.safeParse(sample);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.tasks).toHaveLength(2);
      expect(parsed.data.tasks[0].priority).toBe('high');
    }
  });

  it('should allow empty tasks array when no tasks found', () => {
    const sample = { tasks: [] };
    const parsed = extractedTasksSchema.safeParse(sample);
    expect(parsed.success).toBe(true);
  });

  it('should reject invalid priority values', () => {
    const sample = {
      tasks: [
        {
          title: 'Task invalid',
          description: 'test',
          priority: 'critical', // not in enum
        },
      ],
    };
    const parsed = extractedTasksSchema.safeParse(sample);
    expect(parsed.success).toBe(false);
  });

  it('should build prompt with existing tasks to prevent duplicates', () => {
    const prompt = buildExtractTasksPrompt(
      'Besok mau lanjut bikin modul laporan mingguan dan fixing bug date picker.',
      ['Setup database', 'Fixing bug date picker'],
    );

    expect(prompt).toContain('Daftar Tugas yang Sudah Ada (JANGAN DUPLIKASI):');
    expect(prompt).toContain('Fixing bug date picker');
    expect(prompt).toContain('Catatan Aktivitas Pengguna:');
    expect(prompt).toContain('Besok mau lanjut bikin modul laporan mingguan');
  });

  it('should enforce anti-hallucination and JSON output in system prompt', () => {
    expect(EXTRACT_TASKS_SYSTEM_PROMPT).toContain('JANGAN MENGARANG TUGAS');
    expect(EXTRACT_TASKS_SYSTEM_PROMPT).toContain('format JSON');
  });
});
