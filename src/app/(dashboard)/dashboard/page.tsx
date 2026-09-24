import { createClient } from '@/lib/supabase/server';
import { getActiveInternship } from '@/features/onboarding/actions/internship-actions';
import { getTodayAttendance } from '@/features/attendance/actions/attendance-actions';
import { getTasks } from '@/features/tasks/actions/task-actions';
import { getJournals } from '@/features/journals/actions/journal-actions';
import { getLearnings } from '@/features/learnings/actions/learning-actions';
import { getReports } from '@/features/reports/actions/report-actions';
import { DashboardView } from '@/features/dashboard/components/dashboard-view';

export const metadata = {
  title: 'Dashboard — Internship Companion',
  description: 'Ringkasan aktivitas harian, kehadiran, tugas, dan jurnal magang',
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [internship, todayAttendance, tasks, journals, learnings, reports] =
    await Promise.all([
      getActiveInternship(),
      getTodayAttendance(),
      getTasks(),
      getJournals(14),
      getLearnings(),
      getReports(),
    ]);

  return (
    <DashboardView
      user={user}
      internship={internship}
      todayAttendance={todayAttendance}
      tasks={tasks}
      journals={journals}
      learnings={learnings}
      reports={reports}
    />
  );
}
