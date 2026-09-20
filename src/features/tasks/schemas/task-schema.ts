import { z } from 'zod';

export const taskStatuses = [
  'backlog',
  'todo',
  'in_progress',
  'review',
  'blocked',
  'done',
] as const;

export const taskPriorities = ['low', 'medium', 'high', 'urgent'] as const;

export const taskLinkTypes = [
  'repository',
  'branch',
  'commit',
  'pull_request',
  'deployment',
  'documentation',
  'other',
] as const;

export const taskFormSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(2, 'Judul tugas minimal 2 karakter'),
  description: z.string().optional(),
  status: z.enum(taskStatuses),
  priority: z.enum(taskPriorities),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal YYYY-MM-DD')
    .optional()
    .or(z.literal('')),
  estimateMinutes: z.coerce.number().min(0).optional(),
  actualMinutes: z.coerce.number().min(0).optional(),
});

export const taskLinkSchema = z.object({
  taskId: z.string().uuid(),
  linkType: z.enum(taskLinkTypes),
  label: z.string().optional(),
  url: z.string().url('Format URL tidak valid (misal: https://...)'),
});

export type TaskFormInput = z.infer<typeof taskFormSchema>;
export type TaskLinkInput = z.infer<typeof taskLinkSchema>;
