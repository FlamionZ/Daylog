import { pgEnum } from 'drizzle-orm/pg-core';

/**
 * Enumerations per Schema.md §3
 */

export const workModeEnum = pgEnum('work_mode', [
  'wfo',
  'wfh',
  'hybrid',
  'leave',
  'sick',
  'holiday',
]);

export const journalStatusEnum = pgEnum('journal_status', [
  'draft',
  'completed',
]);

export const taskStatusEnum = pgEnum('task_status', [
  'backlog',
  'todo',
  'in_progress',
  'review',
  'blocked',
  'done',
]);

export const taskPriorityEnum = pgEnum('task_priority', [
  'low',
  'medium',
  'high',
  'urgent',
]);

export const learningLevelEnum = pgEnum('learning_level', [
  'exploring',
  'learning',
  'practicing',
  'confident',
]);

export const reportTypeEnum = pgEnum('report_type', [
  'weekly',
  'monthly',
  'final',
  'custom',
]);

export const reportStatusEnum = pgEnum('report_status', [
  'draft',
  'final',
]);

export const documentCategoryEnum = pgEnum('document_category', [
  'administration',
  'report',
  'certificate',
  'work_sample',
  'other',
]);

export const taskLinkTypeEnum = pgEnum('task_link_type', [
  'repository',
  'branch',
  'commit',
  'pull_request',
  'deployment',
  'documentation',
  'other',
]);
