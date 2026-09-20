import { PageHeader } from '@/components/layout/page-header';
import { LearningList } from '@/features/learnings/components/learning-list';
import { getLearnings } from '@/features/learnings/actions/learning-actions';

export const metadata = {
  title: 'Pembelajaran — Internship Companion',
  description: 'Catatan teknologi, konsep, dan kemampuan baru yang dipelajari selama magang',
};

export default async function LearningsPage() {
  const learnings = await getLearnings();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Catatan Pembelajaran"
        description="Dokumentasikan konsep, teknologi, dan keahlian baru yang kamu eksplorasi dan kuasai."
      />

      <LearningList learnings={learnings} />
    </div>
  );
}
