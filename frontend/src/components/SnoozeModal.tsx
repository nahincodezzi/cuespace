'use client';

import React, { useState, useEffect } from 'react';
import { X, BellOff, Clock, Check, Sun, Calendar, Sparkles } from 'lucide-react';
import { SmartEvent } from '@/types/event';

interface SnoozeModalProps {
  event: SmartEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSnoozeSuccess: (eventId: string, hours: number) => void;
  isDarkMode: boolean;
}

export const SnoozeModal: React.FC<SnoozeModalProps> = ({
  event,
  isOpen,
  onClose,
  onSnoozeSuccess,
  isDarkMode,
}) => {
  const [selectedHours, setSelectedHours] = useState<number>(3);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !event) return null;

  const handleApply = () => {
    setApplied(true);
    setTimeout(() => {
      onSnoozeSuccess(event.id, selectedHours);
      setApplied(false);
      onClose();
    }, 600);
  };

  const bgModal = isDarkMode ? 'bg-[#111318] border-white/[0.1]' : 'bg-white border-zinc-200 shadow-2xl';
  const textPrimary = isDarkMode ? 'text-zinc-100' : 'text-zinc-900';
  const textMuted = isDarkMode ? 'text-zinc-400' : 'text-zinc-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className={`relative w-full max-w-sm border rounded-2xl p-6 shadow-2xl transition-colors ${bgModal}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <BellOff className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`text-sm font-semibold tracking-tight ${textPrimary}`}>Snooze Reminder</h3>
              <p className={`text-xs truncate max-w-[200px] ${textMuted}`}>{event.title}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className={`p-1 rounded-lg ${isDarkMode ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-400 hover:text-zinc-700'}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className={`text-xs mb-4 ${textMuted}`}>
          Choose a contextual pause window. Background worker will postpone all channels.
        </p>

        {/* Linear-Style Contextual Presets */}
        <div className="space-y-2 mb-6">
          {[
            { label: 'Later Today (3 Hours)', desc: 'Quick focus snooze', hours: 3, icon: Clock },
            { label: 'Tomorrow Morning (9:00 AM)', desc: 'Next business day', hours: 24, icon: Sun },
            { label: 'This Weekend (Saturday)', desc: 'Family & personal time', hours: 72, icon: Calendar },
            { label: 'Next Week (Monday)', desc: 'Next sprint review', hours: 168, icon: Sparkles },
          ].map((opt) => {
            const IconComponent = opt.icon;
            const isSelected = selectedHours === opt.hours;
            return (
              <button
                key={opt.hours}
                onClick={() => setSelectedHours(opt.hours)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-indigo-600/15 border-indigo-500 text-indigo-400 shadow-xs'
                    : isDarkMode
                    ? 'bg-white/[0.02] border-white/[0.06] text-zinc-300 hover:bg-white/[0.05]'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-800 hover:bg-zinc-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <IconComponent className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-zinc-400'}`} />
                  <div>
                    <div className="text-xs font-semibold">{opt.label}</div>
                    <div className={`text-[10px] ${textMuted}`}>{opt.desc}</div>
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={applied}
            className="px-4 py-2 rounded-xl text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/25"
          >
            {applied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Snoozed!</span>
              </>
            ) : (
              <span>Confirm Snooze</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
