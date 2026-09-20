'use client';

import * as React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, ExternalLink, Calendar, Code2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  learningFormSchema,
  learningLevels,
  type LearningFormInput,
} from '../schemas/learning-schema';
import { createLearning, updateLearning, type LearningRecord } from '../actions/learning-actions';
import { todayInJakarta } from '@/lib/date';

interface LearningFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  learning?: LearningRecord | null;
  onSuccess?: () => void;
}

const levelLabels: Record<string, string> = {
  exploring: '1. Exploring (Mengenal)',
  learning: '2. Learning (Mempelajari)',
  practicing: '3. Practicing (Menerapkan)',
  confident: '4. Confident (Menguasai)',
};

export function LearningFormModal({
  open,
  onOpenChange,
  learning,
  onSuccess,
}: LearningFormModalProps) {
  const [isPending, startTransition] = React.useTransition();
  const isEditing = Boolean(learning?.id);

  const form = useForm<LearningFormInput>({
    resolver: zodResolver(learningFormSchema),
    defaultValues: {
      topic: learning?.topic || '',
      technology: learning?.technology || '',
      summary: learning?.summary || '',
      sourceUrl: learning?.source_url || '',
      level: learning?.level || 'learning',
      learnedOn: learning?.learned_on || todayInJakarta(),
    },
  });

  const levelValue = useWatch({ control: form.control, name: 'level' });

  React.useEffect(() => {
    if (open) {
      form.reset({
        topic: learning?.topic || '',
        technology: learning?.technology || '',
        summary: learning?.summary || '',
        sourceUrl: learning?.source_url || '',
        level: learning?.level || 'learning',
        learnedOn: learning?.learned_on || todayInJakarta(),
      });
    }
  }, [open, learning, form]);

  const handleSubmit = (data: LearningFormInput) => {
    startTransition(async () => {
      const result = isEditing && learning?.id
        ? await updateLearning(learning.id, data)
        : await createLearning(data);

      if (result.success) {
        toast.success(result.message);
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(result.error || 'Gagal menyimpan pembelajaran');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Pembelajaran' : 'Catat Pembelajaran Baru'}</DialogTitle>
          <DialogDescription>
            Dokumentasikan konsep, teknologi, atau teknik baru yang kamu pelajari selama magang.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-2">
          {/* Topic */}
          <div className="space-y-2">
            <Label htmlFor="learning-topic">Topik Pembelajaran</Label>
            <Input
              id="learning-topic"
              placeholder="Contoh: Row Level Security (RLS) di PostgreSQL"
              disabled={isPending}
              {...form.register('topic')}
            />
            {form.formState.errors.topic && (
              <p className="text-xs text-[hsl(var(--destructive))]">
                {form.formState.errors.topic.message}
              </p>
            )}
          </div>

          {/* Technology & Level */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="learning-tech">Teknologi / Bahasa</Label>
              <div className="relative">
                <Code2 className="absolute left-3 top-2.5 size-4 text-[hsl(var(--muted))]" />
                <Input
                  id="learning-tech"
                  placeholder="PostgreSQL, Next.js, Git..."
                  className="pl-9"
                  disabled={isPending}
                  {...form.register('technology')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="learning-level">Tingkat Pemahaman</Label>
              <Select
                value={levelValue}
                onValueChange={(val) => form.setValue('level', val as LearningFormInput['level'])}
                disabled={isPending}
              >
                <SelectTrigger id="learning-level">
                  <SelectValue placeholder="Pilih tingkat" />
                </SelectTrigger>
                <SelectContent>
                  {learningLevels.map((lvl) => (
                    <SelectItem key={lvl} value={lvl}>
                      {levelLabels[lvl]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Learned On Date */}
          <div className="space-y-2">
            <Label htmlFor="learning-date">Tanggal Dipelajari</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 size-4 text-[hsl(var(--muted))]" />
              <Input
                id="learning-date"
                type="date"
                className="pl-9"
                disabled={isPending}
                {...form.register('learnedOn')}
              />
            </div>
          </div>

          {/* Source URL */}
          <div className="space-y-2">
            <Label htmlFor="learning-url">Tautan Referensi (Opsional)</Label>
            <div className="relative">
              <ExternalLink className="absolute left-3 top-2.5 size-4 text-[hsl(var(--muted))]" />
              <Input
                id="learning-url"
                placeholder="https://supabase.com/docs/guides/database/postgres/row-level-security"
                className="pl-9"
                disabled={isPending}
                {...form.register('sourceUrl')}
              />
            </div>
          </div>

          {/* Summary / Notes */}
          <div className="space-y-2">
            <Label htmlFor="learning-summary">Ringkasan / Key Takeaways</Label>
            <Textarea
              id="learning-summary"
              placeholder="Catatan inti dari konsep yang dipelajari dan bagaimana menerapkannya..."
              rows={4}
              disabled={isPending}
              {...form.register('summary')}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Menyimpan...
                </>
              ) : isEditing ? (
                'Simpan Perubahan'
              ) : (
                'Simpan Pembelajaran'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
