'use client';

import * as React from 'react';
import { toast } from 'sonner';
import {
  UserCheck,
  Sparkles,
  Loader2,
  Check,
  Copy,
  Wand2,
  FileCheck2,
  Minimize2,
  SpellCheck,
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
import { Label } from '@/components/ui/label';
import { improveWritingAction } from '../actions/ai-actions';
import type { ImproveWritingMode } from '@/server/ai/prompts/improve-writing';

interface HumanizeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialText?: string;
  onApply?: (text: string) => void;
}

const MODES: Array<{
  id: ImproveWritingMode;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    id: 'humanize',
    label: 'Humanize (Alami)',
    desc: 'Hapus gaya kaku AI dan jadikan bahasa mengalir seperti ditulis mahasiswa magang asli',
    icon: UserCheck,
  },
  {
    id: 'polish',
    label: 'Rapikan Tulisan',
    desc: 'Rapikan alur dan struktur kalimat agar enak dibaca',
    icon: Wand2,
  },
  {
    id: 'professional',
    label: 'Formal Profesional',
    desc: 'Sesuaikan gaya bahasa formal untuk laporan resmi',
    icon: FileCheck2,
  },
  {
    id: 'summarize',
    label: 'Ringkas & Padat',
    desc: 'Ekstrak poin inti secara to-the-point',
    icon: Minimize2,
  },
  {
    id: 'grammar',
    label: 'Tata Bahasa & EYD',
    desc: 'Perbaiki tanda baca, kapitalisasi, dan ejaan',
    icon: SpellCheck,
  },
];

export function HumanizeModal({
  open,
  onOpenChange,
  initialText = '',
  onApply,
}: HumanizeModalProps) {
  const [customText, setCustomText] = React.useState<string | null>(null);
  const [selectedMode, setSelectedMode] = React.useState<ImproveWritingMode>('humanize');
  const [isProcessing, startProcessing] = React.useTransition();
  const [resultText, setResultText] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  const inputText = customText ?? initialText;

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setCustomText(null);
      setResultText(null);
    }
    onOpenChange(newOpen);
  };

  const handleTransform = () => {
    if (!inputText.trim()) {
      toast.error('Masukkan teks yang ingin di-humanize atau disempurnakan.');
      return;
    }

    startProcessing(async () => {
      const res = await improveWritingAction({
        text: inputText.trim(),
        mode: selectedMode,
      });

      if (res.success && res.data) {
        setResultText(res.data.improvedText);
        toast.success(
          selectedMode === 'humanize'
            ? 'Teks berhasil di-humanize ke gaya bahasa alami!'
            : 'Teks berhasil disempurnakan!',
        );
      } else {
        toast.error(res.error || 'Gagal memproses teks.');
      }
    });
  };

  const handleCopy = async () => {
    if (!resultText) return;
    try {
      await navigator.clipboard.writeText(resultText);
      setCopied(true);
      toast.success('Hasil berhasil disalin ke clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Gagal menyalin teks.');
    }
  };

  const handleApplyResult = () => {
    if (resultText && onApply) {
      onApply(resultText);
      toast.success('Hasil berhasil diterapkan!');
      onOpenChange(false);
    }
  };

  const inputCharCount = inputText.length;
  const resultCharCount = resultText ? resultText.length : 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl border border-border bg-card text-foreground rounded-[28px] p-6 sm:p-7 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-2xs shrink-0">
              <UserCheck className="size-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
                  Humanize & Poles Tulisan
                </DialogTitle>
                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                  Anti-AI Slop
                </span>
              </div>
              <DialogDescription className="text-xs font-medium text-muted-foreground mt-0.5">
                Ubah tulisan kaku atau draf kasar menjadi gaya bahasa manusia yang mengalir alami, bebas dari repetisi kata monoton dan buzzword AI.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Mode Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground">
              Pilih Gaya Bahasa
            </Label>
            <div className="flex flex-wrap gap-2">
              {MODES.map((m) => {
                const Icon = m.icon;
                const isSelected = selectedMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMode(m.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all shadow-2xs ${
                      isSelected
                        ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-emerald-950'
                        : 'border border-border bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                  >
                    <Icon className="size-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-muted-foreground italic">
              {MODES.find((m) => m.id === selectedMode)?.desc}
            </p>
          </div>

          {/* Input Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="humanize-input" className="text-xs font-bold text-foreground">
                Teks Asli / Draf Kasar
              </Label>
              <span className="font-mono text-[11px] text-muted-foreground">
                {inputCharCount} karakter
              </span>
            </div>
            <textarea
              id="humanize-input"
              rows={4}
              placeholder="Tempel catatan harian, aktivitas, atau paragraf yang ingin di-humanize di sini... (Contoh: Melakukan pembelajaran mandiri, melakukan implementasi API, melakukan testing...)"
              value={inputText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full rounded-2xl border border-border bg-background p-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 leading-relaxed"
              disabled={isProcessing}
            />
          </div>

          {/* Action Trigger */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleTransform}
              disabled={isProcessing || !inputText.trim()}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 dark:bg-emerald-500 px-5 py-2.5 text-xs font-bold text-white dark:text-emerald-950 hover:bg-emerald-700 dark:hover:bg-emerald-400 active:scale-95 transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Sedang Menghumanize...</span>
                </>
              ) : (
                <>
                  <UserCheck className="size-3.5" />
                  <span>
                    {selectedMode === 'humanize' ? 'Humanize Sekarang' : 'Sempurnakan Teks'}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Result Output */}
          {resultText && (
            <div className="space-y-2 rounded-[22px] border border-emerald-500/30 bg-emerald-500/5 p-4.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-extrabold text-xs text-foreground">
                    Hasil Tulisan Alami (Humanized)
                  </span>
                  <span className="font-mono text-[10px] rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-700 dark:text-emerald-300 font-bold">
                    {resultCharCount} karakter
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="rounded-full border border-border bg-card px-3 py-1 text-[11px] font-bold text-foreground hover:bg-muted/20 active:scale-95 transition-all shadow-2xs inline-flex items-center gap-1"
                  >
                    {copied ? (
                      <>
                        <Check className="size-3 text-emerald-600 stroke-[2.5]" />
                        <span>Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3" />
                        <span>Salin Hasil</span>
                      </>
                    )}
                  </button>
                  {onApply && (
                    <button
                      type="button"
                      onClick={handleApplyResult}
                      className="rounded-full bg-emerald-600 text-white px-3.5 py-1 text-[11px] font-bold hover:bg-emerald-700 active:scale-95 transition-all shadow-2xs inline-flex items-center gap-1"
                    >
                      <Check className="size-3" />
                      <span>Gunakan Teks</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-emerald-500/20 bg-background/80 p-3.5 text-xs text-foreground leading-relaxed whitespace-pre-wrap font-medium">
                {resultText}
              </div>

              {resultCharCount >= 100 && (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                  <Info className="size-3.5 shrink-0" />
                  <span>Memenuhi syarat minimal 100 karakter Monev Kemnaker RI.</span>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between sm:justify-between items-center border-t border-border pt-4">
          <p className="text-[11px] text-muted-foreground">
            Bebas repetisi awalan & jargon robotik AI.
          </p>
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            className="rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground active:scale-95 transition-all"
          >
            Tutup
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
