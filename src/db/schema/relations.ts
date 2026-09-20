import { relations } from 'drizzle-orm';
import { profiles } from './profiles';
import { internships } from './internships';
import { attendanceRecords } from './attendance';
import { journals, journalTasks } from './journals';
import { tasks, taskLinks } from './tasks';
import { learnings } from './learnings';
import { reports } from './reports';
import { documents } from './documents';

export const profilesRelations = relations(profiles, ({ many }) => ({
  internships: many(internships),
  attendanceRecords: many(attendanceRecords),
  journals: many(journals),
  tasks: many(tasks),
  learnings: many(learnings),
  reports: many(reports),
  documents: many(documents),
}));

export const internshipsRelations = relations(internships, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [internships.userId],
    references: [profiles.userId],
  }),
  attendanceRecords: many(attendanceRecords),
  journals: many(journals),
  tasks: many(tasks),
  learnings: many(learnings),
  reports: many(reports),
  documents: many(documents),
}));

export const attendanceRecordsRelations = relations(
  attendanceRecords,
  ({ one }) => ({
    profile: one(profiles, {
      fields: [attendanceRecords.userId],
      references: [profiles.userId],
    }),
    internship: one(internships, {
      fields: [attendanceRecords.internshipId],
      references: [internships.id],
    }),
  }),
);

export const journalsRelations = relations(journals, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [journals.userId],
    references: [profiles.userId],
  }),
  internship: one(internships, {
    fields: [journals.internshipId],
    references: [internships.id],
  }),
  journalTasks: many(journalTasks),
  learnings: many(learnings),
}));

export const journalTasksRelations = relations(journalTasks, ({ one }) => ({
  profile: one(profiles, {
    fields: [journalTasks.userId],
    references: [profiles.userId],
  }),
  journal: one(journals, {
    fields: [journalTasks.journalId],
    references: [journals.id],
  }),
  task: one(tasks, {
    fields: [journalTasks.taskId],
    references: [tasks.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [tasks.userId],
    references: [profiles.userId],
  }),
  internship: one(internships, {
    fields: [tasks.internshipId],
    references: [internships.id],
  }),
  taskLinks: many(taskLinks),
  journalTasks: many(journalTasks),
  learnings: many(learnings),
}));

export const taskLinksRelations = relations(taskLinks, ({ one }) => ({
  profile: one(profiles, {
    fields: [taskLinks.userId],
    references: [profiles.userId],
  }),
  task: one(tasks, {
    fields: [taskLinks.taskId],
    references: [tasks.id],
  }),
}));

export const learningsRelations = relations(learnings, ({ one }) => ({
  profile: one(profiles, {
    fields: [learnings.userId],
    references: [profiles.userId],
  }),
  internship: one(internships, {
    fields: [learnings.internshipId],
    references: [internships.id],
  }),
  journal: one(journals, {
    fields: [learnings.journalId],
    references: [journals.id],
  }),
  task: one(tasks, {
    fields: [learnings.taskId],
    references: [tasks.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  profile: one(profiles, {
    fields: [reports.userId],
    references: [profiles.userId],
  }),
  internship: one(internships, {
    fields: [reports.internshipId],
    references: [internships.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  profile: one(profiles, {
    fields: [documents.userId],
    references: [profiles.userId],
  }),
  internship: one(internships, {
    fields: [documents.internshipId],
    references: [internships.id],
  }),
}));
