'use client';

import * as React from 'react';
import { toast } from 'sonner';
import {
  ExternalLink,
  Copy,
  Check,
  Zap,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
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
  const initialLrn = data.learnings?.trim() || '';
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
  const [showBookmarkletGuide, setShowBookmarkletGuide] = React.useState(false);

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

  // Build composite text for 1-click copy & bookmarklet parsing
  const buildFullPayload = () => {
    return [
      `[URAIAN AKTIVITAS]`,
      activities.trim(),
      ``,
      `[PEMBELAJARAN YANG DIPEROLEH]`,
      learnings.trim(),
      ``,
      `[KENDALA YANG DIALAMI]`,
      blockers.trim(),
      ``,
      `<!-- MAGANGHUB_DATA:${JSON.stringify({
        maganghub_export: true,
        activities: activities.trim(),
        learnings: learnings.trim(),
        blockers: blockers.trim(),
      })} -->`,
    ].join('\n');
  };

  // 1-Click: Copy all and open Monev portal in new tab
  const handleCopyAllAndOpenMonev = async () => {
    const payload = buildFullPayload();
    try {
      await navigator.clipboard.writeText(payload);
      toast.success('Semua laporan disalin ke clipboard!', {
        description: 'Membuka Portal Monev Kemnaker. Tinggal paste di sana!',
      });
      window.open('https://monev.maganghub.kemnaker.go.id', '_blank', 'noopener,noreferrer');
    } catch {
      toast.error('Gagal menyalin data ke clipboard.');
    }
  };

  // Bookmarklet code string for 1-click automated injection
  const bookmarkletCode = `javascript:(function(){try{navigator.clipboard.readText().then(clip=>{let act='',lrn='',blk='';const jsonMatch=clip.match(/<!-- MAGANGHUB_DATA:([\\s\\S]*?) -->/);if(jsonMatch){try{const obj=JSON.parse(jsonMatch[1]);act=obj.activities||'';lrn=obj.learnings||'';blk=obj.blockers||'';}catch(e){}}if(!act){const matchAct=clip.match(/\\[URAIAN AKTIVITAS\\]\\s*([\\s\\S]*?)(?=\\s*\\[PEMBELAJARAN|$)/i);const matchLrn=clip.match(/\\[PEMBELAJARAN YANG DIPEROLEH\\]\\s*([\\s\\S]*?)(?=\\s*\\[KENDALA|$)/i);const matchBlk=clip.match(/\\[KENDALA YANG DIALAMI\\]\\s*([\\s\\S]*?)(?=\\s*<!--|$)/i);if(matchAct)act=matchAct[1].trim();if(matchLrn)lrn=matchLrn[1].trim();if(matchBlk)blk=matchBlk[1].trim();}const tas=Array.from(document.querySelectorAll('textarea'));if(tas.length>=3){function setVal(el,val){const desc=Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,'value')||Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el),'value');if(desc&&desc.set){desc.set.call(el,val);}else{el.value=val;}el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));}if(act)setVal(tas[0],act);if(lrn)setVal(tas[1],lrn);if(blk)setVal(tas[2],blk);const cbs=document.querySelectorAll('input[type="checkbox"]');cbs.forEach(cb=>{if(!cb.checked){cb.click();cb.dispatchEvent(new Event('change',{bubbles:true}));}});alert('✅ Berhasil mengisi otomatis 3 form Monev Kemnaker!');}else{alert('⚠️ Halaman form Monev tidak terdeteksi. Pastikan kamu berada di halaman Tambah Laporan Monev Kemnaker.');}}).catch(()=>{alert('⚠️ Izin clipboard diperlukan untuk membaca data Daylog.');});}catch(err){alert('⚠️ Kendala: '+err.message);}})();`;

  const copyBookmarklet = async () => {
    try {
      await navigator.clipboard.writeText(bookmarkletCode);
      toast.success('Kode Bookmarklet berhasil disalin!', {
        description: 'Simpan URL ini sebagai bookmark di browser kamu.',
      });
    } catch {
      toast.error('Gagal menyalin kode bookmarklet.');
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
          Format 3 kolom di bawah sudah disesuaikan persis dengan formulir portal Monev MagangHub Kemnaker (Minimal 100 karakter per kolom).
        </DialogDescription>
      </DialogHeader>

      {/* ── 3 MONEV FIELDS ────────────────────────────────────────── */}
      <div className="space-y-4 pt-2">
        {/* 1. Uraian Aktivitas */}
        <div className="rounded-2xl border border-border bg-surface p-4 space-y-2 transition-all">
          <div className="flex items-center justify-between">
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
              className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-bold text-foreground hover:bg-muted/15 active:scale-95 transition-all cursor-pointer shadow-2xs"
            >
              {copiedKey === 'act' ? (
                <>
                  <Check className="size-3 text-emerald-500" />
                  <span className="text-emerald-500">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="size-3" />
                  <span>Salin</span>
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
          <div className="flex items-center justify-between">
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
            <button
              type="button"
              onClick={() => copyField('lrn', learnings, 'Pembelajaran yang diperoleh')}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-bold text-foreground hover:bg-muted/15 active:scale-95 transition-all cursor-pointer shadow-2xs"
            >
              {copiedKey === 'lrn' ? (
                <>
                  <Check className="size-3 text-emerald-500" />
                  <span className="text-emerald-500">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="size-3" />
                  <span>Salin</span>
                </>
              )}
            </button>
          </div>

          <Textarea
            value={learnings}
            onChange={(e) => setLearnings(e.target.value)}
            placeholder="Tuliskan pengetahuan baru, pemahaman teknis, atau alur kerja yang dipelajari..."
            rows={3}
            className="text-xs bg-card resize-y"
          />

          {lrnCount < 100 && (
            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
              ⚠️ Kurang {100 - lrnCount} karakter lagi agar lolos validasi portal Kemnaker.
            </p>
          )}
        </div>

        {/* 3. Kendala yang Dialami */}
        <div className="rounded-2xl border border-border bg-surface p-4 space-y-2 transition-all">
          <div className="flex items-center justify-between">
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
                className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-bold text-foreground hover:bg-muted/15 active:scale-95 transition-all cursor-pointer shadow-2xs"
              >
                {copiedKey === 'blk' ? (
                  <>
                    <Check className="size-3 text-emerald-500" />
                    <span className="text-emerald-500">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3" />
                    <span>Salin</span>
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

      {/* ── BOOKMARKLET 1-KLIK ACCORDION ─────────────────────────── */}
      <div className="rounded-2xl border border-primary/25 bg-primary/5 p-3.5 space-y-2">
        <button
          type="button"
          onClick={() => setShowBookmarkletGuide(!showBookmarkletGuide)}
          className="w-full flex items-center justify-between text-xs font-bold text-primary cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Zap className="size-4" />
            <span>Ingin 100% Otomatis Terisi Tanpa Paste Satu-Satu? (Bookmarklet)</span>
          </div>
          {showBookmarkletGuide ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </button>

        {showBookmarkletGuide && (
          <div className="pt-2 text-[11px] text-muted-foreground space-y-2 border-t border-primary/15">
            <p>
              Kamu bisa memasang <strong>Bookmarklet 1-Klik Daylog</strong> di browser (Chrome / Edge / Firefox):
            </p>
            <ol className="list-decimal list-inside space-y-1 text-foreground/90 font-medium">
              <li>
                Klik tombol{' '}
                <span className="font-bold text-primary">Salin Kode Bookmarklet</span> di bawah.
              </li>
              <li>
                Buat bookmark baru di browser kamu (beri nama <code>⚡ Isi Form Monev</code>), lalu paste kodenya pada kolom URL.
              </li>
              <li>
                Saat di tab <strong>Monev Kemnaker</strong>, cukup klik bookmarklet tersebut &rarr; ketiga form otomatis terisi dan checkbox tercentang!
              </li>
            </ol>
            <div className="pt-1 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copyBookmarklet}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 hover:bg-primary/25 text-primary px-3 py-1.5 font-bold transition-all cursor-pointer text-[11px]"
              >
                <Copy className="size-3" />
                <span>Salin Kode Bookmarklet</span>
              </button>
            </div>
          </div>
        )}
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

        <button
          type="button"
          onClick={handleCopyAllAndOpenMonev}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
        >
          <span>Salin Semua & Buka Monev Kemnaker</span>
          <ExternalLink className="size-3.5" />
        </button>
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
