'use client';

import * as React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Loader2,
  Save,
  Sparkles,
  Compass,
  AlertCircle,
  Copy,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  journalFormSchema,
  type JournalFormInput,
} from '../schemas/journal-schema';
import { saveJournal, type JournalRecord } from '../actions/journal-actions';
import { todayInJakarta } from '@/lib/date';
import { JournalAIModal } from '@/features/ai/components/journal-ai-modal';
import { ImproveWritingMenu } from '@/features/ai/components/improve-writing-menu';
import { BlockerAdvisorModal } from '@/features/ai/components/blocker-advisor-modal';
import { DailyReflectionModal } from '@/features/ai/components/daily-reflection-modal';
import { KemnakerChecklistModal } from './kemnaker-checklist-modal';
import { KemnakerGuideBanner } from './kemnaker-guide-banner';
import type { JournalSuggestion } from '@/server/ai/prompts/journal';
import type { DailyReflection } from '@/server/ai/prompts/daily-reflection';

interface AvailableTask {
  id: string;
  title: string;
  status: string;
}

interface JournalEditorProps {
  initialJournal?: JournalRecord | null;
  availableTasks?: AvailableTask[];
  onSuccess?: () => void;
}

export function JournalEditor({
  initialJournal,
  availableTasks = [],
  onSuccess,
}: JournalEditorProps) {
  const [isPending, startTransition] = React.useTransition();
  const [lastSaved, setLastSaved] = React.useState<string | null>(null);
  const [quickNotes] = React.useState<string | undefined>(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('ai_quick_notes');
      if (stored) {
        sessionStorage.removeItem('ai_quick_notes');
        return stored;
      }
    }
    return undefined;
  });
  const [isAIModalOpen, setIsAIModalOpen] = React.useState(() => Boolean(quickNotes));
  const [isBlockerModalOpen, setIsBlockerModalOpen] = React.useState(false);
  const [isReflectionModalOpen, setIsReflectionModalOpen] = React.useState(false);
  const [isKemnakerModalOpen, setIsKemnakerModalOpen] = React.useState(false);


  const defaultTaskIds = React.useMemo(() => {
    return (
      initialJournal?.journal_tasks?.map((jt) => jt.task_id) || []
    );
  }, [initialJournal]);

  const form = useForm<JournalFormInput>({
    resolver: zodResolver(journalFormSchema),
    defaultValues: {
      id: initialJournal?.id || undefined,
      journalDate: initialJournal?.journal_date || todayInJakarta(),
      title: initialJournal?.title || '',
      summary: initialJournal?.summary || '',
      activities: initialJournal?.activities || '',
      learnings: initialJournal?.learnings || '',
      blockers: initialJournal?.blockers || '',
      solutions: initialJournal?.solutions || '',
      nextPlan: initialJournal?.next_plan || '',
      status: initialJournal?.status || 'draft',
      taskIds: defaultTaskIds,
    },
  });

  const statusValue = useWatch({ control: form.control, name: 'status' });
  const isCompleted = statusValue === 'completed';

  const currentSummary = useWatch({ control: form.control, name: 'summary' }) || '';
  const currentActivities = useWatch({ control: form.control, name: 'activities' }) || '';
  const currentLearnings = useWatch({ control: form.control, name: 'learnings' }) || '';
  const currentBlockers = useWatch({ control: form.control, name: 'blockers' }) || '';
  const currentSolutions = useWatch({ control: form.control, name: 'solutions' }) || '';
  const currentNextPlan = useWatch({ control: form.control, name: 'nextPlan' }) || '';
  const journalDateValue = useWatch({ control: form.control, name: 'journalDate' }) || todayInJakarta();

  const tasksDone = React.useMemo(
    () => availableTasks.filter((t) => t.status === 'done').map((t) => t.title),
    [availableTasks],
  );
  const tasksInProgress = React.useMemo(
    () => availableTasks.filter((t) => t.status === 'in_progress').map((t) => t.title),
    [availableTasks],
  );

  const handleApplyField = React.useCallback(
    (field: keyof JournalSuggestion, value: string) => {
      form.setValue(field, value, { shouldDirty: true, shouldValidate: true });
    },
    [form],
  );

  const handleApplyAll = React.useCallback(
    (suggestion: JournalSuggestion) => {
      if (suggestion.summary) form.setValue('summary', suggestion.summary, { shouldDirty: true, shouldValidate: true });
      if (suggestion.activities) form.setValue('activities', suggestion.activities, { shouldDirty: true, shouldValidate: true });
      if (suggestion.learnings) form.setValue('learnings', suggestion.learnings, { shouldDirty: true, shouldValidate: true });
      if (suggestion.blockers) form.setValue('blockers', suggestion.blockers, { shouldDirty: true, shouldValidate: true });
      if (suggestion.solutions) form.setValue('solutions', suggestion.solutions, { shouldDirty: true, shouldValidate: true });
      if (suggestion.nextPlan) form.setValue('nextPlan', suggestion.nextPlan, { shouldDirty: true, shouldValidate: true });
    },
    [form],
  );

  const handleApplyReflection = React.useCallback(
    (reflection: DailyReflection) => {
      const existingLearnings = form.getValues('learnings') || '';
      const existingPlan = form.getValues('nextPlan') || '';

      const updatedLearnings = existingLearnings
        ? `${existingLearnings}\n\n[Refleksi] ${reflection.analysis}`
        : `[Refleksi] ${reflection.analysis}`;

      const updatedPlan = existingPlan
        ? `${existingPlan}\n- ${reflection.actionPlan}`
        : `- ${reflection.actionPlan}`;

      form.setValue('learnings', updatedLearnings, { shouldDirty: true, shouldValidate: true });
      form.setValue('nextPlan', updatedPlan, { shouldDirty: true, shouldValidate: true });
    },
    [form],
  );

  const handleSave = React.useCallback((targetStatus: 'draft' | 'completed') => {
    form.setValue('status', targetStatus);
    form.handleSubmit((data) => {
      startTransition(async () => {
        const result = await saveJournal({ ...data, status: targetStatus });
        if (result.success) {
          toast.success(result.message);
          setLastSaved(new Date().toLocaleTimeString('id-ID'));
          const returnedData = result.data as { id?: string } | undefined;
          if (returnedData?.id) {
            form.setValue('id', returnedData.id);
          }
          onSuccess?.();
        } else {
          toast.error(result.error || 'Gagal menyimpan jurnal');
        }
      });
    })();
  }, [form, onSuccess]);

  const handleCopyKemnakerFormat = React.useCallback(() => {
    const text = [
      `LAPORAN HARIAN MAGANGHUB KEMNAKER`,
      `Tanggal: ${journalDateValue}`,
      ``,
      `1. APA YANG KAMU KERJAKAN HARI INI?`,
      currentActivities || currentSummary || '-',
      ``,
      `2. APA YANG KAMU PELAJARI?`,
      currentLearnings || '-',
      ``,
      `3. ADA KENDALA?`,
      currentBlockers ? `${currentBlockers}${currentSolutions ? `\nSolusi/Tindak lanjut: ${currentSolutions}` : ''}` : 'Tidak ada kendala yang signifikan.',
      ``,
      `4. APA HASILNYA?`,
      currentSummary || currentNextPlan || '-',
    ].join('\n');

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast.success('Format Kemnaker berhasil disalin!', {
        description: 'Format 4 poin resmi siap di-paste ke portal MagangHub Kemnaker.',
      });
    }
  }, [journalDateValue, currentActivities, currentSummary, currentLearnings, currentBlockers, currentSolutions, currentNextPlan]);

  // Calculate total words
  const wordCount = React.useMemo(() => {
    const combined = [
      currentSummary,
      currentActivities,
      currentLearnings,
      currentBlockers,
      currentSolutions,
      currentNextPlan,
    ].join(' ').trim();
    return combined ? combined.split(/\s+/).filter(Boolean).length : 0;
  }, [currentSummary, currentActivities, currentLearnings, currentBlockers, currentSolutions, currentNextPlan]);

  // Keyboard shortcut: Ctrl+S / Cmd+S to save as draft, Ctrl+Enter / Cmd+Enter to complete
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave('draft');
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        setIsKemnakerModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  const toggleTask = (taskId: string) => {
    const current = form.getValues('taskIds') || [];
    if (current.includes(taskId)) {
      form.setValue(
        'taskIds',
        current.filter((id) => id !== taskId),
      );
    } else {
      form.setValue('taskIds', [...current, taskId]);
    }
  };

  const selectedTaskIds = useWatch({ control: form.control, name: 'taskIds' }) || [];

  return (
    <div className="rounded-[24px] border border-border bg-card shadow-2xs overflow-hidden">
      {/* Sticky Action Bar */}
      <div className="sticky top-0 z-20 flex flex-col gap-3 border-b border-border bg-card/95 px-5 py-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <BookOpen className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold tracking-tight text-foreground">
                Editor Jurnal Harian
              </h2>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                  isCompleted
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                    : 'bg-muted/15 text-muted-foreground'
                }`}
              >
                {isCompleted ? 'Selesai' : 'Draft'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
              <span>{wordCount} kata</span>
              <span>•</span>
              <span>{lastSaved ? `Tersimpan ${lastSaved}` : 'Tekan ⌘S untuk simpan'}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={handleCopyKemnakerFormat}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-bold text-foreground shadow-2xs hover:bg-muted/15 transition-all"
            title="Salin teks laporan siap paste ke portal MagangHub Kemnaker"
          >
            <Copy className="size-3.5" />
            <span className="hidden sm:inline">Salin Format Kemnaker</span>
            <span className="sm:hidden">Salin</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAIModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3.5 py-1.5 text-xs font-bold text-primary shadow-2xs hover:bg-primary/25 transition-all"
          >
            <Sparkles className="size-3.5 text-primary" />
            <span className="hidden sm:inline">Bantu AI</span>
            <span className="sm:hidden">AI</span>
          </button>

          <button
            type="button"
            onClick={() => setIsReflectionModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-bold text-foreground shadow-2xs hover:bg-muted/15 transition-all"
          >
            <Compass className="size-3.5 text-blue-500" />
            <span className="hidden sm:inline">Refleksi</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave('draft')}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-bold text-foreground shadow-2xs hover:bg-muted/15 transition-all"
          >
            {isPending && !isCompleted ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Save className="size-3.5" />
            )}
            <span>Simpan</span>
            <kbd className="hidden md:inline-block rounded bg-muted/15 px-1 font-mono text-[9px] text-muted-foreground">⌘S</kbd>
          </button>

          <button
            type="button"
            onClick={() => setIsKemnakerModalOpen(true)}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 active:scale-95 transition-all"
          >
            {isPending && isCompleted ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="size-3.5" />
            )}
            <span>Selesaikan</span>
            <kbd className="hidden md:inline-block rounded bg-primary-foreground/20 px-1 font-mono text-[9px] text-primary-foreground">⌘↵</kbd>
          </button>
        </div>
      </div>

      {/* AI Assistant Modal */}
      <JournalAIModal
        open={isAIModalOpen}
        onOpenChange={setIsAIModalOpen}
        journalDate={journalDateValue}
        currentValues={{
          summary: currentSummary,
          activities: currentActivities,
          learnings: currentLearnings,
          blockers: currentBlockers,
          solutions: currentSolutions,
          nextPlan: currentNextPlan,
        }}
        onApplyField={handleApplyField}
        onApplyAll={handleApplyAll}
        tasksDone={tasksDone}
        tasksInProgress={tasksInProgress}
        initialNotes={quickNotes}
      />

      {/* Blocker Advisor Modal */}
      <BlockerAdvisorModal
        open={isBlockerModalOpen}
        onOpenChange={setIsBlockerModalOpen}
        initialBlockerText={currentBlockers}
        onApplySolution={(solution) => {
          form.setValue('solutions', solution, { shouldDirty: true, shouldValidate: true });
        }}
      />

      {/* Daily Reflection Modal */}
      <DailyReflectionModal
        open={isReflectionModalOpen}
        onOpenChange={setIsReflectionModalOpen}
        date={journalDateValue}
        summary={currentSummary}
        learnings={currentLearnings}
        blockers={currentBlockers}
        activities={currentActivities}
        onApplyReflection={handleApplyReflection}
      />

      {/* Kemnaker Checklist Pre-Submit Modal */}
      <KemnakerChecklistModal
        open={isKemnakerModalOpen}
        onOpenChange={setIsKemnakerModalOpen}
        onConfirm={() => {
          setIsKemnakerModalOpen(false);
          handleSave('completed');
        }}
        isPending={isPending}
      />

      {/* Form Body */}
      <div className="space-y-6 p-5 sm:p-6">
        {/* Kemnaker Official Guide Banner */}
        <KemnakerGuideBanner />

        {/* Date and Title */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="journal-date" className="text-xs font-semibold text-foreground">
              Tanggal Jurnal
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                id="journal-date"
                type="date"
                className="pl-9 h-9 text-xs font-mono"
                disabled={isPending}
                {...form.register('journalDate')}
              />
            </div>
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="journal-title" className="text-xs font-semibold text-foreground">
              Judul Jurnal (Opsional)
            </Label>
            <Input
              id="journal-title"
              placeholder="Contoh: Implementasi Auth & Refactoring Drizzle"
              className="h-9 text-xs"
              disabled={isPending}
              {...form.register('title')}
            />
          </div>
        </div>

        {/* 01. Ringkasan & Hasil Hari Ini */}
        <div className="space-y-2 rounded-[20px] border border-border bg-secondary/40 p-4.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-surface border border-border px-2 py-0.5 font-mono text-[10px] font-bold text-foreground">01</span>
              <Label htmlFor="journal-summary" className="text-xs font-bold text-foreground">
                Ringkasan & Hasil Hari Ini <span className="text-destructive">*</span>
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-[11px] text-muted-foreground">Poin 4 Kemnaker: Apa hasilnya?</span>
              <ImproveWritingMenu
                text={currentSummary}
                fieldName="Ringkasan"
                onApply={(improved) => form.setValue('summary', improved, { shouldDirty: true, shouldValidate: true })}
              />
            </div>
          </div>
          <Textarea
            id="journal-summary"
            placeholder="Jelaskan hasil atau progres konkret dari pekerjaan yang sudah diselesaikan hari ini..."
            rows={2}
            className="text-xs leading-relaxed rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/20"
            disabled={isPending}
            {...form.register('summary')}
          />
          {form.formState.errors.summary && (
            <p className="text-xs text-destructive">
              {form.formState.errors.summary.message}
            </p>
          )}
        </div>

        {/* 02. Apa yang dikerjakan */}
        <div className="space-y-2 rounded-[20px] border border-border bg-secondary/40 p-4.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-surface border border-border px-2 py-0.5 font-mono text-[10px] font-bold text-foreground">02</span>
              <Label htmlFor="journal-activities" className="text-xs font-bold text-foreground">
                Apa yang Dikerjakan Hari Ini?
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-[11px] text-muted-foreground">Poin 1 Kemnaker: Gunakan poin-poin (-)</span>
              <ImproveWritingMenu
                text={currentActivities}
                fieldName="Aktivitas"
                onApply={(improved) => form.setValue('activities', improved, { shouldDirty: true, shouldValidate: true })}
              />
            </div>
          </div>
          <Textarea
            id="journal-activities"
            placeholder="- Membuat komponen login dan verifikasi form&#10;- Menyusun Server Actions untuk autentikasi Supabase&#10;- Menguji alur logout dan redirect dashboard"
            rows={4}
            className="text-xs font-mono leading-relaxed rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/20"
            disabled={isPending}
            {...form.register('activities')}
          />
        </div>

        {/* 03. Apa yang dipelajari */}
        <div className="space-y-2 rounded-[20px] border border-border bg-secondary/40 p-4.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-surface border border-border px-2 py-0.5 font-mono text-[10px] font-bold text-foreground">03</span>
              <Label htmlFor="journal-learnings" className="text-xs font-bold text-foreground">
                Apa yang Dipelajari?
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-[11px] text-muted-foreground">Poin 2 Kemnaker: Skill & pengalaman baru</span>
              <ImproveWritingMenu
                text={currentLearnings}
                fieldName="Pembelajaran"
                onApply={(improved) => form.setValue('learnings', improved, { shouldDirty: true, shouldValidate: true })}
              />
            </div>
          </div>
          <Textarea
            id="journal-learnings"
            placeholder="Ceritakan skill atau pengalaman baru yang Rekanaker dapatkan selama pengerjaan..."
            rows={3}
            className="text-xs leading-relaxed rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/20"
            disabled={isPending}
            {...form.register('learnings')}
          />
        </div>

        {/* 04. Kendala yang ditemui & 05. Solusi */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2 rounded-[20px] border border-border bg-secondary/40 p-4.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-700 dark:text-amber-300">04</span>
                <Label htmlFor="journal-blockers" className="text-xs font-bold text-foreground">
                  Ada Kendala? (Hambatan)
                </Label>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsBlockerModalOpen(true)}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 hover:bg-muted/15 transition-all shadow-2xs"
                >
                  <AlertCircle className="size-3 text-amber-500" />
                  <span>Diagnosis</span>
                </button>
                <ImproveWritingMenu
                  text={currentBlockers}
                  fieldName="Kendala"
                  onApply={(improved) => form.setValue('blockers', improved, { shouldDirty: true, shouldValidate: true })}
                />
              </div>
            </div>
            <Textarea
              id="journal-blockers"
              placeholder="Tulis hambatan dengan jelas supaya bisa jadi bahan diskusi dengan mentor..."
              rows={3}
              className="text-xs leading-relaxed rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/20"
              disabled={isPending}
              {...form.register('blockers')}
            />
          </div>

          <div className="space-y-2 rounded-[20px] border border-border bg-secondary/40 p-4.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-300">05</span>
                <Label htmlFor="journal-solutions" className="text-xs font-bold text-foreground">
                  Solusi / Diskusi Mentor
                </Label>
              </div>
              <ImproveWritingMenu
                text={currentSolutions}
                fieldName="Solusi"
                onApply={(improved) => form.setValue('solutions', improved, { shouldDirty: true, shouldValidate: true })}
              />
            </div>
            <Textarea
              id="journal-solutions"
              placeholder="Langkah solusi yang diambil atau usulan tindak lanjut untuk mentor..."
              rows={3}
              className="text-xs leading-relaxed rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/20"
              disabled={isPending}
              {...form.register('solutions')}
            />
          </div>
        </div>

        {/* 06. Rencana berikutnya */}
        <div className="space-y-2 rounded-[20px] border border-border bg-secondary/40 p-4.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-surface border border-border px-2 py-0.5 font-mono text-[10px] font-bold text-foreground">06</span>
              <Label htmlFor="journal-next-plan" className="text-xs font-bold text-foreground">
                Rencana Kerja Berikutnya
              </Label>
            </div>
            <ImproveWritingMenu
              text={currentNextPlan}
              fieldName="Rencana Kerja"
              onApply={(improved) => form.setValue('nextPlan', improved, { shouldDirty: true, shouldValidate: true })}
            />
          </div>
          <Textarea
            id="journal-next-plan"
            placeholder="Melanjutkan pembuatan modul task tracker dan generator laporan mingguan..."
            rows={2}
            className="text-xs leading-relaxed rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/20"
            disabled={isPending}
            {...form.register('nextPlan')}
          />
        </div>

        {/* 07. Tugas Terkait */}
        {availableTasks.length > 0 && (
          <div className="space-y-2.5 border-t border-border pt-4">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-surface border border-border px-2 py-0.5 font-mono text-[10px] font-bold text-foreground">07</span>
              <Label className="text-xs font-bold text-foreground">Tugas Terkait Hari Ini</Label>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Pilih tugas yang kamu kerjakan hari ini untuk ditautkan dengan jurnal ini:
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 max-h-48 overflow-y-auto pt-1">
              {availableTasks.map((t) => {
                const isSelected = selectedTaskIds.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTask(t.id)}
                    className={`flex items-center gap-2.5 rounded-2xl border p-3 text-left text-xs transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-2xs font-bold text-foreground ring-1 ring-primary'
                        : 'border-border bg-card text-foreground hover:border-border/80 hover:bg-muted/10'
                    }`}
                  >
                    <div
                      className={`flex size-4 items-center justify-center rounded border transition-colors ${
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-surface'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="size-3" />}
                    </div>
                    <span className="truncate flex-1">{t.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
