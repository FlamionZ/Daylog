import { describe, it, expect } from 'vitest';
import {
  checkInSchema,
  checkOutSchema,
  manualAttendanceSchema,
} from '../schemas/attendance-schema';

describe('Attendance Schemas', () => {
  describe('checkInSchema', () => {
    it('validates a valid WFO check-in', () => {
      const result = checkInSchema.safeParse({
        workMode: 'wfo',
        checkInAt: '2026-09-20T08:00:00.000Z',
        location: 'PT Tiga Serangkai',
        notes: 'Tiba tepat waktu',
      });
      expect(result.success).toBe(true);
    });

    it('validates a valid WFH check-in without location or notes', () => {
      const result = checkInSchema.safeParse({
        workMode: 'wfh',
        checkInAt: '2026-09-20T08:00:00.000Z',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid workMode', () => {
      const result = checkInSchema.safeParse({
        workMode: 'remote_mars',
        checkInAt: '2026-09-20T08:00:00.000Z',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('checkOutSchema', () => {
    it('validates a normal check-out with break minutes', () => {
      const result = checkOutSchema.safeParse({
        checkOutAt: '2026-09-20T17:00:00.000Z',
        breakMinutes: 60,
        notes: 'Menyelesaikan modul auth',
      });
      expect(result.success).toBe(true);
    });

    it('rejects negative break minutes', () => {
      const result = checkOutSchema.safeParse({
        checkOutAt: '2026-09-20T17:00:00.000Z',
        breakMinutes: -15,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('manualAttendanceSchema', () => {
    it('validates a complete manual attendance record', () => {
      const result = manualAttendanceSchema.safeParse({
        workDate: '2026-09-20',
        workMode: 'wfo',
        checkInAt: '2026-09-20T08:00:00.000Z',
        checkOutAt: '2026-09-20T17:00:00.000Z',
        breakMinutes: 60,
        location: 'Kantor Pusat',
        notes: 'Koreksi manual karena lupa check-in',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid workDate format', () => {
      const result = manualAttendanceSchema.safeParse({
        workDate: '20-09-2026',
        workMode: 'wfo',
      });
      expect(result.success).toBe(false);
    });

    it('rejects check-out without check-in', () => {
      const result = manualAttendanceSchema.safeParse({
        workDate: '2026-09-20',
        workMode: 'wfo',
        checkOutAt: '2026-09-20T17:00:00.000Z',
      });
      expect(result.success).toBe(false);
    });

    it('rejects check-out time earlier than check-in time', () => {
      const result = manualAttendanceSchema.safeParse({
        workDate: '2026-09-20',
        workMode: 'wfo',
        checkInAt: '2026-09-20T17:00:00.000Z',
        checkOutAt: '2026-09-20T08:00:00.000Z',
      });
      expect(result.success).toBe(false);
    });
  });
});
