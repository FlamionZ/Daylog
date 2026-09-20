'use client';

import * as React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
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
  taskFormSchema,
  taskStatuses,
  taskPriorities,
  type TaskFormInput,
} from '../schemas/task-schema';
import { createTask, updateTask, type TaskRecord } from '../actions/task-actions';

interface TaskFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: TaskRecord | null;
  onSuccess?: () => void;
}

const statusLabels: Record<string, string> = {
  backlog: 'Backlog',
  todo: 'To Do',
  in_progress: 'In Progress',
  review: 'Review',
  blocked: 'Blocked',
  done: 'Done',
};

const priorityLabels: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export function TaskFormModal({
  open,
  onOpenChange,
  task,
  onSuccess,
}: TaskFormModalProps) {
  const [isPending, startTransition] = React.useTransition();
  const isEditing = Boolean(task?.id);

  const form = useForm<TaskFormInput>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      status: task?.status || 'todo',
      priority: task?.priority || 'medium',
      dueDate: task?.due_date || '',
      estimateMinutes: task?.estimate_minutes || undefined,
      actualMinutes: task?.actual_minutes || undefined,
    },
  });

  const statusValue = useWatch({ control: form.control, name: 'status' });
  const priorityValue = useWatch({ control: form.control, name: 'priority' });

  React.useEffect(() => {
    if (open) {
      form.reset({
        title: task?.title || '',
        description: task?.description || '',
        status: task?.status || 'todo',
        priority: task?.priority || 'medium',
        dueDate: task?.due_date || '',
        estimateMinutes: task?.estimate_minutes || undefined,
        actualMinutes: task?.actual_minutes || undefined,
      });
    }
  }, [open, task, form]);

  const handleSubmit = (data: TaskFormInput) => {
    startTransition(async () => {
      const result = isEditing && task?.id
        ? await updateTask(task.id, data)
        : await createTask(data);

      if (result.success) {
        toast.success(result.message);
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(result.error || 'Gagal menyimpan tugas');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Tugas' : 'Tambah Tugas Baru'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Perbarui informasi dan progres tugas magang kamu.'
              : 'Catat tugas yang diberikan oleh mentor atau tim magang.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-2">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="task-title">Judul Tugas</Label>
            <Input
              id="task-title"
              placeholder="Contoh: Implementasi modul autentikasi"
              disabled={isPending}
              {...form.register('title')}
            />
            {form.formState.errors.title && (
              <p className="text-xs text-[hsl(var(--destructive))]">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="task-desc">Deskripsi (Opsional)</Label>
            <Textarea
              id="task-desc"
              placeholder="Rincian persyaratan, accept criteria, atau catatan pengerjaan..."
              disabled={isPending}
              rows={3}
              {...form.register('description')}
            />
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="task-status">Status</Label>
              <Select
                value={statusValue}
                onValueChange={(val) => form.setValue('status', val as TaskFormInput['status'])}
                disabled={isPending}
              >
                <SelectTrigger id="task-status">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  {taskStatuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {statusLabels[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-priority">Prioritas</Label>
              <Select
                value={priorityValue}
                onValueChange={(val) => form.setValue('priority', val as TaskFormInput['priority'])}
                disabled={isPending}
              >
                <SelectTrigger id="task-priority">
                  <SelectValue placeholder="Pilih prioritas" />
                </SelectTrigger>
                <SelectContent>
                  {taskPriorities.map((p) => (
                    <SelectItem key={p} value={p}>
                      {priorityLabels[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date & Estimate */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="task-due">Tenggat Waktu (Deadline)</Label>
              <Input
                id="task-due"
                type="date"
                disabled={isPending}
                {...form.register('dueDate')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-estimate">Estimasi Waktu (Menit)</Label>
              <Input
                id="task-estimate"
                type="number"
                min="0"
                step="15"
                placeholder="120"
                disabled={isPending}
                {...form.register('estimateMinutes')}
              />
            </div>
          </div>

          {isEditing && (
            <div className="space-y-2">
              <Label htmlFor="task-actual">Waktu Aktual (Menit)</Label>
              <Input
                id="task-actual"
                type="number"
                min="0"
                step="15"
                placeholder="150"
                disabled={isPending}
                {...form.register('actualMinutes')}
              />
            </div>
          )}

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
                'Tambah Tugas'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
