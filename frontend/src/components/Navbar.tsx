'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Moon, 
  Sun, 
  UploadCloud, 
  Command, 
  Compass, 
  ShieldAlert, 
  LayoutDashboard, 
  Sparkles,
  Menu,
  X,
  Mail
} from 'lucide-react';

interface NavbarProps {
  onOpenDrawer: () => void;
  onOpenImport: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  totalEvents: number;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  currentView: 'landing' | 'dashboard' | 'admin' | 'orbit';
  onViewChange: (v: 'landing' | 'dashboard' | 'admin' | 'orbit') => void;
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
      label: 'Landing',
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
      id: 'orbit',
      label: 'Timezone Radar',
      icon: Compass,
      view: 'orbit' as const,
      badge: 'Live',
    },
  ];

  return (
    <header 
      className={`sticky top-0 z-50 w-full backdrop-blur-2xl transition-all duration-200 border-b ${
        isDarkMode 
          ? 'bg-[#08080d]/80 border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.5)]' 
          : 'bg-white/85 border-zinc-200/80 shadow-xs'
      }`}
    >
      {/* Top ambient highlight line */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-6">
        
        {/* LEFT: CueSpace Brand Logo */}
        <div 
          onClick={() => onViewChange('landing')}
          className="flex items-center gap-3 cursor-pointer group shrink-0 select-none"
        >
          {/* Glowing Cosmic Badge Icon */}
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-white/20 via-white/5 to-white/0 ring-1 ring-white/20 shadow-md shadow-purple-500/20 transition-all duration-300 group-hover:scale-105 group-hover:ring-purple-400/40">
            <span className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.5),transparent_70%)]" />
            <svg viewBox="0 0 24 24" className="relative h-4.5 w-4.5 text-white transition-transform duration-300 group-hover:rotate-45" fill="none">
              <circle cx="12" cy="12" r="8" stroke="currentColor" strokeOpacity="0.9" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="2.2" fill="currentColor" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" strokeOpacity="0.75" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </div>

          {/* Brand Name & Status Pill */}
          <div className="flex items-center gap-2">
            <span className={`text-[17px] font-semibold tracking-tight transition-colors ${
              isDarkMode ? 'text-white' : 'text-zinc-900'
            }`}>
              CueSpace
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium tracking-wide px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              PRO
            </span>
          </div>
        </div>

        {/* CENTER: Sleek Glass Navigation Tabs (Desktop) */}
        <nav className="hidden md:flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] shadow-inner backdrop-blur-md">
          {navLinks.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentView === tab.view;
            return (
              <button
                key={tab.id}
                onClick={() => onViewChange(tab.view)}
                className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 select-none ${
                  isActive
                    ? isDarkMode
                      ? 'bg-white/[0.1] text-white shadow-[0_2px_8px_rgba(0,0,0,0.3)] border border-white/10'
                      : 'bg-white text-zinc-900 shadow-sm border border-zinc-200/60'
                    : isDarkMode
                      ? 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 transition-colors ${
                  isActive 
                    ? 'text-purple-400' 
                    : 'text-zinc-500 group-hover:text-zinc-400'
                }`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="ml-0.5 text-[9px] font-semibold px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}

          {currentView === 'admin' && (
            <button
              onClick={() => onViewChange('dashboard')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 transition-all select-none ml-1"
              title="Click to exit Admin Portal"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin Mode (Exit)</span>
            </button>
          )}
        </nav>

        {/* RIGHT: Search, Utilities & Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Quick Search Input / Command Palette Trigger */}
          <div 
            onClick={onOpenCommandPalette}
            className="relative group hidden lg:block cursor-pointer"
          >
            <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
              isDarkMode 
                ? 'text-zinc-500 group-hover:text-purple-400' 
                : 'text-zinc-400 group-hover:text-indigo-600'
            }`} />
            <input
              ref={searchInputRef}
              type="text"
              readOnly
              placeholder="Search or type Cmd+K..."
              value={searchQuery}
              className={`w-48 hover:w-56 rounded-xl pl-8 pr-9 py-1.5 text-xs transition-all duration-200 cursor-pointer focus:outline-none ${
                isDarkMode 
                  ? 'bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-purple-500/30 text-zinc-100 placeholder-zinc-500' 
                  : 'bg-zinc-100 border border-zinc-200 text-zinc-900 placeholder-zinc-400 hover:bg-white'
              }`}
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[9px] font-mono px-1 py-0.5 rounded bg-white/5 text-zinc-400 border border-white/10 pointer-events-none">
              <Command className="w-2.5 h-2.5" />
              <span>K</span>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden lg:block h-5 w-[1px] bg-white/[0.08]" />

          {/* CSV / Contacts Import Button */}
          <button
            onClick={onOpenImport}
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200 ${
              isDarkMode
                ? 'text-zinc-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.07] border-white/[0.08] hover:border-white/15'
                : 'text-zinc-700 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200/80 border-zinc-200'
            }`}
            title="Import Contacts or CSV Calendar"
          >
            <UploadCloud className="w-3.5 h-3.5 text-purple-400" />
            <span>Import</span>
          </button>

          {/* Email Templates Manager Button */}
          {onOpenTemplates && (
            <button
              onClick={onOpenTemplates}
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200 cursor-pointer ${
                isDarkMode
                  ? 'text-zinc-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.07] border-white/[0.08] hover:border-white/15'
                  : 'text-zinc-700 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200/80 border-zinc-200'
              }`}
              title="Manage Formal Email Templates"
            >
              <Mail className="w-3.5 h-3.5 text-purple-400" />
              <span>Templates</span>
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            aria-label="Toggle Theme"
            className={`p-2 rounded-xl border transition-all duration-200 ${
              isDarkMode
                ? 'text-zinc-400 hover:text-zinc-100 bg-white/[0.03] hover:bg-white/[0.07] border-white/[0.08] hover:border-white/15'
                : 'text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200/80 border-zinc-200'
            }`}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* Standout Primary CTA: + Add Event */}
          <button
            onClick={onOpenDrawer}
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 border border-white/20 shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_25px_rgba(147,51,234,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 group shrink-0"
          >
            <Plus className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
            <span>Add Event</span>
            <kbd className="hidden sm:inline-flex text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-white/20 text-white/90 border border-white/20">
              C
            </kbd>
          </button>

          {/* Mobile Menu Hamburger Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 rounded-xl border transition-all ${
              isDarkMode 
                ? 'bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:text-white' 
                : 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-zinc-900'
            }`}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

        </div>
      </div>

      {/* MOBILE EXPANDABLE MENU */}
      {isMobileMenuOpen && (
        <div className={`md:hidden border-t px-4 pt-3 pb-4 space-y-2 backdrop-blur-2xl transition-all ${
          isDarkMode 
            ? 'bg-[#08080d]/95 border-white/[0.08]' 
            : 'bg-white/95 border-zinc-200 shadow-lg'
        }`}>
          {/* Mobile Search */}
          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className={`w-full rounded-xl pl-8 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500/40 ${
                isDarkMode 
                  ? 'bg-white/[0.05] border border-white/[0.08] text-zinc-100 placeholder-zinc-500' 
                  : 'bg-zinc-100 border border-zinc-200 text-zinc-900 placeholder-zinc-400'
              }`}
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
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? isDarkMode
                        ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30 font-semibold'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold'
                      : isDarkMode
                        ? 'bg-white/[0.02] border border-white/[0.04] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]'
                        : 'bg-zinc-50 border border-zinc-200/60 text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
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
            className={`w-full flex items-center justify-center gap-2 p-2 rounded-xl text-xs font-medium border transition-all ${
              isDarkMode 
                ? 'bg-white/[0.02] border-white/[0.06] text-zinc-300 hover:text-white' 
                : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:text-zinc-900'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5 text-purple-400" />
            <span>Import Contacts or Calendar</span>
          </button>
        </div>
      )}
    </header>
  );
};
