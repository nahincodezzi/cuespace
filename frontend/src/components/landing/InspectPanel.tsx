'use client';

import React from 'react';
import { SmartEvent } from '@/types/event';
import { Odometer } from '@/components/motion/Odometer';
import { useNow } from '@/hooks/useNow';
import { Calendar, Plus, Clock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface InspectPanelProps {
  zoneName: string;
  timeString: string;
  events: SmartEvent[];
  onOpenAddEvent: () => void;
}

export const InspectPanel: React.FC<InspectPanelProps> = ({
  zoneName,
  timeString,
  events,
  onOpenAddEvent,
}) => {
  const { now } = useNow();

  // Filter events for this timezone and ensure next occurrence calculation (Bug #2 fix)
  const zoneEvents = events
    .filter((e) => e.timezone === zoneName)
    .map((e) => {
      let eventDate = new Date(e.original_date);
      // Bug #2 Fix: If in the past, roll forward to next active year (e.g. 2027)
      if (eventDate < now) {
        const nextYear = now.getFullYear() + (eventDate.getMonth() < now.getMonth() || (eventDate.getMonth() === now.getMonth() && eventDate.getDate() < now.getDate()) ? 1 : 0);
        const mm = String(eventDate.getMonth() + 1).padStart(2, '0');
        const dd = String(eventDate.getDate()).padStart(2, '0');
        return {
          ...e,
          original_date: `${nextYear}-${mm}-${dd}`,
        };
      }
      return e;
    });

  const getTagColor = (cat: string) => {
    switch (cat) {
      case 'health':
        return 'bg-[var(--green)]/15 text-[var(--green)] border-[var(--green)]/30';
      case 'birthday':
        return 'bg-[var(--amber)]/15 text-[var(--amber)] border-[var(--amber)]/30';
      default:
        return 'bg-[var(--accent)]/15 text-[var(--accent-text)] border-[var(--accent)]/30';
    }
  };

  return (
    <div className="h-full p-4 sm:p-6 lg:p-7 rounded-2xl sm:rounded-[22px] border border-[var(--border)] bg-[var(--surface)] backdrop-blur-xl shadow-[var(--shadow)] flex flex-col justify-between">
      <div>
        {/* Header with aria-live for accessibility */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[var(--border)] mb-3 sm:mb-4 gap-2">
          <div className="min-w-0">
            <span className="text-[9px] sm:text-[10px] uppercase font-mono font-bold tracking-wider text-[var(--muted-2)] block">
              Inspecting Zone
            </span>
            <h3
              aria-live="polite"
              className="text-base sm:text-lg lg:text-xl font-bold tracking-tight text-[var(--fg)] mt-0.5 truncate max-w-[150px] xs:max-w-[190px] sm:max-w-none"
            >
              {zoneName}
            </h3>
          </div>

          {/* Odometer Clock */}
          <div className="text-right shrink-0">
            <span className="text-[9px] sm:text-[10px] uppercase font-mono font-bold tracking-wider text-[var(--muted-2)] block">
              Wall Time
            </span>
            <div className="text-sm sm:text-base lg:text-lg font-bold text-[var(--accent-text)]">
              <Odometer value={timeString} />
            </div>
          </div>
        </div>

        {/* Zone Overview Note */}
        <p className="text-xs text-[var(--muted)] leading-relaxed mb-3 sm:mb-4">
          Reminders in this zone are converted to UTC at runtime taking into account local Daylight Saving Time rules.
        </p>

        {/* Scheduled Events Section */}
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--muted-2)] mb-3">
            <span>Scheduled in this zone ({zoneEvents.length})</span>
          </div>

          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
            <AnimatePresence mode="popLayout">
              {zoneEvents.length > 0 ? (
                zoneEvents.map((ev) => (
                  <motion.div
                    key={ev.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-[var(--fg)] truncate block">
                        {ev.title}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-[var(--muted)] font-mono mt-0.5">
                        <span className="flex items-center gap-0.5">
                          <Calendar className="w-3 h-3 text-[var(--accent-text)]" />
                          {ev.original_date}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-3 h-3 text-[var(--muted-2)]" />
                          {ev.reminder_time.slice(0, 5)}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${getTagColor(
                        ev.category
                      )}`}
                    >
                      {ev.category}
                    </span>
                  </motion.div>
                ))
              ) : (
                <div className="py-6 text-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--muted)]">
                  No events scheduled for {zoneName} yet.
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Quick Add Button */}
      <button
        onClick={onOpenAddEvent}
        className="mt-4 w-full py-2.5 px-3 sm:px-4 rounded-xl text-xs font-bold border border-[var(--border)] bg-[var(--surface-strong)] hover:border-[var(--accent)] hover:text-[var(--accent-text)] text-[var(--fg)] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
      >
        <Plus className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">Schedule Event for {zoneName.split('/').pop()?.replace('_', ' ') || zoneName}</span>
      </button>
    </div>
  );
};
