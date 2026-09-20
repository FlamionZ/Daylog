import type { ReactNode } from 'react';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-dvh bg-[#F7F4EE] dark:bg-[#080C12] text-foreground">
      <AppSidebar />
      <MobileBottomNav />
      <main className="lg:pl-60">
        <div className="mx-auto max-w-[1440px] px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:py-8 lg:pb-8">
          {children}
        </div>
      </main>
    </div>
  );
}
