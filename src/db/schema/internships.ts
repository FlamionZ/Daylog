import {
  pgTable,
  uuid,
  text,
  date,
  time,
  boolean,
  timestamp,
  uniqueIndex,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { profiles } from './profiles';

export const internships = pgTable(
  'internships',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => profiles.userId, { onDelete: 'cascade' }),
    companyName: text('company_name').notNull(),
    roleTitle: text('role_title').notNull(),
    location: text('location'),
    mentorName: text('mentor_name'),
    mentorContact: text('mentor_contact'),
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    defaultStartTime: time('default_start_time'),
    defaultEndTime: time('default_end_time'),
    isActive: boolean('is_active').notNull().default(true),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check('internship_dates_check', sql`${table.endDate} >= ${table.startDate}`),
    uniqueIndex('idx_unique_active_internship')
      .on(table.userId)
      .where(sql`${table.isActive} = true`),
  ],
);

export type Internship = typeof internships.$inferSelect;
export type NewInternship = typeof internships.$inferInsert;
