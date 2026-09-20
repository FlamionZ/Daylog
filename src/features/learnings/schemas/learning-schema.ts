import { z } from 'zod';

export const learningLevels = [
  'exploring',
  'learning',
  'practicing',
  'confident',
] as const;

export const learningFormSchema = z.object({
  id: z.string().uuid().optional(),
  topic: z.string().min(2, 'Topik pembelajaran minimal 2 karakter'),
  technology: z.string().optional(),
  summary: z.string().optional(),
  sourceUrl: z
    .string()
    .url('Format URL tidak valid (misal: https://...)')
    .optional()
    .or(z.literal('')),
  level: z.enum(learningLevels),
  learnedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal YYYY-MM-DD'),
  journalId: z.string().uuid().optional().nullable(),
  taskId: z.string().uuid().optional().nullable(),
});

export type LearningFormInput = z.infer<typeof learningFormSchema>;
