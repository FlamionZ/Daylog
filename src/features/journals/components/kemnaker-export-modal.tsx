'use client';

import * as React from 'react';
import { toast } from 'sonner';
import {
  ExternalLink,
  Copy,
  Check,
  Zap,
  ShieldCheck,
  Info,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export interface KemnakerExportData {
  activities?: string | null;
  learnings?: string | null;
  blockers?: string | null;
  solutions?: string | null;
  summary?: string | null;
  journalDate?: string;
}

interface KemnakerExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: KemnakerExportData;
}

const NO_LEARNING_TEMPLATE =
  'Mendalami alur kerja kolaboratif, memperdalam pemahaman materi terkait penugasan proyek yang diberikan, serta meningkatkan kemampuan komunikasi dan adaptasi profesional di lingkungan kerja magang.';

const NO_BLOCKER_TEMPLATE =
  'Selama menjalankan aktivitas hari ini, seluruh kegiatan dapat diselesaikan dengan baik sesuai target dan tidak ada kendala teknis maupun koordinasi yang menghambat proses kerja.';

function KemnakerExportContent({
  data,
  onClose,
}: {
  data: KemnakerExportData;
  onClose: () => void;
}) {
  const initialAct = data.activities?.trim() || data.summary?.trim() || '';
  const initialLrn = data.learnings?.trim() || NO_LEARNING_TEMPLATE;
  let initialBlk = data.blockers?.trim() || '';
  if (data.solutions?.trim()) {
    initialBlk = initialBlk
      ? `${initialBlk}\n\nSolusi/Tindak lanjut: ${data.solutions.trim()}`
      : `Solusi: ${data.solutions.trim()}`;
  }
  if (!initialBlk) {
    initialBlk = NO_BLOCKER_TEMPLATE;
  }

  const [activities, setActivities] = React.useState(initialAct);
  const [learnings, setLearnings] = React.useState(initialLrn);
  const [blockers, setBlockers] = React.useState(initialBlk);
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  // Character counts
  const actCount = activities.length;
  const lrnCount = learnings.length;
  const blkCount = blockers.length;

  // Copy single field
  const copyField = async (key: string, text: string, label: string) => {
    if (!text.trim()) {
      toast.error(`${label} masih kosong.`);
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      toast.success(`${label} disalin ke clipboard!`, {
        description: 'Tinggal paste (Ctrl+V) ke kolom yang bersesuaian di Monev.',
      });
      setTimeout(() => setCopiedKey(null), 2500);
    } catch {
      toast.error('Gagal menyalin ke clipboard.');
    }
  };

  // Build clean text payload (WITHOUT internal comment tags)
  const buildCleanTextPayload = () => {
    return [
      `[URAIAN AKTIVITAS]`,
      activities.trim(),
      ``,
      `[PEMBELAJARAN YANG DIPEROLEH]`,
      learnings.trim(),
      ``,
      `[KENDALA YANG DIALAMI]`,
      blockers.trim(),
    ].join('\n');
  };

  // Build self-contained auto-fill script with current text embedded
  const buildAutoFillScript = () => {
    const actStr = JSON.stringify(activities.trim());
    const lrnStr = JSON.stringify(learnings.trim());
    const blkStr = JSON.stringify(blockers.trim());
    return `javascript:(function(){try{const act=${actStr};const lrn=${lrnStr};const blk=${blkStr};const tas=Array.from(document.querySelectorAll('textarea'));if(!tas.length){alert('⚠️ Tidak menemukan kolom textarea di halaman ini. Pastikan kamu berada di halaman formulir laporan Monev Kemnaker.');return;}function setVal(el,val){if(!el)return;const desc=Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,'value')||Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el),'value');if(desc&&desc.set){desc.set.call(el,val);}else{el.value=val;}el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));}let actEl=document.querySelector('textarea[name*="aktivitas" i], textarea[id*="aktivitas" i]')||tas[0];let lrnEl=document.querySelector('textarea[name*="pembelajaran" i], textarea[id*="pembelajaran" i]')||tas[1];let blkEl=document.querySelector('textarea[name*="kendala" i], textarea[id*="kendala" i]')||tas[2];if(actEl)setVal(actEl,act);if(lrnEl)setVal(lrnEl,lrn);if(blkEl)setVal(blkEl,blk);document.querySelectorAll('input[type="checkbox"]').forEach(cb=>{if(!cb.checked){cb.click();cb.dispatchEvent(new Event('change',{bubbles:true}));}});alert('✅ Sukses! 3 kolom laporan Monev Kemnaker berhasil terisi otomatis.');}catch(err){alert('⚠️ Kendala: '+err.message);}})();`;
  };

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(buildAutoFillScript());
      toast.success('Script Auto-Fill 1-Klik berhasil disalin!', {
        description: 'Buka tab Monev, tekan F12 -> Console -> paste & Enter, atau gunakan Bookmarklet.',
      });
    } catch {
      toast.error('Gagal menyalin script auto-fill.');
    }
  };

  return (
    <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-5 sm:p-6">
      <DialogHeader>
        <div className="flex items-center gap-2 mb-1">
          <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
            <ShieldCheck className="size-4.5" />
          </div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-primary">
            Sinkronisasi Resmi Kemnaker RI
          </span>
        </div>
        <DialogTitle className="text-xl font-bold text-foreground">
          Kirim Laporan ke Monev Kemnaker
        </DialogTitle>
        <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
          Portal Monev Kemnaker memiliki 3 kolom terpisah (masing-masing minimal 100 karakter). Pilih cara pengisian yang kamu sukai di bawah ini.
        </DialogDescription>
      </DialogHeader>

      {/* ── PETUNJUK RINGKAS 2 PILIHAN METODE ──────────────────────── */}
      <div className="rounded-2xl border border-border bg-secondary/40 p-4 space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
          <Info className="size-4 text-primary shrink-0" />
          <span>Cara Mudah Mengisi ke Monev Kemnaker:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          <div className="rounded-xl bg-surface border border-border p-3 space-y-1">
            <p className="font-bold text-foreground">Cara 1: Salin Per Kolom (Manual Cepat)</p>
            <p className="text-muted-foreground leading-relaxed">
              Klik tombol <strong>&quot;Salin Kolom&quot;</strong> di tiap kotak (1, 2, 3), lalu paste di masing-masing kolom pada tab Monev.
            </p>
          </div>
          <div className="rounded-xl bg-surface border border-border p-3 space-y-1">
            <p className="font-bold text-emerald-600 dark:text-emerald-400">Cara 2: ⚡ Auto-Fill 1-Klik (Otomatis)</p>
            <p className="text-muted-foreground leading-relaxed">
              Klik <strong>&quot;Salin Script Auto-Fill&quot;</strong> &rarr; di tab Monev buka Console (<kbd className="px-1 py-0.5 rounded bg-muted font-mono text-[10px]">F12</kbd>) lalu paste & Enter. Ketiga kolom langsung terisi!
            </p>
          </div>
        </div>
      </div>

      {/* ── 3 MONEV FIELDS ────────────────────────────────────────── */}
      <div className="space-y-4 pt-1">
        {/* 1. Uraian Aktivitas */}
        <div className="rounded-2xl border border-border bg-surface p-4 space-y-2 transition-all">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Label className="text-xs font-bold text-foreground">
                1. Uraian aktivitas
              </Label>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
                  actCount >= 100
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                }`}
              >
                {actCount >= 100 ? '✓' : '⚠️'} {actCount} / 100 karakter
              </span>
            </div>
            <button
              type="button"
              onClick={() => copyField('act', activities, 'Uraian aktivitas')}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted/15 active:scale-95 transition-all cursor-pointer shadow-2xs"
            >
              {copiedKey === 'act' ? (
                <>
                  <Check className="size-3.5 text-emerald-500" />
                  <span className="text-emerald-500">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5 text-primary" />
                  <span>Salin Kolom 1</span>
                </>
              )}
            </button>
          </div>

          <Textarea
            value={activities}
            onChange={(e) => setActivities(e.target.value)}
            placeholder="Jelaskan uraian aktivitas pekerjaan yang kamu lakukan hari ini..."
            rows={3}
            className="text-xs bg-card resize-y"
          />

          {actCount < 100 && (
            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
              ⚠️ Kurang {100 - actCount} karakter lagi agar lolos validasi portal Kemnaker.
            </p>
          )}
        </div>

        {/* 2. Pembelajaran yang Diperoleh */}
        <div className="rounded-2xl border border-border bg-surface p-4 space-y-2 transition-all">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Label className="text-xs font-bold text-foreground">
                2. Pembelajaran yang diperoleh
              </Label>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
                  lrnCount >= 100
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                }`}
              >
                {lrnCount >= 100 ? '✓' : '⚠️'} {lrnCount} / 100 karakter
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setLearnings(NO_LEARNING_TEMPLATE)}
                className="hidden sm:inline-flex items-center rounded-full bg-primary/10 hover:bg-primary/20 text-primary px-2.5 py-1 text-[10px] font-bold transition-all cursor-pointer"
                title="Gunakan kalimat standar pembelajaran jika belum terisi"
              >
                Gunakan Template
              </button>
              <button
                type="button"
                onClick={() => copyField('lrn', learnings, 'Pembelajaran yang diperoleh')}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted/15 active:scale-95 transition-all cursor-pointer shadow-2xs"
              >
                {copiedKey === 'lrn' ? (
                  <>
                    <Check className="size-3.5 text-emerald-500" />
                    <span className="text-emerald-500">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5 text-primary" />
                    <span>Salin Kolom 2</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <Textarea
            value={learnings}
            onChange={(e) => setLearnings(e.target.value)}
            placeholder="Tuliskan pengetahuan baru, pemahaman teknis, atau alur kerja yang dipelajari..."
            rows={3}
            className="text-xs bg-card resize-y"
          />

          {lrnCount < 100 && (
            <div className="flex items-center justify-between text-[11px]">
              <p className="text-amber-600 dark:text-amber-400 font-medium">
                ⚠️ Kurang {100 - lrnCount} karakter lagi.
              </p>
              <button
                type="button"
                onClick={() => setLearnings(NO_LEARNING_TEMPLATE)}
                className="text-primary font-bold hover:underline cursor-pointer"
              >
                Gunakan Template Pembelajaran (170 Karakter)
              </button>
            </div>
          )}
        </div>

        {/* 3. Kendala yang Dialami */}
        <div className="rounded-2xl border border-border bg-surface p-4 space-y-2 transition-all">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Label className="text-xs font-bold text-foreground">
                3. Kendala yang dialami
              </Label>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
                  blkCount >= 100
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                }`}
              >
                {blkCount >= 100 ? '✓' : '⚠️'} {blkCount} / 100 karakter
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setBlockers(NO_BLOCKER_TEMPLATE)}
                className="hidden sm:inline-flex items-center rounded-full bg-primary/10 hover:bg-primary/20 text-primary px-2.5 py-1 text-[10px] font-bold transition-all cursor-pointer"
                title="Isi otomatis dengan kalimat formal bahwa tidak ada kendala"
              >
                Isi &quot;Tidak Ada Kendala&quot;
              </button>
              <button
                type="button"
                onClick={() => copyField('blk', blockers, 'Kendala yang dialami')}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted/15 active:scale-95 transition-all cursor-pointer shadow-2xs"
              >
                {copiedKey === 'blk' ? (
                  <>
                    <Check className="size-3.5 text-emerald-500" />
                    <span className="text-emerald-500">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5 text-primary" />
                    <span>Salin Kolom 3</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <Textarea
            value={blockers}
            onChange={(e) => setBlockers(e.target.value)}
            placeholder="Ceritakan kendala yang dihadapi atau gunakan template jika tidak ada kendala..."
            rows={3}
            className="text-xs bg-card resize-y"
          />

          {blkCount < 100 && (
            <div className="flex items-center justify-between text-[11px]">
              <p className="text-amber-600 dark:text-amber-400 font-medium">
                ⚠️ Kurang {100 - blkCount} karakter lagi.
              </p>
              <button
                type="button"
                onClick={() => setBlockers(NO_BLOCKER_TEMPLATE)}
                className="text-primary font-bold hover:underline cursor-pointer"
              >
                Gunakan Template Aman (165 Karakter)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── AUTO-FILL 1-KLIK SCRIPT BANNER ─────────────────────────── */}
      <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <Zap className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Script Auto-Fill 1-Klik Monev Kemnaker</span>
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
              Langsung mengisi ketiga kolom sekaligus di halaman Monev tanpa perlu copy-paste manual satu per satu.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCopyScript}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 font-bold transition-all cursor-pointer text-xs shadow-2xs active:scale-95 shrink-0"
          >
            <Zap className="size-3.5 fill-white text-white" />
            <span>Salin Script Auto-Fill</span>
          </button>
        </div>

        <div className="pt-2 text-[11px] text-muted-foreground space-y-1.5 border-t border-emerald-500/20">
          <p className="font-bold text-foreground">2 Cara Menjalankan di Tab Monev Kemnaker:</p>
          <ul className="list-disc list-inside space-y-1 text-foreground/80 font-medium">
            <li>
              <strong>Cara A (Paling Mudah):</strong> Buka tab Monev, tekan tombol <kbd className="px-1.5 py-0.5 rounded bg-card border border-border font-mono text-[10px]">F12</kbd> (DevTools), klik tab <strong>Console</strong>, lalu tekan <kbd className="px-1.5 py-0.5 rounded bg-card border border-border font-mono text-[10px]">Ctrl+V</kbd> dan <kbd className="px-1.5 py-0.5 rounded bg-card border border-border font-mono text-[10px]">Enter</kbd>.
            </li>
            <li>
              <strong>Cara B (Bookmark):</strong> Tarik link ini ke Bookmarks Bar browser:{' '}
              <a
                href={buildAutoFillScript()}
                onClick={(e) => {
                  e.preventDefault();
                  handleCopyScript();
                }}
                className="font-bold text-emerald-700 dark:text-emerald-300 underline decoration-dashed hover:decoration-solid cursor-grab active:cursor-grabbing inline-block"
                title="Tarik tombol ini ke Bookmarks Bar browser"
              >
                ⚡ Auto-Fill Monev Daylog
              </a>
              . Saat di tab Monev, cukup klik bookmark tersebut!
            </li>
          </ul>
        </div>
      </div>

      {/* ── FOOTER ACTIONS ────────────────────────────────────────── */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-border">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center justify-center rounded-full border border-border bg-card px-5 py-2.5 text-xs font-bold text-foreground hover:bg-muted/15 active:scale-95 transition-all cursor-pointer"
        >
          Tutup
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(buildCleanTextPayload());
              toast.success('Format teks bersih berhasil disalin!', {
                description: 'Teks rapi tanpa tag comment/metadata internal.',
              });
            }}
            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted/15 active:scale-95 transition-all cursor-pointer"
          >
            <Copy className="size-3.5 text-muted-foreground" />
            <span>Salin Format Teks Bersih</span>
          </button>

          <a
            href="https://monev.maganghub.kemnaker.go.id"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2.5 text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <span>Buka Portal Monev</span>
            <ExternalLink className="size-3.5" />
          </a>
        </div>
      </div>
    </DialogContent>
  );
}

export function KemnakerExportModal({
  open,
  onOpenChange,
  data,
}: KemnakerExportModalProps) {
  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <KemnakerExportContent data={data} onClose={() => onOpenChange(false)} />
    </Dialog>
  );
}

