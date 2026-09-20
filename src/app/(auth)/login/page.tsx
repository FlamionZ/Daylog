import type { Metadata } from 'next';
import { LoginForm } from '@/features/auth/components/login-form';
import { ThemeToggle } from '@/components/layout/theme-toggle';

export const metadata: Metadata = {
  title: 'Masuk — Internship Companion — Daylog',
  description: 'Masuk ke akun Internship Companion kamu untuk mengelola aktivitas dan jurnal magang.',
};

export default function LoginPage() {
  return (
    <div className="relative min-h-dvh flex flex-col justify-between bg-[#F7F4EE] dark:bg-[#080C12] text-foreground px-4 py-6 sm:px-6 lg:px-8 selection:bg-primary/20">
      {/* Top Bar: Brand Mark & Theme Toggle */}
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* Daylog 4-square logo */}
          <div className="grid grid-cols-2 gap-1 size-6 shrink-0">
            <div className="rounded-[4px] bg-black dark:bg-white size-2.5" />
            <div className="rounded-[4px] bg-black dark:bg-white size-2.5" />
            <div className="rounded-[4px] bg-black dark:bg-white size-2.5" />
            <div className="rounded-[4px] bg-[#6284EB] dark:bg-[#3B82F6] size-2.5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground font-sans">
            daylog
          </span>
        </div>

        <ThemeToggle />
      </header>

      {/* Center: Hero & Card */}
      <main className="my-auto flex w-full flex-col items-center justify-center py-8">
        <div className="w-full max-w-md">
          {/* Header Copy */}
          <div className="mb-6 text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-3 py-1 text-[11px] font-bold text-muted-foreground uppercase tracking-wider shadow-2xs">
              <span className="size-1.5 rounded-full bg-[#6284EB] dark:bg-[#3B82F6]" />
              MagangHub Workspace
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Internship Companion
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
              Masuk ke akun untuk mengelola aktivitas magang, presensi, dan jurnal harian berstandar Kemnaker.
            </p>
          </div>

          {/* Login Card */}
          <div className="rounded-[28px] border border-border bg-card p-6 sm:p-7 shadow-xl backdrop-blur-xs">
            <LoginForm />
          </div>

          {/* Bottom Disclaimer */}
          <div className="mt-6 rounded-2xl border border-border/60 bg-secondary/30 p-3.5 text-center text-[11px] text-muted-foreground leading-relaxed">
            <p className="font-semibold text-foreground/80 mb-0.5">
              Aplikasi pendamping pribadi mandiri
            </p>
            Pencatatan aktivitas magang mandiri. Tidak terafiliasi resmi atau menggantikan sistem Monev Kemnaker RI maupun portal internal perusahaan.
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mx-auto flex w-full max-w-5xl items-center justify-center pt-4 text-center text-xs text-muted-foreground">
        <span>&copy; {new Date().getFullYear()} Daylog — Internship Companion. Built for Software Engineering Interns.</span>
      </footer>
    </div>
  );
}
