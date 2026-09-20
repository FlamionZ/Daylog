import { PageHeader } from '@/components/layout/page-header';
import { getSettingsData } from '@/features/settings/actions/settings-actions';
import { SettingsView } from '@/features/settings/components/settings-view';

export const metadata = { title: 'Pengaturan — Internship Companion' };

export default async function SettingsPage() {
  const settingsData = await getSettingsData();

  return (
    <div>
      <PageHeader
        title="Pengaturan"
        description="Kelola profil akun, data program magang, dan preferensi aplikasi."
      />

      <div className="mt-6">
        <SettingsView initialData={settingsData} />
      </div>
    </div>
  );
}
