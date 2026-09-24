'use client';

import * as React from 'react';
import { toast } from 'sonner';
import {
  Sparkles,
  Loader2,
  Check,
  AlertTriangle,
  GraduationCap,
  Briefcase,
  Layers,
  FileCheck2,
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
import { generateFinalReportDraftAction } from '@/features/ai/actions/ai-actions';
import type { FinalReportDraft } from '@/server/ai/prompts/final-report';

interface FinalReportAIModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  internshipRole?: string;
  companyName?: string;
  durationText?: string;
  totalHours?: string;
  tasksCompletedSummary: string;
  learningsSummary: string;
  journalsSummary: string;
  onApply: (draft: FinalReportDraft, formattedMarkdown: string) => void;
}

export function FinalReportAIModal({
  open,
  onOpenChange,
  internshipRole = 'Peserta Magang',
  companyName = '',
  durationText = '-',
  totalHours = '0 Jam',
  tasksCompletedSummary,
  learningsSummary,
  journalsSummary,
  onApply,
}: FinalReportAIModalProps) {
  const [isGenerating, startGenerating] = React.useTransition();
  const [draft, setDraft] = React.useState<FinalReportDraft | null>(null);
  const [warningMessage, setWarningMessage] = React.useState<string | null>(null);

  const formatDraftToMarkdown = React.useCallback(
    (d: FinalReportDraft): string => {
      const parts: string[] = [
        `# LAPORAN AKHIR PROGRAM MAGANG`,
        `**Perusahaan:** ${companyName}`,
        `**Posisi:** ${internshipRole}`,
        `**Durasi Kerja:** ${durationText} (${totalHours})`,
        ``,
        `---`,
        ``,
        `## BAB I. RINGKASAN EKSEKUTIF`,
        d.executiveSummary,
        ``,
        `## BAB II. KONTRIBUSI PROYEK & PENGEMBANGAN FITUR`,
        ...d.projectContributions.map(
          (p, i) =>
            `### 2.${i + 1}. ${p.featureOrModule}\n- **Peran & Tanggung Jawab:** ${p.roleAndResponsibility}\n- **Detail Teknis & Stack:** ${p.technicalDetails}\n- **Hasil & Dampak:** ${p.outcome}\n`,
        ),
        `## BAB III. CAPAIAN KOMPETENSI & PEMBELAJARAN TEKNIS`,
        ...d.skillsAcquired.map(
          (s) => `- **[${s.category}] ${s.skillName}:** ${s.description}`,
        ),
        ``,
        `## BAB IV. ANALISIS TANTANGAN & SOLUSI`,
        ...d.challengesAndSolutions.map(
          (c, i) =>
            `### 4.${i + 1}. ${c.challenge}\n**Solusi & Tindak Lanjut:** ${c.solution}\n`,
        ),
        `## BAB V. KESIMPULAN & REKOMENDASI`,
        d.conclusion,
      ];
      return parts.join('\n');
    },
    [companyName, internshipRole, durationText, totalHours],
  );

  const handleGenerate = () => {
    startGenerating(async () => {
      const res = await generateFinalReportDraftAction({
        internshipRole,
        companyName,
        durationText,
        totalHours,
        tasksCompletedSummary,
        learningsSummary,
        journalsSummary,
      });

      if (res.success && res.data) {
        setDraft(res.data);
        setWarningMessage(res.warning || null);
        toast.success('Laporan Akhir Magang berhasil disintesis oleh AI!');
      } else {
        toast.error(res.error || 'Gagal menyintesis Laporan Akhir Magang.');
      }
    });
  };

  const handleApplyClick = () => {
    if (!draft) return;
    const md = formatDraftToMarkdown(draft);
    onApply(draft, md);
    toast.success('Laporan Akhir berhasil diterapkan ke editor!');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="size-4.5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Sintesis Laporan Akhir Magang (AI Assistant)
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Menyusun draf komprehensif Bab I s/d Bab V berdasarkan akumulasi seluruh riwayat magang.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {warningMessage && (
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2">
            <AlertTriangle className="size-4 shrink-0 mt-0.5" />
            <span>{warningMessage}</span>
          </div>
        )}

        <div className="space-y-4 py-2">
          {/* Context Overview */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 rounded-xl border border-border/70 bg-surface/60 p-3 text-xs font-mono">
            <div>
              <span className="text-muted-foreground text-[10px] block">Posisi</span>
              <span className="font-semibold text-foreground truncate block">{internshipRole}</span>
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] block">Perusahaan</span>
              <span className="font-semibold text-foreground truncate block">{companyName}</span>
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] block">Durasi</span>
              <span className="font-semibold text-foreground block">{durationText}</span>
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] block">Total Waktu</span>
              <span className="font-semibold text-primary block">{totalHours}</span>
            </div>
          </div>

          {!draft ? (
            <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center space-y-3">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <GraduationCap className="size-6" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="text-sm font-semibold text-foreground">
                  Siap menyintesis Laporan Akhir Magang?
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  AI akan merangkum seluruh kontribusi modul perangkat lunak, kompetensi teknis, penyelesaian bug, serta kesimpulan formal sesuai standar akademis & Kemnaker.
                </p>
              </div>
              <Button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="gap-2 font-semibold bg-primary hover:bg-primary/90"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Sedang Menyintesis Data...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    <span>Mulai Sintesis Laporan Akhir</span>
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Executive Summary */}
              <div className="space-y-1.5 rounded-xl border border-border/70 bg-surface/70 p-3.5">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <FileCheck2 className="size-3.5 text-primary" />
                  <span>Bab I: Ringkasan Eksekutif</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {draft.executiveSummary}
                </p>
              </div>

              {/* Project Contributions */}
              <div className="space-y-2 rounded-xl border border-border/70 bg-surface/70 p-3.5">
                <div className="flex items-center justify-between text-xs font-bold text-foreground">
                  <div className="flex items-center gap-2">
                    <Briefcase className="size-3.5 text-emerald-500" />
                    <span>Bab II: Kontribusi Proyek ({draft.projectContributions.length} Modul)</span>
                  </div>
                </div>
                <div className="space-y-2 pt-1">
                  {draft.projectContributions.map((item, idx) => (
                    <div key={idx} className="rounded-lg border border-border/60 bg-background/60 p-2.5 text-xs space-y-1">
                      <span className="font-semibold text-foreground block">{item.featureOrModule}</span>
                      <p className="text-[11px] text-muted-foreground"><strong className="text-foreground">Tanggung Jawab:</strong> {item.roleAndResponsibility}</p>
                      <p className="text-[11px] text-muted-foreground"><strong className="text-foreground">Teknologi:</strong> {item.technicalDetails}</p>
                      <p className="text-[11px] text-muted-foreground"><strong className="text-foreground">Dampak:</strong> {item.outcome}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills Acquired */}
              <div className="space-y-2 rounded-xl border border-border/70 bg-surface/70 p-3.5">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <Layers className="size-3.5 text-blue-500" />
                  <span>Bab III: Capaian Kompetensi ({draft.skillsAcquired.length} Keahlian)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {draft.skillsAcquired.map((skill, idx) => (
                    <div key={idx} className="rounded-lg border border-border/60 bg-background/60 p-2 text-xs">
                      <span className="font-mono text-[10px] text-primary block uppercase">{skill.category}</span>
                      <strong className="text-foreground block">{skill.skillName}</strong>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{skill.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conclusion */}
              <div className="space-y-1.5 rounded-xl border border-border/70 bg-surface/70 p-3.5">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <GraduationCap className="size-3.5 text-indigo-500" />
                  <span>Bab V: Kesimpulan & Rekomendasi</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {draft.conclusion}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2 border-t border-border/60 pt-3">
          {draft && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="text-xs gap-1.5"
            >
              <Sparkles className="size-3" />
              <span>Sintesis Ulang</span>
            </Button>
          )}

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Tutup
            </Button>
            {draft && (
              <Button
                type="button"
                size="sm"
                onClick={handleApplyClick}
                className="text-xs gap-1.5 bg-primary hover:bg-primary/90 font-semibold"
              >
                <Check className="size-3.5" />
                <span>Terapkan ke Editor</span>
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
