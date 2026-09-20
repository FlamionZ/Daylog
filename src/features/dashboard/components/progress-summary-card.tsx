'use client';

import * as React from 'react';
import { toast } from 'sonner';
import {
  Sparkles,
  Loader2,
  TrendingUp,
  Target,
  Lightbulb,
  CheckCircle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { generateProgressSummaryAction } from '@/features/ai/actions/ai-actions';
import type { ProgressSummary } from '@/server/ai/prompts/progress-summary';
import type { TaskRecord } from '@/features/tasks/actions/task-actions';
import type { JournalRecord } from '@/features/journals/actions/journal-actions';
import type { LearningRecord } from '@/features/learnings/actions/learning-actions';
import { todayInJakarta } from '@/lib/date';

interface ProgressSummaryCardProps {
  tasks: TaskRecord[];
  journals: JournalRecord[];
  learnings: LearningRecord[];
}

export function ProgressSummaryCard({
  tasks,
  journals,
  learnings,
}: ProgressSummaryCardProps) {
  const [isPending, startTransition] = React.useTransition();
  const [summary, setSummary] = React.useState<ProgressSummary | null>(null);

  const handleGenerate = () => {
    startTransition(async () => {
      const today = todayInJakarta();
      const recentTasks = tasks.slice(0, 8);
      const recentJournals = journals.slice(0, 5);
      const recentLearnings = learnings.slice(0, 5);

      const recentTasksText = recentTasks
        .map((t) => `- [${t.status}] ${t.title} (${t.priority})`)
        .join('\n');

      const recentJournalsText = recentJournals
        .map((j) => `- [${j.journal_date}] ${j.title || j.summary}`)
        .join('\n');

      const recentLearningsText = recentLearnings
        .map((l) => `- ${l.topic} (${l.technology || '-'})`)
        .join('\n');

      const res = await generateProgressSummaryAction({
        periodText: `7 hari terakhir (hingga ${today})`,
        attendanceText: `${recentJournals.length} catatan jurnal terisi`,
        recentTasksText,
        recentJournalsText,
        recentLearningsText,
      });

      if (res.success && res.data) {
        setSummary(res.data);
        toast.success('Ringkasan progres mingguan berhasil dibuat oleh AI!');
      } else {
        toast.error(res.error || 'Gagal membuat ringkasan progres.');
      }
    });
  };

  return (
    <Card className="border-[hsl(var(--border))] bg-surface shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <TrendingUp className="size-4" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">Sintesis Progres Mingguan</CardTitle>
            <CardDescription className="text-xs">
              AI menganalisis tren aktivitas, tugas, dan capaian 7 hari terakhir
            </CardDescription>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGenerate}
          disabled={isPending}
          className="h-8 text-xs border-primary/30 text-primary hover:bg-primary/10"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-1.5 size-3.5 animate-spin" />
              Menganalisis...
            </>
          ) : (
            <>
              <Sparkles className="mr-1.5 size-3.5 text-primary" />
              {summary ? 'Perbarui Sintesis' : 'Analisis dengan AI'}
            </>
          )}
        </Button>
      </CardHeader>

      <CardContent>
        {!summary ? (
          <div className="rounded-lg border border-dashed p-5 text-center space-y-1.5">
            <p className="text-xs text-muted-foreground">
              Klik <strong>Analisis dengan AI</strong> untuk mendapatkan ringkasan menyeluruh mengenai progres, fokus aktif, dan rekomendasi kerja mingguan.
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            {/* Headline */}
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
              <span className="font-bold text-foreground text-sm block">{summary.headline}</span>
            </div>

            {/* Highlights */}
            <div className="space-y-1.5">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <CheckCircle className="size-3.5 text-emerald-500" /> Capaian Utama:
              </span>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-1">
                {summary.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>

            {/* Focus Areas */}
            <div className="space-y-1.5">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Target className="size-3.5 text-primary" /> Fokus Aktif:
              </span>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {summary.focusAreas.map((f, i) => (
                  <Badge key={i} variant="secondary" className="text-[11px]">
                    {f}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Recommendation */}
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 space-y-1">
              <span className="font-semibold text-amber-900 dark:text-amber-300 flex items-center gap-1.5 text-xs">
                <Lightbulb className="size-3.5 text-amber-600" /> Rekomendasi Selanjutnya:
              </span>
              <p className="text-amber-950 dark:text-amber-200 leading-relaxed text-[11px]">
                {summary.recommendation}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
