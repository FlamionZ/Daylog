import { PageHeader } from '@/components/layout/page-header';
import { TaskList } from '@/features/tasks/components/task-list';
import { getTasks } from '@/features/tasks/actions/task-actions';

export const metadata = {
  title: 'Tugas — Internship Companion',
  description: 'Kelola tugas, prioritas, dan tautan deliverable magang',
};

export default async function TasksPage() {
  const tasks = await getTasks();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tugas & Proyek"
        description="Kelola daftar tugas, prioritas kerja, dan tautan commit/PR deliverable magang."
      />

      <TaskList tasks={tasks} />
    </div>
  );
}
