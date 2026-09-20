'use client';

import * as React from 'react';
import { Plus, Search, ExternalLink, GraduationCap, Calendar, Trash2, Edit, Code2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EmptyState } from '@/components/feedback/empty-state';
import { LearningFormModal } from './learning-form-modal';
import { deleteLearning } from '../actions/learning-actions';
import { formatDate } from '@/lib/date';
import { toast } from 'sonner';

import type { LearningRecord } from '../actions/learning-actions';

interface LearningListProps {
  learnings: LearningRecord[];
  onRefresh?: () => void;
}

const levelBadges: Record<string, { label: string }> = {
  exploring: { label: 'Exploring' },
  learning: { label: 'Learning' },
  practicing: { label: 'Practicing' },
  confident: { label: 'Confident' },
};

export function LearningList({
  learnings: initialLearnings,
  onRefresh,
}: LearningListProps) {
  const [deletedIds, setDeletedIds] = React.useState<Set<string>>(new Set());
  const [search, setSearch] = React.useState('');
  const [levelFilter, setLevelFilter] = React.useState('all');

  const [formOpen, setFormOpen] = React.useState(false);
  const [selectedLearning, setSelectedLearning] = React.useState<LearningRecord | null>(null);

  const filtered = React.useMemo(() => {
    return initialLearnings
      .filter((l) => !deletedIds.has(l.id))
      .filter((l) => {
        const matchSearch =
          !search ||
          l.topic.toLowerCase().includes(search.toLowerCase()) ||
          l.technology?.toLowerCase().includes(search.toLowerCase()) ||
          l.summary?.toLowerCase().includes(search.toLowerCase());
        const matchLevel = levelFilter === 'all' || l.level === levelFilter;
        return matchSearch && matchLevel;
      });
  }, [initialLearnings, deletedIds, search, levelFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah kamu yakin ingin menghapus catatan pembelajaran ini?')) return;
    const result = await deleteLearning(id);
    if (result.success) {
      toast.success(result.message);
      setDeletedIds((prev) => new Set(prev).add(id));
      onRefresh?.();
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
              placeholder="Cari topik atau teknologi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs bg-card text-foreground placeholder:text-muted-foreground rounded-full border-border shadow-2xs focus-visible:ring-primary/20"
            />
          </div>

          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="h-9 w-full sm:w-44 text-xs bg-card text-foreground rounded-full border-border shadow-2xs font-medium">
              <SelectValue placeholder="Tingkat Pemahaman" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border bg-popover text-popover-foreground shadow-md">
              <SelectItem value="all">Semua Tingkat</SelectItem>
              <SelectItem value="exploring">Exploring</SelectItem>
              <SelectItem value="learning">Learning</SelectItem>
              <SelectItem value="practicing">Practicing</SelectItem>
              <SelectItem value="confident">Confident</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedLearning(null);
            setFormOpen(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all shrink-0 active:scale-95"
        >
          <Plus className="size-3.5" />
          <span>Catat Pembelajaran</span>
        </button>
      </div>

      {/* Grid of Learnings */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<GraduationCap className="size-10 text-primary" />}
          title="Tidak ada catatan pembelajaran"
          description={
            search || levelFilter !== 'all'
              ? 'Tidak ada catatan yang sesuai dengan filter pencarian.'
              : 'Dokumentasikan hal-hal baru yang kamu pelajari agar portofoliomu terus bertambah.'
          }
          action={
            <button
              type="button"
              onClick={() => {
                setSelectedLearning(null);
                setFormOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all"
            >
              <Plus className="size-3.5" />
              Catat Pembelajaran Baru
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((l) => {
            const lvl = levelBadges[l.level] || { label: l.level };

            return (
              <div
                key={l.id}
                className="flex flex-col justify-between rounded-[24px] border border-border bg-card p-5 shadow-2xs hover:shadow-xs transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 pb-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                      <Calendar className="size-3 text-muted-foreground" />
                      {formatDate(l.learned_on, 'd MMM yyyy')}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                        l.level === 'confident'
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                          : l.level === 'practicing'
                          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                          : l.level === 'learning'
                          ? 'bg-purple-500/15 text-purple-700 dark:text-purple-400'
                          : 'bg-muted/15 text-muted-foreground border border-border'
                      }`}
                    >
                      {lvl.label}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-foreground mt-1 leading-snug">
                    {l.topic}
                  </h3>

                  {l.technology && (
                    <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/50 px-2.5 py-0.5 text-xs font-bold text-foreground">
                      <Code2 className="size-3 text-primary" />
                      {l.technology}
                    </div>
                  )}

                  {l.summary && (
                    <p className="mt-3 text-xs text-muted-foreground leading-relaxed line-clamp-4 whitespace-pre-wrap">
                      {l.summary}
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-3.5 border-t border-border flex items-center justify-between text-xs">
                  {l.source_url ? (
                    <a
                      href={l.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 px-2.5 py-1 text-[11px] font-bold transition-colors"
                    >
                      <ExternalLink className="size-3" />
                      Referensi
                    </a>
                  ) : (
                    <span />
                  )}

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label="Edit catatan pembelajaran"
                      className="size-7 rounded-full inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/15 transition-colors"
                      onClick={() => {
                        setSelectedLearning(l);
                        setFormOpen(true);
                      }}
                    >
                      <Edit className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Hapus catatan pembelajaran"
                      className="size-7 rounded-full inline-flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      onClick={() => handleDelete(l.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      <LearningFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        learning={selectedLearning}
        onSuccess={onRefresh}
      />
    </div>
  );
}
