'use client';

import * as React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  ExternalLink,
  GitCommit,
  GitPullRequest,
  FileCode,
  FileText,
  Plus,
  Trash2,
  Loader2,
  Edit,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  taskLinkSchema,
  taskLinkTypes,
  type TaskLinkInput,
} from '../schemas/task-schema';
import {
  addTaskLink,
  deleteTaskLink,
  deleteTask,
  type TaskRecord,
  type TaskLinkRecord,
} from '../actions/task-actions';
import { formatDate } from '@/lib/date';

interface TaskDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: TaskRecord | null;
  onEdit: (task: TaskRecord) => void;
  onSuccess?: () => void;
}

type BadgeVariant = 'outline' | 'secondary' | 'default' | 'warning' | 'destructive' | 'success';

const statusVariants: Record<string, BadgeVariant> = {
  backlog: 'outline',
  in_progress: 'default',
  in_review: 'warning',
  done: 'success',
};

const priorityVariants: Record<string, BadgeVariant> = {
  low: 'outline',
  medium: 'secondary',
  high: 'warning',
  urgent: 'destructive',
};

const linkTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  pull_request: GitPullRequest,
  commit: GitCommit,
  documentation: FileText,
  issue: FileCode,
  other: ExternalLink,
};

export function TaskDetailModal({
  open,
  onOpenChange,
  task,
  onEdit,
  onSuccess,
}: TaskDetailModalProps) {
  const [isPending, startTransition] = React.useTransition();
  const [showAddLink, setShowAddLink] = React.useState(false);

  const linkForm = useForm<TaskLinkInput>({
    resolver: zodResolver(taskLinkSchema),
    defaultValues: {
      taskId: task?.id || '',
      linkType: 'pull_request',
      label: '',
      url: '',
    },
  });

  const linkTypeValue = useWatch({ control: linkForm.control, name: 'linkType' });

  React.useEffect(() => {
    if (task?.id) {
      linkForm.setValue('taskId', task.id);
    }
  }, [task, linkForm]);

  if (!task) return null;

  const handleAddLink = (data: TaskLinkInput) => {
    startTransition(async () => {
      const result = await addTaskLink(data);
      if (result.success) {
        toast.success(result.message);
        linkForm.reset({ taskId: task.id, linkType: 'pull_request', label: '', url: '' });
        setShowAddLink(false);
        onSuccess?.();
      } else {
        toast.error(result.error || 'Gagal menambahkan link');
      }
    });
  };

  const handleDeleteLink = (linkId: string) => {
    startTransition(async () => {
      const result = await deleteTaskLink(linkId);
      if (result.success) {
        toast.success('Link dihapus');
        onSuccess?.();
      }
    });
  };

  const handleDeleteTask = () => {
    if (!confirm('Apakah kamu yakin ingin menghapus tugas ini?')) return;
    startTransition(async () => {
      const result = await deleteTask(task.id);
      if (result.success) {
        toast.success(result.message);
        onOpenChange(false);
        onSuccess?.();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Badge variant={priorityVariants[task.priority] || 'secondary'}>
              {task.priority?.toUpperCase()}
            </Badge>
            <Badge variant={statusVariants[task.status] || 'secondary'}>
              {task.status?.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
          <DialogTitle className="mt-2 text-xl">{task.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Metadata Row */}
          <div className="grid grid-cols-2 gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--accent)/0.3)] p-3 text-xs sm:grid-cols-3">
            <div>
              <span className="text-[hsl(var(--muted))]">Tenggat Waktu:</span>
              <p className="mt-0.5 font-semibold text-[hsl(var(--foreground))]">
                {task.due_date ? formatDate(task.due_date, 'd MMM yyyy') : '-'}
              </p>
            </div>
            <div>
              <span className="text-[hsl(var(--muted))]">Estimasi Waktu:</span>
              <p className="mt-0.5 font-semibold text-[hsl(var(--foreground))]">
                {task.estimate_minutes ? `${task.estimate_minutes} menit` : '-'}
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-[hsl(var(--muted))]">Waktu Aktual:</span>
              <p className="mt-0.5 font-semibold text-[hsl(var(--primary))]">
                {task.actual_minutes ? `${task.actual_minutes} menit` : '-'}
              </p>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-semibold text-[hsl(var(--muted))] uppercase">
                Deskripsi Tugas
              </h4>
              <p className="text-sm text-[hsl(var(--foreground))] whitespace-pre-wrap leading-relaxed">
                {task.description}
              </p>
            </div>
          )}

          {/* Task Links Section */}
          <div className="space-y-3 border-t border-[hsl(var(--border))] pt-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-[hsl(var(--foreground))]">
                Tautan / Deliverable
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddLink(!showAddLink)}
              >
                <Plus className="mr-1 size-3.5" />
                Tambah Link
              </Button>
            </div>

            {/* List of existing links */}
            {task.task_links && task.task_links.length > 0 ? (
              <div className="space-y-2">
                {task.task_links.map((link: TaskLinkRecord) => {
                  const Icon = linkTypeIcons[link.link_type] || ExternalLink;
                  return (
                    <div
                      key={link.id}
                      className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-2.5 text-sm"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className="size-4 shrink-0 text-[hsl(var(--primary))]" />
                        <div className="min-w-0">
                          <p className="font-medium text-xs text-[hsl(var(--foreground))] truncate">
                            {link.label || link.link_type}
                          </p>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[hsl(var(--primary))] hover:underline truncate block"
                          >
                            {link.url}
                          </a>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-[hsl(var(--muted))] hover:text-[hsl(var(--destructive))]"
                        onClick={() => handleDeleteLink(link.id)}
                        disabled={isPending}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-[hsl(var(--muted))]">
                Belum ada link deliverable (PR, repo, commit, dokumen) yang ditautkan.
              </p>
            )}

            {/* Add Link Form */}
            {showAddLink && (
              <form
                onSubmit={linkForm.handleSubmit(handleAddLink)}
                className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--accent)/0.3)] p-3 space-y-3"
              >
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="link-type" className="text-xs">Tipe Link</Label>
                    <Select
                      value={linkTypeValue}
                      onValueChange={(v) => linkForm.setValue('linkType', v as TaskLinkInput['linkType'])}
                    >
                      <SelectTrigger id="link-type" className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {taskLinkTypes.map((t) => (
                          <SelectItem key={t} value={t} className="text-xs">
                            {t.replace('_', ' ').toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="link-label" className="text-xs">Label (Opsional)</Label>
                    <Input
                      id="link-label"
                      placeholder="PR #12: Auth module"
                      className="h-8 text-xs"
                      {...linkForm.register('label')}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="link-url" className="text-xs">URL</Label>
                  <Input
                    id="link-url"
                    placeholder="https://github.com/..."
                    className="h-8 text-xs"
                    {...linkForm.register('url')}
                  />
                  {linkForm.formState.errors.url && (
                    <p className="text-[10px] text-[hsl(var(--destructive))]">
                      {linkForm.formState.errors.url.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setShowAddLink(false)}
                  >
                    Batal
                  </Button>
                  <Button type="submit" size="sm" className="h-7 text-xs" disabled={isPending}>
                    {isPending ? <Loader2 className="size-3 animate-spin" /> : 'Simpan Link'}
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between border-t border-[hsl(var(--border))] pt-4">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteTask}
              disabled={isPending}
            >
              <Trash2 className="mr-1.5 size-3.5" />
              Hapus
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onEdit(task);
                }}
              >
                <Edit className="mr-1.5 size-3.5" />
                Edit
              </Button>
              <Button
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
