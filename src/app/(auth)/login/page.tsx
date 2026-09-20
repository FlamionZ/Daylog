import type { Metadata } from 'next';
import { LoginForm } from '@/features/auth/components/login-form';

export const metadata: Metadata = {
  title: 'Masuk — Internship Companion',
  description: 'Masuk ke akun Internship Companion kamu',
};

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Logo / Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-[hsl(var(--primary))] shadow-sm">
            <span className="text-lg font-bold text-[hsl(var(--primary-foreground))]">
              IC
            </span>
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-[hsl(var(--foreground))]">
            Internship Companion
          </h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted))]">
            Pendamping aktivitas magang pengembang perangkat lunak
          </p>
        </div>

        {/* Login Form */}
        <LoginForm />

        {/* Disclaimer per design.md §2 */}
        <p className="mt-6 text-center text-xs text-[hsl(var(--muted))] leading-relaxed">
          Aplikasi pribadi untuk pencatatan aktivitas magang.
          <br />
          Tidak terafiliasi dengan atau menggantikan MagangHub Kemnaker maupun sistem internal perusahaan.
        </p>
      </div>
    </main>
  );
}
