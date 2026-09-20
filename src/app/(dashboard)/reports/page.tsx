import { PageHeader } from '@/components/layout/page-header';
import { getReports } from '@/features/reports/actions/report-actions';
import { getActiveInternship } from '@/features/onboarding/actions/internship-actions';
import { getJournals } from '@/features/journals/actions/journal-actions';
import { getAttendanceList } from '@/features/attendance/actions/attendance-actions';
import { isKemnakerSynced } from '@/features/attendance/utils/kemnaker-sync';
import { getTasks } from '@/features/tasks/actions/task-actions';
import { calculateWorkedMinutes, formatDuration } from '@/lib/date';
import { ReportPageClient } from '@/features/reports/components/report-page-client';

export const metadata = {
  title: 'Laporan — Internship Companion',
  description: 'Generator laporan periodik mingguan, bulanan, dan akhir magang',
};

export default async function ReportsPage() {
  const [reports, internship, journals, attendance, tasks] = await Promise.all([
    getReports(),
    getActiveInternship(),
    getJournals(100),
    getAttendanceList(100),
    getTasks(),
  ]);

  const completedJournals = journals.filter((j) => j.status === 'completed').length;
  const syncedAttendance = attendance.filter((a) => isKemnakerSynced(a.notes)).length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const totalWorkedMinutes = attendance.reduce((acc, a) => {
    if (a.check_in_at && a.check_out_at) {
      return acc + calculateWorkedMinutes(new Date(a.check_in_at), new Date(a.check_out_at), a.break_minutes || 0);
    }
    return acc;
  }, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan Magang"
        description="Susun laporan mingguan, bulanan, dan akhir magang dengan agregasi data otomatis dari jurnal dan kehadiran."
      />

      <ReportPageClient
        initialReports={reports}
        activeInternship={
          internship
            ? {
                companyName: internship.company_name,
                roleTitle: internship.role_title,
                startDate: internship.start_date,
                endDate: internship.end_date,
              }
            : null
        }
        statistics={{
          totalJournals: journals.length,
          completedJournals,
          totalAttendance: attendance.length,
          syncedAttendance,
          completedTasks,
          totalHoursFormatted: formatDuration(totalWorkedMinutes),
        }}
      />
    </div>
  );
}
