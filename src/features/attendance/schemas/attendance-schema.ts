import { z } from 'zod';

export const workModes = ['wfo', 'wfh', 'hybrid', 'leave', 'sick', 'holiday'] as const;

export const checkInSchema = z.object({
  workMode: z.enum(workModes, {
    message: 'Pilih mode kerja yang valid',
  }),
  checkInAt: z.string().optional(), // ISO string or time string
  location: z.string().optional(),
  notes: z.string().optional(),
});

export const checkOutSchema = z.object({
  checkOutAt: z.string().optional(), // ISO string or time string
  breakMinutes: z.coerce.number().min(0, 'Durasi istirahat minimal 0 menit'),
  notes: z.string().optional(),
});

export const manualAttendanceSchema = z
  .object({
    id: z.string().uuid().optional(),
    workDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal YYYY-MM-DD'),
    workMode: z.enum(workModes),
    checkInAt: z.string().nullable().optional(),
    checkOutAt: z.string().nullable().optional(),
    breakMinutes: z.coerce.number().min(0).default(0),
    location: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
  })
  .refine(
    (data) => {
      if (data.checkOutAt && !data.checkInAt) {
        return false;
      }
      return true;
    },
    {
      message: 'Check-out membutuhkan waktu check-in terlebih dahulu',
      path: ['checkOutAt'],
    },
  )
  .refine(
    (data) => {
      if (data.checkInAt && data.checkOutAt) {
        return new Date(data.checkOutAt) >= new Date(data.checkInAt);
      }
      return true;
    },
    {
      message: 'Waktu check-out harus sama atau setelah waktu check-in',
      path: ['checkOutAt'],
    },
  );

export type CheckInInput = z.infer<typeof checkInSchema>;
export type CheckOutInput = z.infer<typeof checkOutSchema>;
export type ManualAttendanceInput = z.infer<typeof manualAttendanceSchema>;
