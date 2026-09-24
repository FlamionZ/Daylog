'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  Rocket,
  ShieldCheck,
  ExternalLink,
  ChevronDown,
  BookOpen,
  ListTodo,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { OnboardingModal } from '@/features/onboarding/components/onboarding-modal';
import { TaskFormModal } from '@/features/tasks/components/task-form-modal';
import { LearningFormModal } from '@/features/learnings/components/learning-form-modal';

// Daylog Playful Bento Components
import { DaylogFocusCard } from './daylog-focus-card';
import { DaylogAttendanceCard } from './daylog-attendance-card';
import { DaylogRhythmCard } from './daylog-rhythm-card';
import { DaylogActiveTasksCard } from './daylog-active-tasks-card';
import { DaylogReportCard } from './daylog-report-card';
import { DaylogJournalAiCard } from './daylog-journal-ai-card';
import { DaylogQuickProgressCard } from './daylog-quick-progress-card';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';
import { CheckInModal } from '@/features/attendance/components/check-in-modal';
import { CheckOutModal } from '@/features/attendance/components/check-out-modal';
import { createTask, type TaskRecord } from '@/features/tasks/actions/task-actions';
import type { AttendanceRecord } from '@/features/attendance/actions/attendance-actions';
import type { InternshipRecord } from '@/features/onboarding/actions/internship-actions';
import type { JournalRecord } from '@/features/journals/actions/journal-actions';
import type { LearningRecord } from '@/features/learnings/actions/learning-actions';
import type { ReportRecord } from '@/features/reports/actions/report-actions';
import { getInternshipWeek, formatDate } from '@/lib/date';

interface DashboardUser {
  id?: string;
  email?: string | null;
  user_metadata?: {
    full_name?: string;
  };
}

interface DashboardViewProps {
  user: DashboardUser | null;
  internship: InternshipRecord | null;
  todayAttendance: AttendanceRecord | null;
  tasks: TaskRecord[];
  journals: JournalRecord[];
  learnings: LearningRecord[];
  reports?: ReportRecord[];
}

