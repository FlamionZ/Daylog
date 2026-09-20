import { z } from 'zod';

export const reportTypes = ['weekly', 'monthly', 'final', 'custom'] as const;
export const reportStatuses = ['draft', 'final'] as const;

export const reportFormSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(3, 'Judul laporan minimal 3 karakter'),
  reportType: z.enum(reportTypes),
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal awal YYYY-MM-DD'),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal akhir YYYY-MM-DD'),
  contentMarkdown: z.string().min(10, 'Isi laporan minimal 10 karakter'),
  status: z.enum(reportStatuses),
});

export type ReportFormInput = z.infer<typeof reportFormSchema>;
