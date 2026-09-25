'use client';

import * as React from 'react';
import { toast } from 'sonner';
import {
  Sparkles,
  Loader2,
  Check,
  Wand2,
  FileCheck2,
  Minimize2,
  HelpCircle,
  SpellCheck,
  UserCheck,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { improveWritingAction } from '../actions/ai-actions';
import type { ImproveWritingMode } from '@/server/ai/prompts/improve-writing';

const MODE_LABELS: Record<ImproveWritingMode, { name: string; desc: string }> = {
  humanize: {
    name: 'Humanize (Gaya Alami)',
    desc: 'Menghapus kesan kaku AI agar terdengar alami seperti ditulis langsung oleh manusia.',
  },
  polish: {
    name: 'Rapikan Tulisan',
    desc: 'Menyempurnakan alur kalimat agar enak dibaca tanpa mengubah fakta.',
  },
  professional: {
    name: 'Lebih Profesional',
    desc: 'Menyesuaikan gaya bahasa formal untuk laporan industri perangkat lunak.',
  },
  summarize: {
    name: 'Ringkas',
    desc: 'Meringkas tulisan menjadi lebih padat dan to the point.',
  },
  clarify: {
    name: 'Perjelas Kalimat',
    desc: 'Memperjelas maksud kalimat yang ambigu agar mudah dipahami.',
  },
  grammar: {
    name: 'Perbaiki Tata Bahasa',
    desc: 'Memperbaiki EYD/PUEBI, huruf kapital, dan tanda baca.',
  },
};

interface ImproveWritingMenuProps {
  text: string;
  onApply: (improvedText: string) => void;
  fieldName?: string;
}

export function ImproveWritingMenu({
  text,
  onApply,
  fieldName = 'Field',
}: ImproveWritingMenuProps) {
  const [isPending, startTransition] = React.useTransition();
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [selectedMode, setSelectedMode] = React.useState<ImproveWritingMode>('humanize');
  const [improvedText, setImprovedText] = React.useState<string | null>(null);

  const handleSelectMode = (mode: ImproveWritingMode) => {
    if (!text || !text.trim()) {
      toast.error(`Isi ${fieldName} terlebih dahulu sebelum menggunakan AI.`);
      return;
    }

    setSelectedMode(mode);
    startTransition(async () => {
      const res = await improveWritingAction({ text, mode });
      if (res.success && res.data) {
        setImprovedText(res.data.improvedText);
        setPreviewOpen(true);
      } else {
        toast.error(res.error || 'Gagal menyempurnakan tulisan.');
      }
    });
  };

  const handleApply = () => {
    if (improvedText) {
      onApply(improvedText);
      toast.success(`${fieldName} berhasil diperbarui.`);
      setPreviewOpen(false);
      setImprovedText(null);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground hover:text-primary"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <Sparkles className="mr-1 h-3.5 w-3.5 text-primary" />
                Perbaiki Teks
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem
            onClick={() => handleSelectMode('humanize')}
            className="focus:bg-emerald-500/10"
          >
            <UserCheck className="mr-2 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <div className="flex flex-col">
              <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                Humanize (Gaya Alami)
              </span>
              <span className="text-[10px] text-muted-foreground">
                Hilangkan kesan kaku AI
              </span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleSelectMode('polish')}>
            <Wand2 className="mr-2 h-4 w-4 text-primary" />
            <span>Rapikan Tulisan</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSelectMode('professional')}>
            <FileCheck2 className="mr-2 h-4 w-4 text-primary" />
            <span>Buat Lebih Profesional</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSelectMode('summarize')}>
            <Minimize2 className="mr-2 h-4 w-4 text-primary" />
            <span>Ringkas</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSelectMode('clarify')}>
            <HelpCircle className="mr-2 h-4 w-4 text-primary" />
            <span>Perjelas Kalimat</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSelectMode('grammar')}>
            <SpellCheck className="mr-2 h-4 w-4 text-primary" />
            <span>Perbaiki Tata Bahasa</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Preview Comparison Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <DialogTitle>Tinjau Perbaikan Teks</DialogTitle>
            </div>
            <DialogDescription>
              Mode: <span className="font-semibold text-foreground">{MODE_LABELS[selectedMode]?.name ?? selectedMode}</span>. {MODE_LABELS[selectedMode]?.desc}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="rounded-md bg-muted/40 p-3 border">
              <span className="font-medium text-muted-foreground block mb-1">Teks Asli:</span>
              <p className="whitespace-pre-wrap text-foreground/80">{text}</p>
            </div>

            <div className="rounded-md bg-primary/5 border border-primary/20 p-3">
              <span className="font-medium text-primary block mb-1">Hasil Perbaikan:</span>
              <p className="whitespace-pre-wrap text-foreground font-medium">{improvedText}</p>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2 border-t pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPreviewOpen(false)}
            >
              Batal
            </Button>
            <Button type="button" onClick={handleApply}>
              <Check className="mr-1 h-4 w-4" />
              Terapkan Perbaikan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
