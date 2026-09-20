import { PageHeader } from '@/components/layout/page-header';
import { getDocuments } from '@/features/documents/actions/document-actions';
import { DocumentList } from '@/features/documents/components/document-list';

export const metadata = {
  title: 'Dokumen — Internship Companion',
  description: 'Penyimpanan berkas administrasi, sertifikat, dan artefak magang',
};

export default async function DocumentsPage() {
  const documents = await getDocuments();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dokumen & Berkas"
        description="Kelola berkas administrasi, piagam sertifikat, dan bukti hasil karya magang kamu."
      />

      <DocumentList documents={documents} />
    </div>
  );
}
