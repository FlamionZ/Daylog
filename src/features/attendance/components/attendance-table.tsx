'use client';

import * as React from 'react';
import { EmptyState } from '@/components/feedback/empty-state';
import {
  Clock,
  Calendar,
  Building,
  Home,
  Briefcase,
  HeartPulse,
  FileText,
  Sparkles,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDate, formatTime, calculateWorkedMinutes, formatDuration } from '@/lib/date';
import {
  toggleKemnakerAttendanceChecklist,
  getKemnakerAttendanceRecap,
} from '../actions/attendance-actions';
import { isKemnakerSynced } from '../utils/kemnaker-sync';

interface AttendanceRecordItem {
  id: string;
  work_date: string;
  work_mode: string;
  check_in_at: string | null;
  check_out_at: string | null;
  break_minutes: number;
  location: string | null;
  notes: string | null;
}

interface AttendanceTableProps {
  records: AttendanceRecordItem[];
  onAddClick?: () => void;
}

const modeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  wfo: Building,
  wfh: Home,
  hybrid: Briefcase,
  sick: HeartPulse,
  leave: FileText,
  holiday: Sparkles,
};

export function AttendanceTable({ records, onAddClick }: AttendanceTableProps) {
  const [filterMode, setFilterMode] = React.useState<'all' | 'uncheck'>('all');
  const [isCopying, setIsCopying] = React.useState(false);

  const unSyncedCount = React.useMemo(() => {
    return records.filter((r) => !isKemnakerSynced(r.notes)).length;
  }, [records]);

  const filteredRecords = React.useMemo(() => {
    if (filterMode === 'uncheck') {
      return records.filter((r) => !isKemnakerSynced(r.notes));
    }
    return records;
  }, [records, filterMode]);

  const handleToggleKemnaker = async (id: string, currentSynced: boolean) => {
    const res = await toggleKemnakerAttendanceChecklist(id, !currentSynced);
    if (res.success) {
      toast.success(res.message);
      window.location.reload();
    } else {
      toast.error(res.error || 'Gagal memperbarui status');
    }
  };

  const handleCopyRecap = async () => {
    setIsCopying(true);
    try {
      const data = await getKemnakerAttendanceRecap();
      if (data.text) {
        navigator.clipboard.writeText(data.text);
        toast.success('Rekap presensi berhasil disalin!', {
          description: `${data.totalRecords} catatan disalin (${data.unSyncedCount} belum diceklis di web).`,
        });
      } else {
        toast.error('Tidak ada data presensi untuk disalin.');
      }
    } catch {
      toast.error('Gagal menyalin rekap presensi.');
    } finally {
      setIsCopying(false);
    }
  };

  if (!records || records.length === 0) {
    return (
      <EmptyState
        icon={<Calendar className="size-10" />}
        title="Belum ada riwayat kehadiran"
        description="Catat kehadiran harianmu untuk mulai memantau jam kerja dan kepatuhan magang."
        action={
          onAddClick ? (
            <button
              onClick={onAddClick}
              className="inline-flex items-center justify-center rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] shadow-xs hover:bg-[hsl(var(--primary)/0.9)]"
            >
              Check-in Sekarang
            </button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Kemnaker Action Bar & Filter */}
      <div className="flex flex-col gap-3 rounded-[24px] border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
              filterMode === 'all'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'border border-border bg-surface text-muted-foreground hover:bg-muted/10 hover:text-foreground'
            }`}
          >
            <span>Semua Riwayat</span>
            <span
              className={`rounded-full px-1.5 py-0 font-mono text-[10px] ${
                filterMode === 'all' ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-secondary text-muted-foreground'
              }`}
            >
              {records.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('uncheck')}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
              filterMode === 'uncheck'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : unSyncedCount > 0
                  ? 'border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20'
                  : 'border border-border bg-surface text-muted-foreground hover:bg-muted/10 hover:text-foreground'
            }`}
          >
            <span>Belum Ceklist di Web</span>
            <span
              className={`rounded-full px-1.5 py-0 font-mono text-[10px] ${
                filterMode === 'uncheck' ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
              }`}
            >
              {unSyncedCount}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyRecap}
            disabled={isCopying}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-bold text-foreground hover:bg-muted/15 transition-all shadow-2xs"
            title="Salin rekap presensi seluruh periode sesuai format kolom Kemnaker"
          >
            <Copy className="size-3.5" />
            <span>Salin Rekap Kemnaker</span>
          </button>

          <a
            href="https://monev.maganghub.kemnaker.go.id"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-1.5 text-xs font-bold transition-colors shadow-2xs"
          >
            <span>Buka Portal</span>
            <ExternalLink className="size-3" />
          </a>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden overflow-hidden rounded-[24px] border border-border bg-card shadow-sm md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-secondary/30 text-xs font-bold text-muted-foreground">
            <tr>
              <th className="px-5 py-3.5">Tanggal</th>
              <th className="px-4 py-3.5">Mode</th>
              <th className="px-4 py-3.5">Check-in</th>
              <th className="px-4 py-3.5">Check-out</th>
              <th className="px-4 py-3.5">Istirahat</th>
              <th className="px-4 py-3.5">Durasi</th>
              <th className="px-4 py-3.5">Lokasi / Catatan</th>
              <th className="px-5 py-3.5 text-center">Web Kemnaker</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredRecords.map((r) => {
              const ModeIcon = modeIcons[r.work_mode] || Clock;
              const hasCheckIn = Boolean(r.check_in_at);
              const hasCheckOut = Boolean(r.check_out_at);
              const isSynced = isKemnakerSynced(r.notes);
              const cleanNotes = r.notes?.replace('[kemnaker_synced]', '').trim();

              let durationText = '-';
              if (hasCheckIn && hasCheckOut) {
                const mins = calculateWorkedMinutes(
                  new Date(r.check_in_at!),
                  new Date(r.check_out_at!),
                  r.break_minutes || 0,
                );
                durationText = formatDuration(mins);
              } else if (hasCheckIn) {
                durationText = 'Sedang bekerja';
              }

              return (
                <tr key={r.id} className="transition-colors hover:bg-muted/10">
                  <td className="px-5 py-3.5 font-medium text-foreground">
                    {formatDate(r.work_date, 'EEE, dd MMM yyyy')}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-bold uppercase text-secondary-foreground">
                      <ModeIcon className="size-3" />
                      <span>{r.work_mode}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs font-semibold text-foreground">
                    {r.check_in_at ? formatTime(new Date(r.check_in_at)) : '-'}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs font-semibold text-foreground">
                    {r.check_out_at ? formatTime(new Date(r.check_out_at)) : '-'}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground">
                    {r.break_minutes ? `${r.break_minutes}m` : '-'}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs font-bold text-foreground">
                    {durationText}
                  </td>
                  <td className="max-w-[220px] truncate px-4 py-3.5 text-xs text-muted-foreground">
                    {cleanNotes || r.location || '-'}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleKemnaker(r.id, isSynced)}
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold transition-all shadow-2xs ${
                        isSynced
                          ? 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25'
                          : 'bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25'
                      }`}
                      title="Klik untuk mengubah status ceklist Kemnaker"
                    >
                      {isSynced ? '✓ Diceklis' : '⏳ Belum'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filteredRecords.map((r) => {
          const ModeIcon = modeIcons[r.work_mode] || Clock;
          const hasCheckIn = Boolean(r.check_in_at);
          const hasCheckOut = Boolean(r.check_out_at);
          const isSynced = isKemnakerSynced(r.notes);
          const cleanNotes = r.notes?.replace('[kemnaker_synced]', '').trim();

          let durationText = '-';
          if (hasCheckIn && hasCheckOut) {
            const mins = calculateWorkedMinutes(
              new Date(r.check_in_at!),
              new Date(r.check_out_at!),
              r.break_minutes || 0,
            );
            durationText = formatDuration(mins);
          } else if (hasCheckIn && !hasCheckOut) {
            durationText = 'Sedang bekerja';
          }

          return (
            <div
              key={r.id}
              className="rounded-[20px] border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex items-center justify-between pb-2.5 border-b border-border">
                <span className="font-bold text-sm text-foreground">
                  {formatDate(r.work_date, 'EEE, d MMM yyyy')}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-bold uppercase text-secondary-foreground">
                    <ModeIcon className="size-3" />
                    {r.work_mode}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleKemnaker(r.id, isSynced)}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold shadow-2xs ${
                      isSynced
                        ? 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {isSynced ? '✓ Web' : '⏳ Ceklist'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Check-in</span>
                  <p className="font-mono font-bold text-foreground mt-0.5">
                    {r.check_in_at ? formatTime(new Date(r.check_in_at)) : '-'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Check-out</span>
                  <p className="font-mono font-bold text-foreground mt-0.5">
                    {r.check_out_at ? formatTime(new Date(r.check_out_at)) : '-'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Durasi</span>
                  <p className="font-mono font-extrabold text-foreground mt-0.5">
                    {durationText}
                  </p>
                </div>
              </div>

              {(r.location || cleanNotes) && (
                <div className="mt-3 pt-2 border-t border-border text-xs text-muted-foreground">
                  {r.location && <span className="font-medium text-foreground">📍 {r.location} </span>}
                  {cleanNotes && <p className="mt-0.5">{cleanNotes}</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

