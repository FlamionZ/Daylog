import { describe, it, expect } from 'vitest';
import { taskFormSchema, taskLinkSchema } from '../schemas/task-schema';

describe('Task Schemas', () => {
  describe('taskFormSchema', () => {
    it('validates a task with minimum required fields', () => {
      const result = taskFormSchema.safeParse({
        title: 'Implementasi Autentikasi',
        status: 'todo',
        priority: 'medium',
      });
      expect(result.success).toBe(true);
    });

    it('validates a complete task with all optional fields', () => {
      const result = taskFormSchema.safeParse({
        title: 'Desain ERD Database',
        description: 'Merancang 10 tabel PostgreSQL',
        status: 'in_progress',
        priority: 'urgent',
        dueDate: '2026-09-25',
        estimateMinutes: 240,
        actualMinutes: 180,
      });
      expect(result.success).toBe(true);
    });

    it('rejects title that is too short', () => {
      const result = taskFormSchema.safeParse({
        title: 'A',
        status: 'todo',
        priority: 'medium',
      });
      expect(result.success).toBe(false);
    });

    it('rejects negative estimate minutes', () => {
      const result = taskFormSchema.safeParse({
        title: 'Task Invalid',
        status: 'todo',
        priority: 'medium',
        estimateMinutes: -30,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('taskLinkSchema', () => {
    it('validates a GitHub pull request link', () => {
      const result = taskLinkSchema.safeParse({
        taskId: '550e8400-e29b-41d4-a716-446655440000',
        url: 'https://github.com/user/repo/pull/42',
        label: 'PR #42: Add attendance module',
        linkType: 'pull_request',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid URL format', () => {
      const result = taskLinkSchema.safeParse({
        taskId: '550e8400-e29b-41d4-a716-446655440000',
        url: 'not-a-valid-url',
        label: 'Invalid',
        linkType: 'repository',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid link type', () => {
      const result = taskLinkSchema.safeParse({
        taskId: '550e8400-e29b-41d4-a716-446655440000',
        url: 'https://example.com',
        label: 'Example',
        linkType: 'unknown_type',
      });
      expect(result.success).toBe(false);
    });
  });
});
