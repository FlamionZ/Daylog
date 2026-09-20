'use client';

import * as React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  FileText,
  Calendar,
  Sparkles,
  Save,
  CheckCircle2,
  Loader2,
  Eye,
  Edit3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  reportFormSchema,
  reportTypes,
  type ReportFormInput,
} from '../schemas/report-schema';
import {
  saveReport,
  aggregateReportData,
  type ReportRecord,
} from '../actions/report-actions';
import { todayInJakarta } from '@/lib/date';
import { WeeklyReportAIModal } from '@/features/ai/components/weekly-report-ai-modal';
import { FinalReportAIModal } from './final-report-ai-modal';
import type { WeeklyReportEnhancement } from '@/server/ai/prompts/weekly-report';

interface ReportBuilderProps {
  initialReport?: ReportRecord | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const typeLabels: Record<string, string> = {
  weekly: 'Laporan Mingguan',
  monthly: 'Laporan Bulanan',
  final: 'Laporan Akhir Magang',
  custom: 'Laporan Kustom',
};

export function ReportBuilder({
  initialReport,
  onSuccess,
  onCancel,
}: ReportBuilderProps) {
  const [isPending, startTransition] = React.useTransition();
  const [isAggregating, setIsAggregating] = React.useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = React.useState(false);
  const [isFinalAIModalOpen, setIsFinalAIModalOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'split' | 'edit' | 'preview'>('split');
  const [aiContext, setAiContext] = React.useState<{
    statisticsText: string;
    journalsSummary: string;
    tasksCompletedText: string;
    learningsText: string;
  } | null>(null);

  const today = todayInJakarta();
  // Default start date: 7 days ago
  const sevenDaysAgo = React.useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - 6);
    return d.toISOString().slice(0, 10);
  }, [today]);

  const form = useForm<ReportFormInput>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      id: initialReport?.id || undefined,
      title: initialReport?.title || '',
      reportType: initialReport?.report_type || 'weekly',
      periodStart: initialReport?.period_start || sevenDaysAgo,
      periodEnd: initialReport?.period_end || today,
      contentMarkdown: initialReport?.content_markdown || '',
      status: initialReport?.status || 'draft',
    },
  });

  const reportTypeValue = useWatch({ control: form.control, name: 'reportType' });
  const contentMarkdown = useWatch({ control: form.control, name: 'contentMarkdown' }) || '';

  const handleAutoAggregate = async () => {
    const startDate = form.getValues('periodStart');
    const endDate = form.getValues('periodEnd');
    const type = form.getValues('reportType');

    if (!startDate || !endDate) {
      toast.error('Tentukan tanggal awal dan tanggal akhir periode terlebih dahulu.');
      return;
    }

    if (endDate < startDate) {
      toast.error('Tanggal akhir tidak boleh mendahului tanggal awal.');
      return;
    }

    setIsAggregating(true);
    try {
      const data = await aggregateReportData(startDate, endDate, type);
      if (data) {
        form.setValue('contentMarkdown', data.markdown);
        if (!form.getValues('title')) {
          form.setValue('title', data.defaultTitle);
        }
        toast.success('Data aktivitas dan statistik berhasil diagregasi!');
      } else {
        toast.error('Gagal mengambil data agregasi.');
      }
    } catch {
      toast.error('Terjadi kesalahan saat mengagregasi data.');
    } finally {
      setIsAggregating(false);
    }
  };

  const handleOpenAIModal = async () => {
    const startDate = form.getValues('periodStart');
    const endDate = form.getValues('periodEnd');
    const type = form.getValues('reportType');

    if (!startDate || !endDate) {
      toast.error('Tentukan tanggal awal dan tanggal akhir periode terlebih dahulu.');
      return;
    }

    if (endDate < startDate) {
      toast.error('Tanggal akhir tidak boleh mendahului tanggal awal.');
      return;
    }

    setIsAggregating(true);
    try {
      const data = await aggregateReportData(startDate, endDate, type);
      if (data) {
        const stats = data.statistics;
        const statisticsText = `Hari Kerja: ${stats.workingDays} hari | Total Waktu: ${data.formattedWorkedHours} | Jurnal Selesai: ${stats.completedJournals} | Tugas Selesai: ${stats.completedTasks} | Pembelajaran: ${stats.learningsCount}`;
        const journalsSummary = (data.journals || [])
          .map((j) => `- [${j.journal_date}] ${j.title ? j.title + ': ' : ''}${j.summary}`)
          .join('\n');
        const tasksCompletedText = (data.tasks || [])
          .map((t) => `- ${t.title} (Status: ${t.status}, Prioritas: ${t.priority})`)
          .join('\n');
        const learningsText = (data.learnings || [])
          .map((l) => `- ${l.topic} (${l.technology || '-'}): ${l.summary || ''}`)
          .join('\n');

        setAiContext({
          statisticsText,
          journalsSummary,
          tasksCompletedText,
          learningsText,
        });

        if (type === 'final') {
          setIsFinalAIModalOpen(true);
        } else {
          setIsAIModalOpen(true);
        }
      } else {
        toast.error('Gagal mengambil data untuk asisten AI.');
      }
    } catch {
      toast.error('Terjadi kesalahan saat menyiapkan data untuk AI.');
    } finally {
      setIsAggregating(false);
    }
  };

  const handleApplyAI = (enhancement: WeeklyReportEnhancement) => {
    const currentMarkdown = form.getValues('contentMarkdown');
    const aiNarrative = `
## Ringkasan Eksekutif
${enhancement.executiveSummary}

## Capaian Utama (Key Achievements)
${enhancement.keyAchievements.map((item) => `- ${item}`).join('\n')}

## Kendala & Solusi
${enhancement.challengesFaced.map((item) => `- ${item}`).join('\n')}

## Rencana Kerja Minggu Depan
${enhancement.nextWeekPlan.map((item) => `- ${item}`).join('\n')}
`;

    form.setValue(
      'contentMarkdown',
      currentMarkdown ? `${currentMarkdown}\n\n${aiNarrative.trim()}` : aiNarrative.trim(),
      { shouldDirty: true, shouldValidate: true },
    );
  };

  const handleSave = (targetStatus: 'draft' | 'final') => {
    if (targetStatus === 'final') {
      if (
        !confirm(
          'Apakah kamu yakin ingin memfinalisasi laporan ini? Laporan yang difinalisasi akan dibekukan sebagai catatan resmi.',
        )
      ) {
        return;
      }
    }

    form.setValue('status', targetStatus);
    form.handleSubmit((data) => {
      startTransition(async () => {
        const result = await saveReport({ ...data, status: targetStatus });
        if (result.success) {
          toast.success(result.message);
          onSuccess?.();
        } else {
          toast.error(result.error || 'Gagal menyimpan laporan');
        }
      });
    })();
  };

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5 shadow-xs sm:p-6 space-y-6">
      {/* Weekly Report AI Modal */}
      {aiContext && (
        <WeeklyReportAIModal
          open={isAIModalOpen}
          onOpenChange={setIsAIModalOpen}
          periodStart={form.getValues('periodStart')}
          periodEnd={form.getValues('periodEnd')}
          statisticsText={aiContext.statisticsText}
          journalsSummary={aiContext.journalsSummary}
          tasksCompletedText={aiContext.tasksCompletedText}
          learningsText={aiContext.learningsText}
          onApply={handleApplyAI}
        />
      )}

      {/* Header */}
      <div className="flex flex-col gap-3 pb-5 border-b border-[hsl(var(--border))] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]">
            <FileText className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[hsl(var(--foreground))]">
                {initialReport?.id ? 'Edit Laporan' : 'Buat Laporan Baru'}
              </h2>
              <Badge variant={initialReport?.status === 'final' ? 'success' : 'secondary'}>
                {initialReport?.status === 'final' ? 'Final' : 'Draft'}
              </Badge>
            </div>
            <p className="text-xs text-[hsl(var(--muted))]">
              Gunakan editor Markdown untuk menyusun laporan formal magang
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={isPending}
            >
              Batal
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleSave('draft')}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="mr-1.5 size-3.5 animate-spin" />
            ) : (
              <Save className="mr-1.5 size-3.5" />
            )}
            Simpan Draft
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => handleSave('final')}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="mr-1.5 size-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-1.5 size-3.5" />
            )}
            Finalisasi Laporan
          </Button>
        </div>
      </div>

      {/* Metadata Configuration */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="report-title">Judul Laporan</Label>
          <Input
            id="report-title"
            placeholder="Contoh: Laporan Mingguan ke-3 (15 - 20 September 2026)"
            disabled={isPending}
            {...form.register('title')}
          />
          {form.formState.errors.title && (
            <p className="text-xs text-[hsl(var(--destructive))]">
              {form.formState.errors.title.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="report-type">Tipe Laporan</Label>
          <Select
            value={reportTypeValue}
            onValueChange={(v) => form.setValue('reportType', v as ReportFormInput['reportType'])}
            disabled={isPending}
          >
            <SelectTrigger id="report-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {reportTypes.map((t) => (
                <SelectItem key={t} value={t}>
                  {typeLabels[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Tindakan Data</Label>
          <Button
            type="button"
            variant="secondary"
            className="w-full text-xs font-semibold text-[hsl(var(--primary))]"
            onClick={handleAutoAggregate}
            disabled={isAggregating || isPending}
          >
            {isAggregating ? (
              <Loader2 className="mr-1.5 size-3.5 animate-spin" />
            ) : (
              <Sparkles className="mr-1.5 size-3.5" />
            )}
            Agregasi Otomatis
          </Button>
        </div>

        <div className="space-y-1.5">
          <Label>Asisten AI</Label>
          <Button
            type="button"
            variant="outline"
            className="w-full text-xs font-semibold border-primary/30 text-primary hover:bg-primary/10"
            onClick={handleOpenAIModal}
            disabled={isAggregating || isPending}
          >
            {isAggregating ? (
              <Loader2 className="mr-1.5 size-3.5 animate-spin" />
            ) : (
              <Sparkles className="mr-1.5 size-3.5 text-primary" />
            )}
            Bantu Susun AI
          </Button>
        </div>
      </div>

      {/* Period Dates */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="report-start">Tanggal Awal Periode</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 size-4 text-[hsl(var(--muted))]" />
            <Input
              id="report-start"
              type="date"
              className="pl-9"
              disabled={isPending}
              {...form.register('periodStart')}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="report-end">Tanggal Akhir Periode</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 size-4 text-[hsl(var(--muted))]" />
            <Input
              id="report-end"
              type="date"
              className="pl-9"
              disabled={isPending}
              {...form.register('periodEnd')}
            />
          </div>
        </div>
      </div>

      {/* Editor & Preview Toggle for Mobile / Tablets */}
      <div className="flex items-center justify-between border-t border-[hsl(var(--border))] pt-4">
        <Label htmlFor="report-content" className="text-sm font-semibold">
          Isi Laporan (Format Markdown)
        </Label>

        <div className="flex items-center gap-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--accent)/0.5)] p-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`flex items-center gap-1 rounded px-2.5 py-1 ${
              activeTab === 'edit'
                ? 'bg-[hsl(var(--surface))] font-semibold shadow-2xs'
                : 'text-[hsl(var(--muted))]'
            }`}
          >
            <Edit3 className="size-3.5" />
            Editor
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1 rounded px-2.5 py-1 ${
              activeTab === 'preview'
                ? 'bg-[hsl(var(--surface))] font-semibold shadow-2xs'
                : 'text-[hsl(var(--muted))]'
            }`}
          >
            <Eye className="size-3.5" />
            Pratinjau
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('split')}
            className={`hidden md:flex items-center gap-1 rounded px-2.5 py-1 ${
              activeTab === 'split'
                ? 'bg-[hsl(var(--surface))] font-semibold shadow-2xs'
                : 'text-[hsl(var(--muted))]'
            }`}
          >
            Split 50/50
          </button>
        </div>
      </div>

      {/* Editor & Preview Panels */}
      <div
        className={`grid gap-4 ${
          activeTab === 'split'
            ? 'grid-cols-1 md:grid-cols-2'
            : 'grid-cols-1'
        }`}
      >
        {/* Editor */}
        {(activeTab === 'edit' || activeTab === 'split') && (
          <div className="space-y-2">
            <Textarea
              id="report-content"
              rows={22}
              placeholder="Tuliskan isi laporan dalam format Markdown atau gunakan tombol 'Agregasi Otomatis' di atas..."
              className="font-mono text-xs leading-relaxed resize-y"
              disabled={isPending}
              {...form.register('contentMarkdown')}
            />
            {form.formState.errors.contentMarkdown && (
              <p className="text-xs text-[hsl(var(--destructive))]">
                {form.formState.errors.contentMarkdown.message}
              </p>
            )}
          </div>
        )}

        {/* Live Preview */}
        {(activeTab === 'preview' || activeTab === 'split') && (
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--accent)/0.15)] p-5 overflow-y-auto max-h-[560px]">
            {contentMarkdown ? (
              <div className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed whitespace-pre-wrap font-sans">
                {contentMarkdown}
              </div>
            ) : (
              <div className="py-20 text-center text-xs text-[hsl(var(--muted))]">
                Pratinjau laporan akan muncul di sini setelah konten diisi atau diagregasi.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Weekly Report AI Modal */}
      {aiContext && (
        <WeeklyReportAIModal
          open={isAIModalOpen}
          onOpenChange={setIsAIModalOpen}
          periodStart={form.getValues('periodStart')}
          periodEnd={form.getValues('periodEnd')}
          statisticsText={aiContext.statisticsText}
          journalsSummary={aiContext.journalsSummary}
          tasksCompletedText={aiContext.tasksCompletedText}
          learningsText={aiContext.learningsText}
          onApply={handleApplyAI}
        />
      )}

      {/* Final Report AI Modal */}
      {aiContext && (
        <FinalReportAIModal
          open={isFinalAIModalOpen}
          onOpenChange={setIsFinalAIModalOpen}
          durationText={`${form.getValues('periodStart')} s/d ${form.getValues('periodEnd')}`}
          totalHours={aiContext.statisticsText}
          tasksCompletedSummary={aiContext.tasksCompletedText}
          learningsSummary={aiContext.learningsText}
          journalsSummary={aiContext.journalsSummary}
          onApply={(_draft, formattedMarkdown) => {
            form.setValue('contentMarkdown', formattedMarkdown);
            if (!form.getValues('title')) {
              form.setValue('title', 'Laporan Akhir Program Magang — PT Tiga Serangkai');
            }
          }}
        />
      )}
    </div>
  );
}
