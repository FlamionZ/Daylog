import { z } from 'zod';

export const documentCategories = [
  'administration',
  'report',
  'certificate',
  'work_sample',
  'other',
] as const;

export const documentSchema = z
  .object({
    id: z.string().uuid().optional(),
    category: z.enum(documentCategories),
    name: z.string().min(2, 'Nama dokumen minimal 2 karakter'),
    description: z.string().optional(),
    documentDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal YYYY-MM-DD')
      .optional()
      .or(z.literal('')),
    storagePath: z.string().optional(),
    externalUrl: z
      .string()
      .url('Format URL tidak valid (misal: https://...)')
      .optional()
      .or(z.literal('')),
    mimeType: z.string().optional(),
    sizeBytes: z.number().int().nonnegative().optional(),
  })
  .refine(
    (data) => {
      const hasStorage = Boolean(data.storagePath && data.storagePath.trim().length > 0);
      const hasUrl = Boolean(data.externalUrl && data.externalUrl.trim().length > 0);
      return (hasStorage && !hasUrl) || (!hasStorage && hasUrl);
    },
    {
      message: 'Pilih salah satu: unggah berkas fisik ATAU masukkan tautan eksternal.',
      path: ['externalUrl'],
    },
  );

export type DocumentInput = z.infer<typeof documentSchema>;
