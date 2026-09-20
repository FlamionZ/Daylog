import { getAIUsageStatsAction } from '@/features/ai/actions/ai-actions';
import { AIHubView } from '@/features/ai/components/ai-hub-view';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Asisten AI — Internship Companion',
  description: 'Pusat bantuan AI pribadi untuk menyusun jurnal, memecahkan kendala, dan refleksi magang.',
};

export default async function AssistantPage() {
  const result = await getAIUsageStatsAction();

  return (
    <div>
      <AIHubView initialStats={result.success ? result.data : undefined} />
    </div>
  );
}
