'use client';

import React, { useState, useEffect } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Search, Plus, Compass, Calendar, Sparkles, LayoutDashboard, Command } from 'lucide-react';

interface HeaderProps {
  onOpenAddEvent: () => void;
  onOpenDashboard: () => void;
  onOpenSpecialDays: () => void;
  onOpenRadar: () => void;
  onOpenCommandPalette?: () => void;
  activeSection?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddEvent,
  onOpenDashboard,
  onOpenSpecialDays,
  onOpenRadar,
  onOpenCommandPalette,
  activeSection = 'home',
}) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? 'backdrop-blur-xl bg-[var(--bg)]/75 border-b border-[var(--border)] shadow-xs'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8 h-18 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
        >
          {/* Celestial Clock Glyph */}
          <div className="relative flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-gradient-to-br from-[#7C3AED] to-[#6366F1] shadow-[0_0_24px_rgba(124,58,237,0.5)] transition-transform group-hover:scale-105">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" strokeOpacity="0.9" />
              <polyline points="12 7 12 12 15 15" strokeLinecap="round" />
            </svg>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[17px] font-bold tracking-tight text-[var(--fg)]">
              CueSpace
            </span>
            <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-[var(--surface-strong)] text-[var(--accent-text)] border border-[var(--border)]">
              CELESTIAL
            </span>
          </div>
        </div>

        {/* Center Nav Pill Group */}
        <nav className="hidden md:flex items-center p-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] backdrop-blur-md">
          {[
            { id: 'home', label: 'Home', action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
            { id: 'radar', label: 'Timezone Radar', action: onOpenRadar },
            { id: 'special_days', label: 'Special Days', action: onOpenSpecialDays },
            { id: 'dashboard', label: 'Dashboard', action: onOpenDashboard },
          ].map((item) => (
            <button
              key={item.id}
              onClick={item.action}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all select-none ${
                activeSection === item.id
                  ? 'bg-[var(--surface-strong)] text-[var(--fg)] shadow-xs'
                  : 'text-[var(--muted)] hover:text-[var(--fg)]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2.5">
          {/* Quick Search */}
          <button
            onClick={onOpenCommandPalette}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-strong)] text-[var(--muted)] hover:text-[var(--fg)] text-xs transition-colors"
            title="Search commands and events"
          >
            <Search className="w-3.5 h-3.5 text-[var(--accent-text)]" />
            <span>Search</span>
            <kbd className="text-[9px] font-mono px-1 py-0.5 rounded border border-[var(--border)] bg-[var(--surface-strong)]">
              ⌘K
            </kbd>
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Add Event Primary CTA */}
          <button
            onClick={onOpenAddEvent}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#7C3AED] to-[#6366F1] hover:opacity-95 shadow-[0_4px_20px_rgba(124,58,237,0.35)] active:scale-95 transition-all select-none"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Event</span>
          </button>
        </div>

      </div>
    </header>
  );
};
