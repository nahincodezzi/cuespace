'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Plus, 
  LayoutDashboard, 
  Compass, 
  Moon, 
  Sun, 
  Calendar, 
  Download, 
  ShieldAlert, 
  X,
  Command,
  ArrowRight,
  Mail
} from 'lucide-react';
import { SmartEvent } from '@/types/event';
import { generateIcsFile } from '@/lib/ics';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  events: SmartEvent[];
  onSelectEvent: (event: SmartEvent) => void;
  onOpenCreate: () => void;
  onNavigate: (view: 'landing' | 'dashboard' | 'orbit' | 'admin') => void;
  onToggleTheme: () => void;
  isDarkMode: boolean;
  onOpenTemplates?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  events,
  onSelectEvent,
  onOpenCreate,
  onNavigate,
  onToggleTheme,
  isDarkMode,
  onOpenTemplates,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global Esc listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter events
  const matchingEvents = events.filter(e => 
    e.title.toLowerCase().includes(query.toLowerCase()) ||
    (e.description && e.description.toLowerCase().includes(query.toLowerCase())) ||
    e.category.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  // Quick system actions
  const actions = [
    {
      id: 'create-event',
      label: 'Create New Event',
      icon: Plus,
      shortcut: 'C',
      action: () => {
        onClose();
        onOpenCreate();
      }
    },
    {
      id: 'go-dashboard',
      label: 'Go to Events Dashboard',
      icon: LayoutDashboard,
      shortcut: 'D',
      action: () => {
        onClose();
        onNavigate('dashboard');
      }
    },
    {
      id: 'go-radar',
      label: 'Open Global Timezone Radar',
      icon: Compass,
      shortcut: 'R',
      action: () => {
        onClose();
        onNavigate('orbit');
      }
    },
    {
      id: 'toggle-theme',
      label: isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      icon: isDarkMode ? Sun : Moon,
      shortcut: 'T',
      action: () => {
        onClose();
        onToggleTheme();
      }
    },
    {
      id: 'email-templates',
      label: 'Manage Formal Email Templates',
      icon: Mail,
      shortcut: 'E',
      action: () => {
        onClose();
        if (onOpenTemplates) onOpenTemplates();
      }
    },
    {
      id: 'go-admin',
      label: 'Open Admin Console',
      icon: ShieldAlert,
      shortcut: 'A',
      action: () => {
        onClose();
        onNavigate('admin');
      }
    },
  ].filter(a => a.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl rounded-2xl bg-[#0f1118]/95 border border-white/[0.12] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center px-4 border-b border-white/[0.08]">
          <Search className="w-4 h-4 text-purple-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search events..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full py-4 bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-zinc-400 border border-white/10">
            ESC
          </kbd>
        </div>

        {/* List Content */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-3">
          
          {/* Section: Events */}
          {matchingEvents.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">
                Events ({matchingEvents.length})
              </div>
              <div className="space-y-1">
                {matchingEvents.map((evt) => (
                  <button
                    key={evt.id}
                    onClick={() => {
                      onClose();
                      onSelectEvent(evt);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-all group"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Calendar className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span className="font-medium text-white truncate">{evt.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 border border-white/10">
                        {evt.category}
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-500 font-mono shrink-0 ml-2">
                      {evt.original_date}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section: Quick Actions */}
          {actions.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">
                Quick Actions
              </div>
              <div className="space-y-1">
                {actions.map((act) => {
                  const Icon = act.icon;
                  return (
                    <button
                      key={act.id}
                      onClick={act.action}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs text-zinc-300 hover:text-white hover:bg-purple-500/10 hover:border-purple-500/20 border border-transparent transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-purple-400 group-hover:text-purple-300 transition-colors" />
                        <span className="font-medium">{act.label}</span>
                      </div>
                      <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-zinc-400 border border-white/10">
                        {act.shortcut}
                      </kbd>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {matchingEvents.length === 0 && actions.length === 0 && (
            <div className="py-8 text-center text-xs text-zinc-500">
              No matching commands or events found for &quot;{query}&quot;
            </div>
          )}

        </div>

        {/* Footer info bar */}
        <div className="px-4 py-2 bg-white/[0.02] border-t border-white/[0.06] flex items-center justify-between text-[11px] text-zinc-500">
          <div className="flex items-center gap-3">
            <span>Navigation: <kbd className="font-mono text-zinc-400">↑↓</kbd></span>
            <span>Select: <kbd className="font-mono text-zinc-400">↵</kbd></span>
          </div>
          <span>CueSpace Command Bar</span>
        </div>

      </div>
    </div>
  );
};
