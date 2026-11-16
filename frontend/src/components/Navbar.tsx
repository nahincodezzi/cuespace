'use client';

import React from 'react';
import { Plus, Search, Moon, Sun, BellRing, Sparkles, UploadCloud, Command, Compass, ShieldAlert, Home } from 'lucide-react';

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
}) => {
  return (
    <header className={`sticky top-0 z-40 w-full backdrop-blur-xl border-b transition-colors duration-200 ${
      isDarkMode 
        ? 'bg-[#08080d]/85 border-white/[0.08]' 
        : 'bg-white/85 border-zinc-200/80 shadow-xs'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* CueSpace Brand Logo */}
        <div 
          onClick={() => onViewChange('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <span className="relative flex h-8 w-8 items-center justify-center rounded-[11px] bg-gradient-to-br from-white/25 to-white/5 ring-1 ring-white/15 shadow-md shadow-purple-500/10 transition-transform group-hover:scale-105">
            <span className="absolute inset-0 rounded-[11px] bg-[radial-gradient(circle_at_30%_20%,rgba(167,139,250,0.55),transparent_70%)]" />
            <svg viewBox="0 0 24 24" className="relative h-[17px] w-[17px]" fill="none">
              <circle cx="12" cy="12" r="8" stroke="white" strokeOpacity="0.9" strokeWidth="1.4" />
              <circle cx="12" cy="12" r="2.1" fill="white" />
              <path d="M12 1.8v3.1M12 19.1v3.1" stroke="white" strokeOpacity="0.75" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[17px] font-medium tracking-tight ${isDarkMode ? 'text-white/95' : 'text-zinc-900'}`}>
                cuespace
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                PRO
              </span>
            </div>
          </div>
        </div>

        {/* Global Navigation View Tabs */}
        <div className={`hidden md:flex items-center p-1 rounded-xl border ${
          isDarkMode ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-zinc-100 border-zinc-200'
        }`}>
          <button
            onClick={() => onViewChange('landing')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'landing'
                ? isDarkMode ? 'bg-white/[0.1] text-white shadow-xs' : 'bg-white text-zinc-900 shadow-xs'
                : isDarkMode ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Landing Page</span>
          </button>

          <button
            onClick={() => onViewChange('dashboard')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'dashboard'
                ? isDarkMode ? 'bg-white/[0.1] text-white shadow-xs' : 'bg-white text-zinc-900 shadow-xs'
                : isDarkMode ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Dashboard
          </button>

          <button
            onClick={() => onViewChange('orbit')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'orbit'
                ? isDarkMode ? 'bg-white/[0.1] text-white shadow-xs' : 'bg-white text-zinc-900 shadow-xs'
                : isDarkMode ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
            <span>Timezone Radar</span>
          </button>

          <button
            onClick={() => onViewChange('admin')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'admin'
                ? isDarkMode ? 'bg-white/[0.1] text-white shadow-xs' : 'bg-white text-zinc-900 shadow-xs'
                : isDarkMode ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
            <span>Admin CMS</span>
          </button>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-xs hidden lg:block">
          <div className="relative group">
            <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
              isDarkMode ? 'text-zinc-500 group-focus-within:text-indigo-400' : 'text-zinc-400 group-focus-within:text-indigo-600'
            }`} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search (Cmd+K)"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className={`w-full rounded-xl pl-8 pr-10 py-1.5 text-xs transition-all focus:outline-none focus:ring-1 focus:ring-indigo-500/50 ${
                isDarkMode 
                  ? 'bg-white/[0.04] border border-white/[0.08] text-zinc-100 placeholder-zinc-500' 
                  : 'bg-zinc-100 border border-zinc-200 text-zinc-900 placeholder-zinc-400'
              }`}
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[9px] font-mono px-1 py-0.2 rounded bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 pointer-events-none">
              <Command className="w-2.5 h-2.5" />
              <span>K</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* CSV / Contacts Import */}
          <button
            onClick={onOpenImport}
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              isDarkMode
                ? 'text-zinc-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.07] border-white/[0.08]'
                : 'text-zinc-700 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200/80 border-zinc-200'
            }`}
            title="Import Contacts or CSV"
          >
            <UploadCloud className="w-3.5 h-3.5 text-indigo-400" />
            <span>Import</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            aria-label="Toggle Theme"
            className={`p-2 rounded-xl border transition-all ${
              isDarkMode
                ? 'text-zinc-400 hover:text-zinc-100 bg-white/[0.03] hover:bg-white/[0.07] border-white/[0.08]'
                : 'text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200/80 border-zinc-200'
            }`}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* Add Event Button with shortcut pill */}
          <button
            onClick={onOpenDrawer}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-md shadow-indigo-600/30 active:scale-95 transition-all group"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            <span>Add Event</span>
            <kbd className="hidden sm:inline-block text-[10px] font-mono px-1 py-0.2 rounded bg-indigo-700/60 text-indigo-200 border border-indigo-500/40">
              C
            </kbd>
          </button>
        </div>
      </div>
    </header>
  );
};
