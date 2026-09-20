'use client';

import * as React from 'react';
import {
  FileText,
  Plus,
  Calendar,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EmptyState } from '@/components/feedback/empty-state';
import { formatDate } from '@/lib/date';
import { deleteReport, type ReportRecord } from '../actions/report-actions';
import { toast } from 'sonner';

interface ReportListProps {
  reports: ReportRecord[];
  onSelectReport: (report: ReportRecord) => void;
  onEditReport: (report: ReportRecord) => void;
  onNewReport: () => void;
  onRefresh?: () => void;
}

const typeLabels: Record<string, string> = {
  weekly: 'Mingguan',
  monthly: 'Bulanan',
  final: 'Akhir',
  custom: 'Kustom',
};

export function ReportList({
  reports: initialReports,
  onSelectReport,
  onEditReport,
  onNewReport,
  onRefresh,
}: ReportListProps) {
  const [deletedIds, setDeletedIds] = React.useState<Set<string>>(new Set());
  const [typeFilter, setTypeFilter] = React.useState('all');
  const [statusFilter, setStatusFilter] = React.useState('all');

  const filtered = React.useMemo(() => {
    return initialReports
      .filter((r) => !deletedIds.has(r.id))
      .filter((r) => {
        const matchType = typeFilter === 'all' || r.report_type === typeFilter;
        const matchStatus = statusFilter === 'all' || r.status === statusFilter;
        return matchType && matchStatus;
      });
  }, [initialReports, deletedIds, typeFilter, statusFilter]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Apakah kamu yakin ingin menghapus laporan ini?')) return;

    const result = await deleteReport(id);
    if (result.success) {
      toast.success(result.message);
      setDeletedIds((prev) => new Set(prev).add(id));
      onRefresh?.();
    } else {
      toast.error(result.error || 'Gagal menghapus laporan');
    }
  };

  if (initialReports.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="size-10" />}
        title="Belum ada laporan yang disusun"
        description="Gunakan fitur agregasi otomatis untuk menyusun laporan mingguan atau bulanan secara instan dari catatan jurnal & kehadiran."
        action={
          <button
            type="button"
            onClick={onNewReport}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all"
          >
            <Plus className="size-3.5" />
            Buat Laporan Pertama
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-9 w-36 text-xs bg-card text-foreground rounded-full border-border shadow-2xs font-medium">
              <SelectValue placeholder="Tipe" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border bg-popover text-popover-foreground shadow-md">
              <SelectItem value="all">Semua Tipe</SelectItem>
              <SelectItem value="weekly">Mingguan</SelectItem>
              <SelectItem value="monthly">Bulanan</SelectItem>
              <SelectItem value="final">Akhir</SelectItem>
              <SelectItem value="custom">Kustom</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-32 text-xs bg-card text-foreground rounded-full border-border shadow-2xs font-medium">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border bg-popover text-popover-foreground shadow-md">
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="final">Final</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <button
          type="button"
          onClick={onNewReport}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all shrink-0 active:scale-95"
        >
          <Plus className="size-3.5" />
          <span>Buat Laporan Baru</span>
        </button>
      </div>

      {/* Reports Grid / Cards */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-xs text-muted-foreground border border-border rounded-[20px] bg-card">
          Tidak ada laporan yang sesuai dengan filter yang dipilih.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((report) => {
            const isFinal = report.status === 'final';

            return (
              <div
                key={report.id}
                onClick={() => onSelectReport(report)}
                className="group flex flex-col gap-3 rounded-[20px] border border-border bg-card p-5 shadow-2xs transition-all hover:shadow-xs cursor-pointer sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase font-mono ${
                        isFinal
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                          : 'bg-muted/15 text-muted-foreground border border-border'
                      }`}
                    >
                      {isFinal ? 'Final' : 'Draft'}
                    </span>
                    <span className="rounded-full bg-purple-500/15 px-2.5 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-300">
                      Laporan {typeLabels[report.report_type] || report.report_type}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                      <Calendar className="size-3" />
                      {formatDate(report.period_start, 'd MMM')} — {formatDate(report.period_end, 'd MMM yyyy')}
                    </span>
                  </div>

                  <h3 className="mt-2 text-base font-extrabold text-foreground truncate leading-snug">
                    {report.title}
                  </h3>

                  <p className="mt-1 text-xs text-muted-foreground line-clamp-1 leading-relaxed">
                    {report.content_markdown.slice(0, 150)}...
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-2 border-t border-border sm:border-t-0 sm:pt-0">
                  {!isFinal && (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted/15 transition-all shadow-2xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditReport(report);
                      }}
                    >
                      <Edit className="size-3.5 text-blue-500" />
                      Edit
                    </button>
                  )}

                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-full bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-2xs"
                    onClick={() => onSelectReport(report)}
                  >
                    <Eye className="size-3.5" />
                    Lihat
                  </button>

                  <button
                    type="button"
                    aria-label="Hapus laporan"
                    className="size-8 rounded-full inline-flex items-center justify-center text-[#888480] dark:text-[#8493A8] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    onClick={(e) => handleDelete(report.id, e)}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
