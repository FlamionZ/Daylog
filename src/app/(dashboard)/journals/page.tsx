import { PageHeader } from '@/components/layout/page-header';
import { JournalPageClient } from '@/features/journals/components/journal-page-client';
import { getJournals } from '@/features/journals/actions/journal-actions';
import { getTasks } from '@/features/tasks/actions/task-actions';

export const metadata = {
  title: 'Jurnal — Internship Companion',
  description: 'Catatan aktivitas, pembelajaran, dan kendala harian magang',
};

export default async function JournalsPage() {
  const [journals, tasks] = await Promise.all([
    getJournals(50),
    getTasks(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jurnal Harian"
        description="Dokumentasikan apa yang kamu kerjakan, pelajari, dan kendala yang dihadapi setiap hari."
      />

      <JournalPageClient
        initialJournals={journals}
        availableTasks={tasks}
      />
    </div>
  );
}
