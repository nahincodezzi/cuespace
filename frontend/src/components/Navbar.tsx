'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  UploadCloud, 
  Command, 
  Compass, 
  ShieldAlert, 
  LayoutDashboard, 
  Sparkles,
  Menu,
  X,
  Mail,
  Calendar
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

interface NavbarProps {
  onOpenDrawer: () => void;
  onOpenImport: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  totalEvents: number;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  currentView: 'landing' | 'dashboard' | 'admin' | 'orbit' | 'special_days';
  onViewChange: (v: 'landing' | 'dashboard' | 'admin' | 'orbit' | 'special_days') => void;
  onOpenCommandPalette?: () => void;
  onOpenTemplates?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenDrawer,
  onOpenImport,
  searchQuery,
  onSearchChange,
  isDarkMode,
  onToggleTheme,
  searchInputRef,
  currentView,
  onViewChange,
  onOpenCommandPalette,
  onOpenTemplates,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    {
      id: 'landing',
      label: 'Home',
      icon: Sparkles,
      view: 'landing' as const,
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      view: 'dashboard' as const,
    },
    {
      id: 'special_days',
      label: 'Special Days',
      icon: Calendar,
      view: 'special_days' as const,
      badge: '23 Days',
    },
    {
      id: 'orbit',
      label: 'Timezone Radar',
      icon: Compass,
      view: 'orbit' as const,
      badge: 'Live',
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl border-b border-[var(--border)] bg-[var(--bg)]/80 transition-colors duration-300">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8 h-18 flex items-center justify-between gap-4">
        
        {/* LEFT: CueSpace Brand Logo */}
        <div 
          onClick={() => onViewChange('landing')}
          className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
        >
          {/* Logo Tile: 34px rounded-10 brand gradient (§7.1) */}
          <div className="relative flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-gradient-to-br from-[#7C3AED] to-[#6366F1] shadow-[0_0_24px_rgba(124,58,237,0.5)] transition-transform duration-300 group-hover:scale-105">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" strokeOpacity="0.9" />
              <polyline points="12 7 12 12 15 15" strokeLinecap="round" />
            </svg>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[17px] font-bold tracking-tight text-[var(--fg)]">
              CueSpace
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-[var(--surface-strong)] text-[var(--accent-text)] border border-[var(--border)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)] animate-pulse" />
              PRO
            </span>
          </div>
        </div>

        {/* CENTER: Navigation Pill Group (§7.1) */}
        <nav className="hidden md:flex items-center p-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] backdrop-blur-md">
          {navLinks.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentView === tab.view;
            return (
              <button
                key={tab.id}
                onClick={() => onViewChange(tab.view)}
                className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 select-none ${
                  isActive
                    ? 'bg-[var(--surface-strong)] text-[var(--fg)] shadow-xs'
                    : 'text-[var(--muted)] hover:text-[var(--fg)]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 transition-colors ${
                  isActive ? 'text-[var(--accent-text)]' : 'text-[var(--muted-2)]'
                }`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="ml-0.5 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-[var(--green)]/15 text-[var(--green)]">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}

          {currentView === 'admin' && (
            <button
              onClick={() => onViewChange('dashboard')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-[var(--accent)]/15 text-[var(--accent-text)] border border-[var(--accent)]/30 hover:bg-[var(--accent)]/25 transition-all select-none ml-1"
              title="Click to exit Admin Portal"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin Mode (Exit)</span>
            </button>
          )}
        </nav>

        {/* RIGHT: Search, Utilities & Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* Quick Search Input / Command Palette Trigger */}
          <div 
            onClick={onOpenCommandPalette}
            className="relative group hidden lg:block cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-2)] group-hover:text-[var(--accent-text)] transition-colors" />
            <input
              ref={searchInputRef}
              id="header-search-desktop"
              name="search"
              type="text"
              readOnly
              placeholder="Search or Cmd+K..."
              value={searchQuery}
              className="w-44 hover:w-52 rounded-xl pl-8 pr-9 py-2 text-xs transition-all duration-200 cursor-pointer outline-none focus:outline-none focus-visible:outline-none focus:ring-0 ring-0 border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-strong)] text-[var(--fg)] placeholder-[var(--muted-2)]"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[9px] font-mono px-1 py-0.5 rounded border border-[var(--border)] bg-[var(--surface-strong)] text-[var(--muted)] pointer-events-none">
              <Command className="w-2.5 h-2.5" />
              <span>K</span>
            </div>
          </div>

          {/* Contacts Import Button */}
          <button
            onClick={onOpenImport}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-strong)] text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
            title="Import Contacts or CSV Calendar"
          >
            <UploadCloud className="w-3.5 h-3.5 text-[var(--accent-text)]" />
            <span>Import</span>
          </button>

          {/* Email Templates Button */}
          {onOpenTemplates && (
            <button
              onClick={onOpenTemplates}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-strong)] text-[var(--muted)] hover:text-[var(--fg)] transition-colors cursor-pointer"
              title="Manage Formal Email Templates"
            >
              <Mail className="w-3.5 h-3.5 text-[var(--accent-text)]" />
              <span>Templates</span>
            </button>
          )}

          {/* Theme Toggle Component */}
          <ThemeToggle />

          {/* Primary CTA: + Add Event */}
          <button
            onClick={onOpenDrawer}
            className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#7C3AED] to-[#6366F1] hover:opacity-95 shadow-[0_4px_20px_rgba(124,58,237,0.35)] active:scale-95 transition-all select-none group shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 shrink-0" />
            <span className="hidden xs:inline">Add </span>
            <span>Event</span>
            <kbd className="hidden sm:inline-flex text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-white/20 text-white/90">
              C
            </kbd>
          </button>

          {/* Mobile Menu Hamburger Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--fg)] shrink-0 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

        </div>
      </div>

      {/* MOBILE EXPANDABLE MENU */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--border)] px-4 pt-3 pb-4 space-y-2.5 backdrop-blur-2xl bg-[var(--bg)]/95 shadow-lg">
          {/* Mobile Search */}
          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-xl pl-8 pr-4 py-2 text-xs outline-none focus:outline-none focus-visible:outline-none focus:ring-0 ring-0 border border-[var(--border)] bg-[var(--surface)] text-[var(--fg)] placeholder-[var(--muted)]"
            />
          </div>

          {/* Mobile Nav Links */}
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentView === tab.view;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    onViewChange(tab.view);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[var(--surface-strong)] text-[var(--fg)] border border-[var(--accent)] shadow-xs'
                      : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--fg)]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0 text-[var(--accent-text)]" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Import Action */}
          <button
            onClick={() => {
              onOpenImport();
              setIsMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-semibold border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--fg)]"
          >
            <UploadCloud className="w-3.5 h-3.5 text-[var(--accent-text)]" />
            <span>Import Contacts or Calendar</span>
          </button>
        </div>
      )}
    </header>
  );
};
