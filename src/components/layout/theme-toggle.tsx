'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();

  const handleToggle = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      aria-label="Beralih mode tema (terang / gelap)"
      title="Beralih mode tema (terang / gelap)"
      className="relative size-9 rounded-full text-[#68645E] dark:text-[#8493A8] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] hover:text-black dark:hover:text-white transition-colors"
    >
      <Sun className="size-4 rotate-0 scale-100 transition-all duration-200 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute size-4 rotate-90 scale-0 transition-all duration-200 dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Beralih mode tema</span>
    </Button>
  );
}
