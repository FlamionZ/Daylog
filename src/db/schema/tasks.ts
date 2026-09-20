import {
  pgTable,
  uuid,
  text,
  date,
  integer,
  numeric,
  timestamp,
  index,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { profiles } from './profiles';
import { internships } from './internships';
import { taskStatusEnum, taskPriorityEnum, taskLinkTypeEnum } from './enums';

export const tasks = pgTable(
  'tasks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => profiles.userId, { onDelete: 'cascade' }),
    internshipId: uuid('internship_id')
      .notNull()
      .references(() => internships.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    status: taskStatusEnum('status').notNull().default('backlog'),
    priority: taskPriorityEnum('priority').notNull().default('medium'),
    dueDate: date('due_date'),
    estimateMinutes: integer('estimate_minutes'),
    actualMinutes: integer('actual_minutes'),
    sortOrder: numeric('sort_order').notNull().default('0'),
    startedAt: timestamp('started_at', { withTimezone: true, mode: 'string' }),
    completedAt: timestamp('completed_at', { withTimezone: true, mode: 'string' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      'task_estimate_minutes_check',
      sql`${table.estimateMinutes} IS NULL OR ${table.estimateMinutes} >= 0`,
    ),
    check(
      'task_actual_minutes_check',
      sql`${table.actualMinutes} IS NULL OR ${table.actualMinutes} >= 0`,
    ),
    index('idx_tasks_internship_status_sort').on(
      table.internshipId,
      table.status,
      table.sortOrder,
    ),
    index('idx_tasks_internship_due_date').on(
      table.internshipId,
      table.dueDate,
    ),
  ],
);

export const taskLinks = pgTable(
  'task_links',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => profiles.userId, { onDelete: 'cascade' }),
    taskId: uuid('task_id')
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),
    linkType: taskLinkTypeEnum('link_type').notNull(),
    label: text('label'),
    url: text('url').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('idx_task_links_task_type').on(table.taskId, table.linkType),
  ],
);

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type TaskLink = typeof taskLinks.$inferSelect;
export type NewTaskLink = typeof taskLinks.$inferInsert;
