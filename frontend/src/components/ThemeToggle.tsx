'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

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
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label="Switch to light/dark mode"
      className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition-colors border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-strong)] text-[var(--fg)] hover:text-[var(--accent-text)] ${className || ''}`}
    >
      <motion.div
        key={isDark ? 'dark' : 'light'}
        initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center justify-center"
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-[var(--amber)]" />
        ) : (
          <Moon className="w-4 h-4 text-[var(--accent-2)]" />
        )}
      </motion.div>
    </button>
  );
};
