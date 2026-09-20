import {
  pgTable,
  uuid,
  text,
  date,
  jsonb,
  timestamp,
  uniqueIndex,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { profiles } from './profiles';
import { internships } from './internships';
import { reportTypeEnum, reportStatusEnum } from './enums';

export interface ReportStatistics {
  workingDays?: number;
  workedMinutes?: number;
  completedTasks?: number;
  blockedTasks?: number;
  completedJournals?: number;
  [key: string]: unknown;
}

export const reports = pgTable(
  'reports',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => profiles.userId, { onDelete: 'cascade' }),
    internshipId: uuid('internship_id')
      .notNull()
      .references(() => internships.id, { onDelete: 'cascade' }),
    reportType: reportTypeEnum('report_type').notNull(),
    periodStart: date('period_start').notNull(),
    periodEnd: date('period_end').notNull(),
    title: text('title').notNull(),
    contentMarkdown: text('content_markdown').notNull(),
    sourceSnapshot: jsonb('source_snapshot').notNull().default({}),
    statistics: jsonb('statistics').$type<ReportStatistics>().notNull().default({}),
    status: reportStatusEnum('status').notNull().default('draft'),
    finalizedAt: timestamp('finalized_at', { withTimezone: true, mode: 'string' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      'report_period_check',
      sql`${table.periodEnd} >= ${table.periodStart}`,
    ),
    uniqueIndex('idx_reports_unique_final')
      .on(
        table.internshipId,
        table.reportType,
        table.periodStart,
        table.periodEnd,
      )
      .where(sql`${table.status} = 'final'`),
  ],
);

export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;
