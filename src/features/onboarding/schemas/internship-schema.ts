import { z } from 'zod';

export const createInternshipSchema = z
  .object({
    companyName: z.string().min(2, 'Nama perusahaan minimal 2 karakter'),
    roleTitle: z.string().min(2, 'Posisi magang minimal 2 karakter'),
    location: z.string().optional(),
    mentorName: z.string().optional(),
    mentorContact: z.string().optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal YYYY-MM-DD'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal YYYY-MM-DD'),
    defaultStartTime: z.string().optional(),
    defaultEndTime: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'Tanggal selesai harus setelah atau sama dengan tanggal mulai',
    path: ['endDate'],
  });

export type CreateInternshipInput = z.infer<typeof createInternshipSchema>;
