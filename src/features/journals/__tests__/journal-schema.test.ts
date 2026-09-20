import { describe, it, expect } from 'vitest';
import { journalFormSchema } from '../schemas/journal-schema';

describe('Journal Schema', () => {
  it('validates a complete and structured daily journal', () => {
    const result = journalFormSchema.safeParse({
      journalDate: '2026-09-20',
      title: 'Catatan Harian Magang',
      summary: 'Menyelesaikan modul presensi dan pengujian unit test.',
      activities: '- Membuat modal check-in\n- Membuat modal check-out\n- Menulis 22 unit tests',
      learnings: 'Memahami timezone handling Asia/Jakarta dengan date-fns-tz.',
      blockers: 'Menangani selisih waktu istirahat dan konversi UTC ke WIB.',
      solutions: 'Menggunakan date-fns-tz dan lib/date utilitas terpusat.',
      nextPlan: 'Melanjutkan ke modul task tracker dan integrasi journal tasks.',
      status: 'completed',
    });
    expect(result.success).toBe(true);
  });

  it('validates a draft journal with minimal fields', () => {
    const result = journalFormSchema.safeParse({
      journalDate: '2026-09-20',
      summary: 'Draf awal catatan magang.',
      status: 'draft',
    });
    expect(result.success).toBe(true);
  });

  it('rejects journal without journalDate', () => {
    const result = journalFormSchema.safeParse({
      summary: 'Catatan tanpa tanggal.',
      status: 'draft',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid journalDate format', () => {
    const result = journalFormSchema.safeParse({
      journalDate: '20-09-2026',
      summary: 'Format tanggal salah.',
      status: 'draft',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid status', () => {
    const result = journalFormSchema.safeParse({
      journalDate: '2026-09-20',
      summary: 'Ringkasan jurnal.',
      status: 'published',
    });
    expect(result.success).toBe(false);
  });
});
