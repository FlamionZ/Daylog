'use client';

import * as React from 'react';
import {
  FileText,
  Plus,
  Search,
  ExternalLink,
  Download,
  Trash2,
  Calendar,
  Award,
  Briefcase,
  Layers,
  FolderOpen,
  Loader2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EmptyState } from '@/components/feedback/empty-state';
import { DocumentUploadModal } from './document-upload-modal';
import {
  deleteDocument,
  getSignedDownloadUrl,
  type DocumentRecord,
} from '../actions/document-actions';
import { formatDate } from '@/lib/date';
import { toast } from 'sonner';

interface DocumentListProps {
  documents: DocumentRecord[];
  onRefresh?: () => void;
}

const categoryLabels: Record<string, string> = {
  administration: 'Administrasi',
  report: 'Laporan',
  certificate: 'Sertifikat',
  work_sample: 'Hasil Karya',
  other: 'Lainnya',
};

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  administration: FolderOpen,
  report: FileText,
  certificate: Award,
  work_sample: Briefcase,
  other: Layers,
};

export function DocumentList({
  documents: initialDocuments,
  onRefresh,
}: DocumentListProps) {
  const [deletedIds, setDeletedIds] = React.useState<Set<string>>(new Set());
  const [search, setSearch] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('all');
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null);

  const filtered = React.useMemo(() => {
    return initialDocuments
      .filter((d) => !deletedIds.has(d.id))
      .filter((d) => {
        const matchSearch =
          !search ||
          d.name.toLowerCase().includes(search.toLowerCase()) ||
          d.description?.toLowerCase().includes(search.toLowerCase());
        const matchCategory =
          categoryFilter === 'all' || d.category === categoryFilter;
        return matchSearch && matchCategory;
      });
  }, [initialDocuments, deletedIds, search, categoryFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah kamu yakin ingin menghapus dokumen ini?')) return;
    const result = await deleteDocument(id);
    if (result.success) {
      toast.success(result.message);
      setDeletedIds((prev) => new Set(prev).add(id));
      onRefresh?.();
    } else {
      toast.error(result.error || 'Gagal menghapus dokumen');
    }
  };

  const handleOpenOrDownload = async (doc: DocumentRecord) => {
    if (doc.external_url) {
      window.open(doc.external_url, '_blank', 'noopener,noreferrer');
      return;
    }

    if (doc.storage_path) {
      setDownloadingId(doc.id);
      try {
        const signedUrl = await getSignedDownloadUrl(doc.storage_path);
        if (signedUrl) {
          window.open(signedUrl, '_blank', 'noopener,noreferrer');
        } else {
          toast.error('Gagal membuat tautan unduhan berkas.');
        }
      } catch {
        toast.error('Terjadi kesalahan saat mengunduh berkas.');
      } finally {
        setDownloadingId(null);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Cari dokumen atau catatan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs bg-card text-foreground placeholder:text-muted-foreground rounded-full border-border shadow-2xs focus-visible:ring-primary/20"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-9 w-full sm:w-44 text-xs bg-card text-foreground rounded-full border-border shadow-2xs font-medium">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border bg-popover text-popover-foreground shadow-md">
              <SelectItem value="all">Semua Kategori</SelectItem>
              <SelectItem value="administration">Administrasi</SelectItem>
              <SelectItem value="report">Laporan</SelectItem>
              <SelectItem value="certificate">Sertifikat</SelectItem>
              <SelectItem value="work_sample">Hasil Karya</SelectItem>
              <SelectItem value="other">Lainnya</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <button
          type="button"
          onClick={() => setUploadOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 text-xs font-bold shadow-xs transition-all shrink-0 active:scale-95"
        >
          <Plus className="size-3.5" />
          <span>Tambah Dokumen</span>
        </button>
      </div>

      {/* Grid of Documents */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<FileText className="size-10 text-primary" />}
          title="Tidak ada dokumen ditemukan"
          description={
            search || categoryFilter !== 'all'
              ? 'Coba sesuaikan filter atau kata kunci pencarian.'
              : 'Kumpulkan berkas administrasi, sertifikat, dan hasil kerja magangmu dalam satu tempat.'
          }
          action={
            <button
              type="button"
              onClick={() => setUploadOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 text-xs font-bold shadow-xs transition-all"
            >
              <Plus className="size-3.5" />
              Tambah Dokumen Pertama
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((doc) => {
            const Icon = categoryIcons[doc.category] || FileText;
            const isFile = Boolean(doc.storage_path);
            const isDownloading = downloadingId === doc.id;

            return (
              <div
                key={doc.id}
                className="flex flex-col justify-between rounded-[24px] border border-border bg-card p-5 shadow-2xs hover:shadow-xs transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 pb-2">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-secondary/40 border border-border text-foreground">
                      <Icon className="size-4 text-primary" />
                    </div>
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-extrabold text-primary">
                      {categoryLabels[doc.category] || doc.category}
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-foreground mt-2 truncate">
                    {doc.name}
                  </h3>

                  {doc.description && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {doc.description}
                    </p>
                  )}

                  <div className="mt-3.5 flex items-center gap-3 text-[11px] text-muted-foreground font-mono">
                    {doc.document_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        {formatDate(doc.document_date, 'd MMM yyyy')}
                      </span>
                    )}

                    {doc.size_bytes ? (
                      <span>{(doc.size_bytes / (1024 * 1024)).toFixed(2)} MB</span>
                    ) : doc.external_url ? (
                      <span>Tautan Eksternal</span>
                    ) : null}
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-border flex items-center justify-between">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-bold text-foreground hover:bg-muted/15 transition-all shadow-2xs disabled:opacity-50"
                    onClick={() => handleOpenOrDownload(doc)}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : isFile ? (
                      <Download className="size-3.5 text-primary" />
                    ) : (
                      <ExternalLink className="size-3.5 text-primary" />
                    )}
                    <span>{isFile ? 'Unduh Berkas' : 'Buka Tautan'}</span>
                  </button>

                  <button
                    type="button"
                    aria-label="Hapus berkas"
                    className="size-8 rounded-full inline-flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    onClick={() => handleDelete(doc.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      <DocumentUploadModal
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onSuccess={onRefresh}
      />
    </div>
  );
}
