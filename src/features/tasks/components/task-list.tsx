'use client';

import * as React from 'react';
import { Plus, Search, Calendar, Link2, CheckCircle2, Circle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EmptyState } from '@/components/feedback/empty-state';
import { TaskFormModal } from './task-form-modal';
import { TaskDetailModal } from './task-detail-modal';
import { updateTaskStatus, type TaskRecord } from '../actions/task-actions';
import { formatDate } from '@/lib/date';
import { toast } from 'sonner';

interface TaskListProps {
  tasks: TaskRecord[];
  onRefresh?: () => void;
}

export function TaskList({ tasks: initialTasks, onRefresh }: TaskListProps) {
  const [statusOverrides, setStatusOverrides] = React.useState<Record<string, TaskRecord['status']>>({});
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [priorityFilter, setPriorityFilter] = React.useState('all');
  const [activeTab, setActiveTab] = React.useState<'all' | 'active' | 'done' | 'urgent'>('all');

  const [formOpen, setFormOpen] = React.useState(false);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<TaskRecord | null>(null);

  const tasks = React.useMemo(() => {
    return initialTasks.map((t) =>
      statusOverrides[t.id] ? { ...t, status: statusOverrides[t.id] } : t,
    );
  }, [initialTasks, statusOverrides]);

  // Counts for quick tabs
  const counts = React.useMemo(() => {
    const all = tasks.length;
    const active = tasks.filter((t) => t.status !== 'done').length;
    const done = tasks.filter((t) => t.status === 'done').length;
    const urgent = tasks.filter((t) => t.priority === 'urgent' && t.status !== 'done').length;
    return { all, active, done, urgent };
  }, [tasks]);

  // Keyboard shortcut: Press 'c' or 'n' to add new task when not in an input
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        e.metaKey ||
        e.ctrlKey
      ) {
        return;
      }
      if (e.key === 'c' || e.key === 'C' || e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setSelectedTask(null);
        setFormOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter tasks locally for snappy UI
  const filteredTasks = React.useMemo(() => {
    return tasks.filter((t) => {
      // Tab filter
      if (activeTab === 'active' && t.status === 'done') return false;
      if (activeTab === 'done' && t.status !== 'done') return false;
      if (activeTab === 'urgent' && (t.priority !== 'urgent' || t.status === 'done')) return false;

      const matchSearch =
        !search ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      return matchSearch && matchStatus && matchPriority;
    });
  }, [tasks, activeTab, search, statusFilter, priorityFilter]);

  const handleToggleDone = async (task: TaskRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus: TaskRecord['status'] = task.status === 'done' ? 'in_progress' : 'done';
    const result = await updateTaskStatus(task.id, newStatus);
    if (result.success) {
      toast.success(newStatus === 'done' ? 'Tugas diselesaikan!' : 'Tugas dibuka kembali');
      setStatusOverrides((prev) => ({ ...prev, [task.id]: newStatus }));
      onRefresh?.();
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick Filter Tabs & Action Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Quick Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-bold transition-all shadow-2xs ${
              activeTab === 'all'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground border-border hover:bg-muted/10'
            }`}
          >
            Semua
            <span className={`font-mono text-[10px] ${activeTab === 'all' ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
              {counts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-bold transition-all shadow-2xs ${
              activeTab === 'active'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-card text-muted-foreground border-border hover:bg-muted/10'
            }`}
          >
            Aktif
            <span className={`font-mono text-[10px] ${activeTab === 'active' ? 'text-white/80' : 'text-muted-foreground'}`}>
              {counts.active}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('done')}
            className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-bold transition-all shadow-2xs ${
              activeTab === 'done'
                ? 'bg-emerald-600 dark:bg-emerald-900/60 text-white dark:text-emerald-300 border-emerald-600 dark:border-emerald-700/60'
                : 'bg-card text-muted-foreground border-border hover:bg-muted/10'
            }`}
          >
            Selesai
            <span className={`font-mono text-[10px] ${activeTab === 'done' ? 'text-white/80 dark:text-emerald-300/80' : 'text-muted-foreground'}`}>
              {counts.done}
            </span>
          </button>

          {counts.urgent > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('urgent')}
              className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-bold transition-all shadow-2xs ${
                activeTab === 'urgent'
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40'
                  : 'bg-card text-amber-700 dark:text-amber-300 border-border hover:bg-amber-500/10'
              }`}
            >
              Urgent
              <span className="font-mono text-[10px] font-extrabold">
                {counts.urgent}
              </span>
            </button>
          )}
        </div>

        {/* Add Task Button with Keyboard hint */}
        <button
          type="button"
          onClick={() => {
            setSelectedTask(null);
            setFormOpen(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all shrink-0 active:scale-95"
        >
          <Plus className="size-3.5" />
          <span>Tambah Tugas</span>
          <kbd className="hidden sm:inline-block rounded bg-primary-foreground/20 px-1 font-mono text-[9px] text-primary-foreground">C</kbd>
        </button>
      </div>

      {/* Toolbar: Search & Select Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Cari tugas berdasarkan judul atau deskripsi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs bg-card text-foreground placeholder:text-muted-foreground rounded-full border-border shadow-2xs focus-visible:ring-primary/20"
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-full sm:w-36 text-xs bg-card text-foreground rounded-full border-border shadow-2xs font-medium">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-border bg-popover text-popover-foreground shadow-md">
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
            <SelectItem value="done">Done</SelectItem>
            <SelectItem value="backlog">Backlog</SelectItem>
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="h-9 w-full sm:w-36 text-xs bg-card text-foreground rounded-full border-border shadow-2xs font-medium">
            <SelectValue placeholder="Prioritas" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-border bg-popover text-popover-foreground shadow-md">
            <SelectItem value="all">Semua Prioritas</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 className="size-10 text-primary" />}
          title="Tidak ada tugas ditemukan"
          description={
            search || statusFilter !== 'all' || priorityFilter !== 'all' || activeTab !== 'all'
              ? 'Coba sesuaikan filter atau kata kunci pencarian.'
              : 'Mulai dengan menambahkan tugas magang pertamamu.'
          }
          action={
            <button
              type="button"
              onClick={() => {
                setSelectedTask(null);
                setFormOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all"
            >
              <Plus className="size-3.5" />
              Tambah Tugas Baru
            </button>
          }
        />
      ) : (
        <div className="divide-y divide-border rounded-[24px] border border-border bg-card shadow-2xs overflow-hidden">
          {filteredTasks.map((task) => {
            const isDone = task.status === 'done';
            const linksCount = task.task_links?.length || 0;

            return (
              <div
                key={task.id}
                onClick={() => {
                  setSelectedTask(task);
                  setDetailOpen(true);
                }}
                className={`group flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-muted/10 cursor-pointer ${
                  isDone ? 'opacity-65 bg-muted/5' : ''
                }`}
              >
                {/* Left: toggle button & title */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={(e) => handleToggleDone(task, e)}
                    className="text-[#888480] hover:text-black dark:hover:text-white transition-colors shrink-0 p-0.5"
                    aria-label={isDone ? 'Tandai belum selesai' : 'Tandai selesai'}
                  >
                    {isDone ? (
                      <CheckCircle2 className="size-4.5 text-[#163A2B] dark:text-[#A7F3D0]" />
                    ) : (
                      <Circle className="size-4.5 text-black/30 dark:text-white/30 group-hover:text-black dark:group-hover:text-white transition-colors" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs font-bold text-black dark:text-[#E2E8F0] truncate ${
                        isDone ? 'line-through text-[#888480] dark:text-[#8493A8]' : ''
                      }`}
                    >
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-[11px] text-[#68645E] dark:text-[#8493A8] line-clamp-1 mt-0.5 font-normal">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Badges & metadata */}
                <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                  {linksCount > 0 && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-[#68645E] dark:text-[#8493A8] bg-[#F5F2EC] dark:bg-[#161F30] px-2 py-0.5 rounded-full border border-black/5 dark:border-[#1E2738] font-sans font-medium text-[10px]">
                      <Link2 className="size-3" />
                      <span>{linksCount} link</span>
                    </span>
                  )}

                  {task.due_date && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-[#68645E] dark:text-[#8493A8] bg-[#F5F2EC] dark:bg-[#161F30] px-2 py-0.5 rounded-full border border-black/5 dark:border-[#1E2738] font-sans font-medium text-[10px]">
                      <Calendar className="size-3" />
                      <span>{formatDate(task.due_date, 'd MMM')}</span>
                    </span>
                  )}

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                      task.priority === 'urgent'
                        ? 'bg-[#F8C39E] dark:bg-[#2A170A] text-[#4A240E] dark:text-[#FDBA74] border border-black/10 dark:border-[#522910]'
                        : task.priority === 'high'
                        ? 'bg-[#FBE892] dark:bg-[#282208] text-[#3E340D] dark:text-[#FDE047] border border-black/10 dark:border-[#524410]'
                        : task.priority === 'medium'
                        ? 'bg-[#DED8FA] dark:bg-[#1C1530] text-[#2B1E4A] dark:text-[#DDD6FE] border border-black/10 dark:border-[#382B5E]'
                        : 'bg-[#F5F2EC] dark:bg-[#161F30] text-[#68645E] dark:text-[#8493A8] border border-black/10 dark:border-[#1E2738]'
                    }`}
                  >
                    {task.priority}
                  </span>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase font-mono ${
                      task.status === 'done'
                        ? 'bg-[#BCE8D3] dark:bg-[#0F241A] text-[#163A2B] dark:text-[#9FE3C3] border border-black/5 dark:border-[#1A3D2D]'
                        : task.status === 'in_progress'
                        ? 'bg-[#5D7FE8] text-white'
                        : 'bg-[#F5F2EC] dark:bg-[#161F30] text-[#68645E] dark:text-[#8493A8] border border-black/10 dark:border-[#1E2738]'
                    }`}
                  >
                    {task.status?.replace('_', ' ')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Form Modal */}
      <TaskFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        task={selectedTask}
        onSuccess={onRefresh}
      />

      {/* Task Detail Modal */}
      <TaskDetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        task={selectedTask}
        onEdit={(task) => {
          setSelectedTask(task);
          setFormOpen(true);
        }}
        onSuccess={onRefresh}
      />
    </div>
  );
}
