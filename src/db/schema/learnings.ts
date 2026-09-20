import {
  pgTable,
  uuid,
  text,
  date,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { profiles } from './profiles';
import { internships } from './internships';
import { journals } from './journals';
import { tasks } from './tasks';
import { learningLevelEnum } from './enums';

export const learnings = pgTable(
  'learnings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => profiles.userId, { onDelete: 'cascade' }),
    internshipId: uuid('internship_id')
      .notNull()
      .references(() => internships.id, { onDelete: 'cascade' }),
    journalId: uuid('journal_id').references(() => journals.id, {
      onDelete: 'set null',
    }),
    taskId: uuid('task_id').references(() => tasks.id, {
      onDelete: 'set null',
    }),
    topic: text('topic').notNull(),
    technology: text('technology'),
    summary: text('summary'),
    sourceUrl: text('source_url'),
    level: learningLevelEnum('level').notNull().default('exploring'),
    learnedOn: date('learned_on').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('idx_learnings_internship_date').on(
      table.internshipId,
      table.learnedOn,
    ),
    index('idx_learnings_internship_technology').on(
      table.internshipId,
      table.technology,
    ),
  ],
);

export type Learning = typeof learnings.$inferSelect;
export type NewLearning = typeof learnings.$inferInsert;
