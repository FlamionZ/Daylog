import {
  pgTable,
  uuid,
  text,
  date,
  integer,
  timestamp,
  uniqueIndex,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { profiles } from './profiles';
import { internships } from './internships';
import { workModeEnum } from './enums';

export const attendanceRecords = pgTable(
  'attendance_records',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => profiles.userId, { onDelete: 'cascade' }),
    internshipId: uuid('internship_id')
      .notNull()
      .references(() => internships.id, { onDelete: 'cascade' }),
    workDate: date('work_date').notNull(),
    workMode: workModeEnum('work_mode').notNull(),
    checkInAt: timestamp('check_in_at', { withTimezone: true, mode: 'string' }),
    checkOutAt: timestamp('check_out_at', { withTimezone: true, mode: 'string' }),
    breakMinutes: integer('break_minutes').notNull().default(0),
    location: text('location'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_attendance_internship_date').on(
      table.internshipId,
      table.workDate,
    ),
    check('attendance_break_minutes_check', sql`${table.breakMinutes} >= 0`),
    check(
      'attendance_checkout_needs_checkin',
      sql`${table.checkOutAt} IS NULL OR ${table.checkInAt} IS NOT NULL`,
    ),
    check(
      'attendance_checkout_after_checkin',
      sql`${table.checkOutAt} IS NULL OR ${table.checkOutAt} >= ${table.checkInAt}`,
    ),
  ],
);

export type AttendanceRecord = typeof attendanceRecords.$inferSelect;
export type NewAttendanceRecord = typeof attendanceRecords.$inferInsert;
