import { PageHeader } from '@/components/layout/page-header';
import { AttendanceCard } from '@/features/attendance/components/attendance-card';
import { AttendanceTable } from '@/features/attendance/components/attendance-table';
import {
  getTodayAttendance,
  getAttendanceList,
} from '@/features/attendance/actions/attendance-actions';

export const metadata = {
  title: 'Kehadiran — Internship Companion',
  description: 'Catat dan rekap kehadiran harian magang',
};

export default async function AttendancePage() {
  const [todayRecord, records] = await Promise.all([
    getTodayAttendance(),
    getAttendanceList(50),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kehadiran"
        description="Pantau status kehadiran harian dan riwayat jam kerja magang."
      />

      {/* Today's Status */}
      <div className="max-w-2xl">
        <AttendanceCard record={todayRecord} />
      </div>

      {/* History Table */}
      <div className="space-y-3">
        <h2 className="text-base font-extrabold text-black">
          Riwayat Kehadiran
        </h2>
        <AttendanceTable records={records} />
      </div>
    </div>
  );
}
