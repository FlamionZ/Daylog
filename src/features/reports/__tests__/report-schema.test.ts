import { describe, it, expect } from 'vitest';
import { reportFormSchema } from '../schemas/report-schema';

describe('Report Schemas', () => {
  describe('reportFormSchema', () => {
    it('validates a valid weekly report input', () => {
      const result = reportFormSchema.safeParse({
        title: 'Laporan Mingguan ke-1',
        reportType: 'weekly',
        periodStart: '2026-09-14',
        periodEnd: '2026-09-18',
        contentMarkdown: '## Ringkasan Kegiatan\n\nKegiatan magang minggu pertama berjalan lancar.',
        status: 'draft',
      });
      expect(result.success).toBe(true);
    });

    it('validates a final report with valid content', () => {
      const result = reportFormSchema.safeParse({
        title: 'Laporan Akhir Magang',
        reportType: 'final',
        periodStart: '2026-09-01',
        periodEnd: '2026-11-30',
        contentMarkdown: '# Laporan Akhir Magang PT Tiga Serangkai\n\nSeluruh target selesai.',
        status: 'final',
      });
      expect(result.success).toBe(true);
    });

    it('rejects report title that is too short', () => {
      const result = reportFormSchema.safeParse({
        title: 'Ab',
        reportType: 'weekly',
        periodStart: '2026-09-14',
        periodEnd: '2026-09-18',
        contentMarkdown: 'Konten laporan magang yang cukup panjang.',
        status: 'draft',
      });
      expect(result.success).toBe(false);
    });

    it('rejects contentMarkdown that is too short', () => {
      const result = reportFormSchema.safeParse({
        title: 'Laporan Singkat',
        reportType: 'weekly',
        periodStart: '2026-09-14',
        periodEnd: '2026-09-18',
        contentMarkdown: 'Pendek',
        status: 'draft',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid reportType', () => {
      const result = reportFormSchema.safeParse({
        title: 'Laporan Harian',
        reportType: 'daily',
        periodStart: '2026-09-14',
        periodEnd: '2026-09-18',
        contentMarkdown: 'Konten laporan magang yang cukup panjang.',
        status: 'draft',
      });
      expect(result.success).toBe(false);
    });
  });
});
