import { AIHubView } from '@/features/ai/components/ai-hub-view';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Asisten AI — Internship Companion',
  description: 'Pusat bantuan AI pribadi untuk menyusun jurnal, memecahkan kendala, dan refleksi magang.',
};

export default function AssistantPage() {
  return (
    <div>
      <AIHubView />
    </div>
  );
}
