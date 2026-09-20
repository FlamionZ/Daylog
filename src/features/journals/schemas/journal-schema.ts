import { z } from 'zod';

export const journalStatus = ['draft', 'completed'] as const;

export const journalFormSchema = z.object({
  id: z.string().uuid().optional(),
  journalDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal YYYY-MM-DD'),
  title: z.string().optional(),
  summary: z.string().min(3, 'Ringkasan minimal 3 karakter'),
  activities: z.string().optional(),
  learnings: z.string().optional(),
  blockers: z.string().optional(),
  solutions: z.string().optional(),
  nextPlan: z.string().optional(),
  status: z.enum(journalStatus),
  taskIds: z.array(z.string().uuid()).optional(),
});

export type JournalFormInput = z.infer<typeof journalFormSchema>;
