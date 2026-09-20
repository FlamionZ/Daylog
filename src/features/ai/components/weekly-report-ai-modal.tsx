'use client';

import * as React from 'react';
import { toast } from 'sonner';
import {
  Sparkles,
  Loader2,
  Check,
  AlertTriangle,
  FileText,
  Info,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { generateWeeklyReportEnhancementAction } from '../actions/ai-actions';
import type { WeeklyReportEnhancement } from '@/server/ai/prompts/weekly-report';

interface WeeklyReportAIModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  periodStart: string;
  periodEnd: string;
  statisticsText: string;
  journalsSummary: string;
  tasksCompletedText: string;
  learningsText: string;
  onApply: (enhancement: WeeklyReportEnhancement) => void;
}

export function WeeklyReportAIModal({
  open,
  onOpenChange,
  periodStart,
  periodEnd,
  statisticsText,
  journalsSummary,
  tasksCompletedText,
  learningsText,
  onApply,
}: WeeklyReportAIModalProps) {
  const [userNotes, setUserNotes] = React.useState('');
  const [isGenerating, startGenerating] = React.useTransition();
  const [enhancement, setEnhancement] = React.useState<WeeklyReportEnhancement | null>(null);
  const [warningMessage, setWarningMessage] = React.useState<string | null>(null);

  const handleGenerate = () => {
    startGenerating(async () => {
      const res = await generateWeeklyReportEnhancementAction({
        periodStart,
        periodEnd,
        statisticsText,
        journalsSummary,
        tasksCompletedText,
        learningsText,
        userNotes: userNotes.trim() || undefined,
      });

      if (res.success && res.data) {
        setEnhancement(res.data);
        setWarningMessage(res.warning || null);
        toast.success('Narasi laporan mingguan berhasil disusun oleh AI!');
      } else {
        toast.error(res.error || 'Gagal menyusun narasi laporan mingguan.');
      }
    });
  };

  const handleApplyClick = () => {
    if (!enhancement) return;
    onApply(enhancement);
    toast.success('Narasi AI berhasil dimasukkan ke draf laporan!');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <DialogTitle>Bantu Susun Laporan Mingguan dengan AI</DialogTitle>
          </div>
          <DialogDescription>
            AI menyintesis seluruh catatan jurnal, tugas selesai, dan pembelajaran menjadi narasi laporan resmi.
          </DialogDescription>
        </DialogHeader>

        {warningMessage && (
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{warningMessage}</span>
          </div>
        )}

        {!enhancement ? (
          <div className="space-y-4 py-2">
            <div className="rounded-lg bg-secondary/30 p-3 text-xs space-y-1.5 border border-border">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-primary" /> Data Sumber Periode ({periodStart} s.d. {periodEnd})
              </span>
              <p className="text-muted-foreground whitespace-pre-line text-[11px]">
                {statisticsText}
              </p>
              <div className="pt-1 text-[11px] text-muted-foreground flex items-center gap-1">
                <Info className="h-3 w-3 text-emerald-500" />
                <span>Statistik jam kerja dan kehadiran di atas dijamin akurat dari database dan tidak akan diubah.</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="userNotes">Catatan Tambahan untuk AI (Opsional)</Label>
              <Textarea
                id="userNotes"
                rows={3}
                placeholder="Misal: Sorot pengerjaan fitur autentikasi dan kendala CORS yang berhasil diselesaikan pada hari Kamis..."
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                disabled={isGenerating}
              />
              <p className="text-xs text-muted-foreground">
                Berikan arahan khusus jika ada topik atau pencapaian tertentu yang ingin ditekankan dalam laporan.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2 text-xs">
            {/* Executive Summary */}
            <div className="rounded-lg border border-border p-3.5 space-y-1.5 bg-card">
              <span className="font-semibold text-foreground block">Ringkasan Eksekutif:</span>
              <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                {enhancement.executiveSummary}
              </p>
            </div>

            {/* Key Achievements */}
            <div className="rounded-lg border border-border p-3.5 space-y-1.5 bg-card">
              <span className="font-semibold text-foreground block">Capaian Utama (Key Achievements):</span>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {enhancement.keyAchievements.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Challenges Faced */}
            <div className="rounded-lg border border-border p-3.5 space-y-1.5 bg-card">
              <span className="font-semibold text-foreground block">Kendala & Penanganan:</span>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {enhancement.challengesFaced.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Next Week Plan */}
            <div className="rounded-lg border border-border p-3.5 space-y-1.5 bg-card">
              <span className="font-semibold text-foreground block">Rencana Minggu Depan:</span>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {enhancement.nextWeekPlan.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <DialogFooter className="flex justify-between items-center border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (enhancement) {
                setEnhancement(null);
              } else {
                onOpenChange(false);
              }
            }}
            disabled={isGenerating}
          >
            {enhancement ? 'Ubah Catatan' : 'Batal'}
          </Button>

          {!enhancement ? (
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyusun narasi laporan...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Susun Narasi Laporan
                </>
              )}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Tutup
              </Button>
              <Button
                type="button"
                onClick={handleApplyClick}
              >
                <Check className="mr-2 h-4 w-4" />
                Terapkan ke Laporan
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
