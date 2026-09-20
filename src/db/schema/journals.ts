import {
  pgTable,
  uuid,
  text,
  date,
  timestamp,
  uniqueIndex,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { profiles } from './profiles';
import { internships } from './internships';
import { tasks } from './tasks';
import { journalStatusEnum } from './enums';

export const journals = pgTable(
  'journals',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => profiles.userId, { onDelete: 'cascade' }),
    internshipId: uuid('internship_id')
      .notNull()
      .references(() => internships.id, { onDelete: 'cascade' }),
    journalDate: date('journal_date').notNull(),
    title: text('title'),
    summary: text('summary'),
    activities: text('activities'),
    learnings: text('learnings'),
    blockers: text('blockers'),
    solutions: text('solutions'),
    nextPlan: text('next_plan'),
    status: journalStatusEnum('status').notNull().default('draft'),
    completedAt: timestamp('completed_at', { withTimezone: true, mode: 'string' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_journals_internship_date').on(
      table.internshipId,
      table.journalDate,
    ),
  ],
);

export const journalTasks = pgTable(
  'journal_tasks',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => profiles.userId, { onDelete: 'cascade' }),
    journalId: uuid('journal_id')
      .notNull()
      .references(() => journals.id, { onDelete: 'cascade' }),
    taskId: uuid('task_id')
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.journalId, table.taskId] }),
  ],
);

export type Journal = typeof journals.$inferSelect;
export type NewJournal = typeof journals.$inferInsert;
export type JournalTask = typeof journalTasks.$inferSelect;
export type NewJournalTask = typeof journalTasks.$inferInsert;
