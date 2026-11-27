'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { switchThemeSmoothly } from '@/lib/themeTransition';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center opacity-0 ${className || ''}`} />
    );
  }

  const isDark = resolvedTheme === 'dark';

  const toggleTheme = () => {
    switchThemeSmoothly(setTheme, isDark ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative w-11 h-11 rounded-xl flex items-center justify-center border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-strong)] text-[var(--fg)] hover:text-[var(--accent-text)] transition-colors duration-200 cursor-pointer select-none ${className || ''}`}
    >
      <span className="relative w-4 h-4 flex items-center justify-center">
        <Sun
          className={`theme-icon w-4 h-4 text-[var(--amber)] absolute transition-all duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'
          }`}
        />
        <Moon
          className={`theme-icon w-4 h-4 text-[var(--accent-2)] absolute transition-all duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isDark ? 'opacity-0 -rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
          }`}
        />
      </span>
    </button>
  );
};
