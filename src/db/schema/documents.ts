import {
  pgTable,
  uuid,
  text,
  date,
  bigint,
  timestamp,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { profiles } from './profiles';
import { internships } from './internships';
import { documentCategoryEnum } from './enums';

export const documents = pgTable(
  'documents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => profiles.userId, { onDelete: 'cascade' }),
    internshipId: uuid('internship_id')
      .notNull()
      .references(() => internships.id, { onDelete: 'cascade' }),
    category: documentCategoryEnum('category').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    storagePath: text('storage_path'),
    externalUrl: text('external_url'),
    mimeType: text('mime_type'),
    sizeBytes: bigint('size_bytes', { mode: 'number' }),
    documentDate: date('document_date'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      'document_storage_or_url_check',
      sql`(${table.storagePath} IS NOT NULL AND ${table.externalUrl} IS NULL) OR (${table.storagePath} IS NULL AND ${table.externalUrl} IS NOT NULL)`,
    ),
    check(
      'document_size_bytes_check',
      sql`${table.sizeBytes} IS NULL OR ${table.sizeBytes} >= 0`,
    ),
  ],
);

export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
