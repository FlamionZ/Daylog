import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  boolean,
  date,
  timestamp,
  jsonb,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { profiles } from './profiles';
import { internships } from './internships';

export const aiGenerations = pgTable(
  'ai_generations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => profiles.userId, { onDelete: 'cascade' }),
    internshipId: uuid('internship_id').references(() => internships.id, {
      onDelete: 'set null',
    }),
    feature: text('feature').notNull(),
    provider: text('provider').notNull(),
    model: text('model').notNull(),
    inputEntityType: text('input_entity_type'),
    inputEntityIds: jsonb('input_entity_ids'),
    status: text('status').notNull().default('completed'), // 'pending' | 'completed' | 'failed'
    resultJson: jsonb('result_json'),
    appliedAt: timestamp('applied_at', { withTimezone: true, mode: 'string' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'string' }),
  },
);

export const aiUsageDaily = pgTable(
  'ai_usage_daily',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => profiles.userId, { onDelete: 'cascade' }),
    usageDate: date('usage_date').notNull(),
    requestCount: integer('request_count').notNull().default(0),
    inputTokens: integer('input_tokens'),
    outputTokens: integer('output_tokens'),
    estimatedCost: numeric('estimated_cost', { precision: 10, scale: 6 }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_unique_ai_user_daily_usage').on(table.userId, table.usageDate),
  ],
);

export const aiPreferences = pgTable('ai_preferences', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => profiles.userId, { onDelete: 'cascade' }),
  isEnabled: boolean('is_enabled').notNull().default(true),
  saveHistory: boolean('save_history').notNull().default(false),
  allowSelectedDocuments: boolean('allow_selected_documents').notNull().default(false),
  dailyRequestLimit: integer('daily_request_limit').notNull().default(30),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .defaultNow(),
});

export type AIGeneration = typeof aiGenerations.$inferSelect;
export type NewAIGeneration = typeof aiGenerations.$inferInsert;

export type AIUsageDaily = typeof aiUsageDaily.$inferSelect;
export type NewAIUsageDaily = typeof aiUsageDaily.$inferInsert;

export type AIPreferences = typeof aiPreferences.$inferSelect;
export type NewAIPreferences = typeof aiPreferences.$inferInsert;