export function DashboardView({
  user,
  internship,
  todayAttendance,
  tasks,
  journals,
  learnings,
  reports = [],
}: DashboardViewProps) {
  const router = useRouter();
  const [onboardingOpen, setOnboardingOpen] = React.useState(false);
  const [taskModalOpen, setTaskModalOpen] = React.useState(false);
  const [learningModalOpen, setLearningModalOpen] = React.useState(false);
  const [checkInOpen, setCheckInOpen] = React.useState(false);
  const [checkOutOpen, setCheckOutOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  // Setup Supabase Realtime for live updates on data changes
  React.useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('dashboard-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'attendance_records' },
        () => {
          router.refresh();
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => {
          router.refresh();
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'journal_entries' },
        () => {
          router.refresh();
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'weekly_reports' },
        () => {
          router.refresh();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  // Keyboard shortcuts: T for Task, L for Learning
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

      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setTaskModalOpen(true);
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        setLearningModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleQuickProgress = async (text: string) => {
    const res = await createTask({
      title: text,
      status: 'done',
      priority: 'medium',
    });
    if (res.success) {
      router.refresh();
    } else {
      throw new Error(res.error || 'Gagal menyimpan progress');
    }
  };

  const fullName =
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Peserta';
  const firstName = fullName.split(' ')[0] || 'Peserta';

  // If no active internship, show onboarding empty state
  if (!internship) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Hai {firstName}, ready buat hari ini? ☀️
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Mari mulai setup workspace magang pribadimu untuk mencatat kehadiran, jurnal, dan tugas harian.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-border bg-card text-card-foreground px-6 py-16 text-center shadow-xs">
          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#5D7FE8]/10 text-[#5D7FE8]">
            <Rocket className="size-7" />
          </div>
          <h2 className="text-lg font-bold text-foreground">
            Mulai hari pertamamu
          </h2>
          <p className="mt-1.5 max-w-md text-sm text-muted-foreground leading-relaxed">
            Atur informasi periode magang, perusahaan, dan posisi untuk mulai mencatat kehadiran, jurnal harian, dan tugas.
          </p>
          <Button
            onClick={() => setOnboardingOpen(true)}
            className="mt-6 rounded-full bg-primary text-primary-foreground px-6 py-2 text-sm font-semibold hover:bg-primary/90"
          >
            <Plus className="mr-2 size-4" />
            Lengkapi Profil Magang
          </Button>
        </div>

        <OnboardingModal
          open={onboardingOpen}
          onOpenChange={setOnboardingOpen}
          onSuccess={() => window.location.reload()}
        />
      </div>
    );
  }

  // Calculate day & week of internship
  const weekNumber = getInternshipWeek(internship.start_date);
  const weekString = `Minggu ${String(weekNumber).padStart(2, '0')}`;
  const dateString = formatDate(new Date(), 'EEEE, d MMM');

  const activeTask = tasks.find((t) => t.status === 'in_progress') || tasks[0] || null;
  const latestJournal = journals[0] || null;
  const completedJournalsThisWeek = journals.filter(
    (j) => j.status === 'completed',
  ).length;

  return (
    <div className="space-y-6 pb-12">
      {/* ── 1. TOP HEADER (Matches 'daylog' reference) ────────────────── */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        {/* Left: Week metadata & Greeting */}
        <div>
          {/* Metadata pill/text */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <span>{weekString}</span>
            <span>·</span>
            <span>{dateString}</span>
          </div>

          {/* Greeting with playful doodle underline and sun emoji */}
          <div className="mt-1 flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
              Hai {firstName},{' '}
              <span className="relative inline-block whitespace-nowrap">
                ready buat hari ini?
                {/* Hand-drawn blue doodle underline */}
                <svg
                  className="absolute -bottom-1.5 left-0 w-full h-3 text-[#5D7FE8] overflow-visible"
                  viewBox="0 0 160 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                >
                  <path d="M 4 8 Q 45 2, 85 7 T 156 6" />
                </svg>
              </span>
            </h1>
            <span className="text-2xl sm:text-3xl" role="img" aria-label="sun">
              ☀️
            </span>
          </div>

          {/* Subtitle with Role & Company */}
          <p className="mt-1.5 text-xs sm:text-sm font-semibold text-[#68645E] dark:text-[#8493A8]">
            {internship.role_title} · {internship.company_name}
          </p>
        </div>

        {/* Right: Search Pill & Action Button */}
        <div className="flex items-center gap-3 self-stretch lg:self-center">
          {/* Pill Search Bar */}
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3.5 top-2.5 size-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari aktivitas, tugas, jurnal..."
              className="w-full rounded-full border border-border bg-card/90 px-4 pl-9 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-2xs transition-all"
            />
          </div>

          {/* Asisten AI Pill Button */}
          <Link
            href="/assistant"
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-2 text-xs font-bold text-primary shadow-xs hover:bg-primary/20 active:scale-95 transition-all shrink-0"
          >
            <Sparkles className="size-3.5 text-primary" />
            <span>Asisten AI</span>
          </Link>

          {/* Black/White Pill Button: + Catat aktivitas */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-xs transition-all hover:bg-primary/90 active:scale-95 shrink-0">
                <Plus className="size-3.5 stroke-[2.5]" />
                <span>Catat aktivitas</span>
                <ChevronDown className="size-3 opacity-60 ml-0.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-lg">
              <DropdownMenuItem asChild>
                <Link href="/assistant" className="flex items-center gap-2 cursor-pointer font-semibold text-primary">
                  <Sparkles className="size-4 text-primary" />
                  <span>Buka Asisten AI Copilot</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/journals" className="flex items-center gap-2 cursor-pointer">
                  <BookOpen className="size-4 text-emerald-500" />
                  <span>Tulis Jurnal</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTaskModalOpen(true)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <ListTodo className="size-4 text-blue-500" />
                <span>Tambah Tugas Baru</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLearningModalOpen(true)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <GraduationCap className="size-4 text-amber-500" />
                <span>Catat Pembelajaran ({learnings.length})</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* ── 2. PLAYFUL PASTEL BENTO GRID ────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
        {/* ROW 1: Focus Card (8 cols) & Attendance Card (4 cols) */}
        <div className="md:col-span-2 lg:col-span-8">
          <DaylogFocusCard
            activeTask={activeTask}
            onOpenTasks={() => setTaskModalOpen(true)}
            onCreateTask={() => setTaskModalOpen(true)}
          />
        </div>
        <div className="md:col-span-2 lg:col-span-4">
          <DaylogAttendanceCard
            todayAttendance={todayAttendance}
            onOpenCheckIn={() => setCheckInOpen(true)}
            onOpenCheckOut={() => setCheckOutOpen(true)}
          />
        </div>

        {/* ROW 2: Rhythm Card (4 cols), Active Tasks (4 cols), Report Card (4 cols) */}
        <div className="md:col-span-1 lg:col-span-4">
          <DaylogRhythmCard
            journals={journals}
            completedJournalsCount={completedJournalsThisWeek}
            totalTarget={5}
          />
        </div>
        <div className="md:col-span-1 lg:col-span-4">
          <DaylogActiveTasksCard
            tasks={tasks}
            onOpenTasks={() => setTaskModalOpen(true)}
            onCreateTask={() => setTaskModalOpen(true)}
          />
        </div>
        <div className="md:col-span-2 lg:col-span-4">
          <DaylogReportCard reports={reports} />
        </div>

        {/* ROW 3: Journal AI Card (8 cols) & Quick Progress Card (4 cols) */}
        <div className="md:col-span-2 lg:col-span-8">
          <DaylogJournalAiCard latestJournal={latestJournal} />
        </div>
        <div className="md:col-span-2 lg:col-span-4">
          <DaylogQuickProgressCard onSubmitProgress={handleQuickProgress} />
        </div>
      </div>

      {/* ── 3. KEMNAKER MAGANGHUB COMPANION STRIP ───────────────────── */}
      <div className="flex flex-col gap-3 rounded-[20px] border border-border bg-card/70 backdrop-blur-xs p-4 sm:flex-row sm:items-center sm:justify-between text-xs shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <ShieldCheck className="size-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground">Kemnaker MagangHub Companion</span>
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                Terhubung
              </span>
            </div>
            <p className="text-muted-foreground mt-0.5">
              Sinkronisasi absensi harian dan draf laporan akhir berstandar resmi Kemnaker RI.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="h-8 rounded-full text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/15"
          >
            <Link href="/attendance">
              Ceklist Kehadiran
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            asChild
            className="h-8 rounded-full text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/15"
          >
            <Link href="/reports">
              Pusat Selesai Magang
            </Link>
          </Button>

          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-8 rounded-full border-border bg-surface text-xs font-bold text-foreground hover:bg-muted/15"
          >
            <a
              href="https://monev.maganghub.kemnaker.go.id"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5"
            >
              <span>Portal Monev</span>
              <ExternalLink className="size-3" />
            </a>
          </Button>
        </div>
      </div>

      {/* Modals */}
      <CheckInModal
        open={checkInOpen}
        onOpenChange={setCheckInOpen}
        onSuccess={() => router.refresh()}
      />
      <CheckOutModal
        open={checkOutOpen}
        onOpenChange={setCheckOutOpen}
        checkInAt={todayAttendance?.check_in_at}
        onSuccess={() => router.refresh()}
      />
      <TaskFormModal
        open={taskModalOpen}
        onOpenChange={setTaskModalOpen}
        onSuccess={() => router.refresh()}
      />
      <LearningFormModal
        open={learningModalOpen}
        onOpenChange={setLearningModalOpen}
        onSuccess={() => router.refresh()}
      />
      <OnboardingModal
        open={onboardingOpen}
        onOpenChange={setOnboardingOpen}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}
