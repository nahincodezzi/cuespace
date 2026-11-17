'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MessageSquare, Download, BellOff, Sparkles, User } from 'lucide-react';
import { SmartEvent } from '@/types/event';
import { generateIcsFile } from '@/lib/ics';

interface TimelineViewProps {
  events: SmartEvent[];
  isDarkMode: boolean;
  onOpenSnooze: (event: SmartEvent) => void;
  onResetCategory?: () => void;
  onOpenDrawer?: () => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ 
  events, 
  isDarkMode, 
  onOpenSnooze,
  onResetCategory,
  onOpenDrawer 
}) => {
  const [nowTime, setNowTime] = useState<number>(0);

  useEffect(() => {
    setNowTime(Date.now());
  }, []);

  if (events.length === 0) {
    return (
      <div className={`border rounded-2xl p-12 text-center transition-all ${
        isDarkMode ? 'bg-[#111318] border-white/[0.08]' : 'bg-white border-zinc-200 shadow-xs'
      }`}>
        <Calendar className="w-10 h-10 mx-auto text-zinc-400 mb-3" />
        <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>
          No events in this view
        </h3>
        <p className={`text-xs mt-1 mb-5 ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
          No special dates match the current category or search criteria.
        </p>
        <div className="flex items-center justify-center gap-3">
          {onResetCategory && (
            <button
              onClick={onResetCategory}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                isDarkMode 
                  ? 'bg-white/[0.04] border-white/[0.08] text-zinc-200 hover:bg-white/[0.08]' 
                  : 'bg-zinc-100 border-zinc-200 text-zinc-800 hover:bg-zinc-200'
              }`}
            >
              View All Dates
            </button>
          )}
          {onOpenDrawer && (
            <button
              onClick={onOpenDrawer}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all"
            >
              + Add Event Now
            </button>
          )}
        </div>
      </div>
    );
  }

  const getDaysUntil = (dateStr: string) => {
    if (!nowTime) return { label: 'Upcoming', status: 'normal' };
    const target = new Date(dateStr).getTime();
    const diff = Math.ceil((target - nowTime) / (1000 * 60 * 60 * 24));
    if (diff === 0) return { label: 'Today 🎉', status: 'today' };
    if (diff === 1) return { label: 'Tomorrow', status: 'urgent' };
    if (diff > 1 && diff <= 3) return { label: `in ${diff} days`, status: 'urgent' };
    if (diff < 0) return { label: 'Passed', status: 'past' };
    return { label: `in ${diff} days`, status: 'normal' };
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'birthday':
        return 'bg-pink-500/10 text-pink-500 dark:text-pink-400 border-pink-500/20';
      case 'deadline':
        return 'bg-blue-500/10 text-blue-500 dark:text-blue-400 border-blue-500/20';
      case 'health':
        return 'bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/20';
      case 'anniversary':
        return 'bg-purple-500/10 text-purple-500 dark:text-purple-400 border-purple-500/20';
      default:
        return 'bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border-indigo-500/20';
    }
  };

  return (
    <div className={`relative border-l ml-3 sm:ml-4 pl-6 space-y-5 transition-colors ${
      isDarkMode ? 'border-white/[0.08]' : 'border-zinc-200'
    }`}>
      {events.map((event) => {
        const countdown = getDaysUntil(event.original_date);
        
        const waLink = event.recipient_phone
          ? `https://wa.me/${event.recipient_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
              `Happy ${event.category === 'birthday' ? 'Birthday' : 'Celebration'} ${event.recipient_name || ''}! Wishing you the very best! 🎉`
            )}`
          : null;

        return (
          <div key={event.id} className="relative group">
            {/* Pulsing Timeline Bullet */}
            <div className={`absolute -left-[31px] top-4 w-3.5 h-3.5 rounded-full border-2 transition-all ${
              isDarkMode ? 'border-[#090A0F]' : 'border-slate-50'
            } ${
              countdown.status === 'today'
                ? 'bg-emerald-500 ring-4 ring-emerald-500/30 animate-pulse'
                : countdown.status === 'urgent'
                ? 'bg-amber-400 ring-4 ring-amber-400/20'
                : 'bg-indigo-500'
            }`} />

            {/* Event Card */}
            <div className={`border rounded-2xl p-5 transition-all duration-200 hover:shadow-lg ${
              isDarkMode 
                ? 'bg-[#111318] hover:bg-[#141720] border-white/[0.08] hover:border-white/[0.16]' 
                : 'bg-white hover:bg-zinc-50 border-zinc-200 shadow-xs hover:border-zinc-300'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className={`text-sm font-semibold tracking-tight ${
                      isDarkMode ? 'text-zinc-100' : 'text-zinc-900'
                    }`}>
                      {event.title}
                    </h3>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getCategoryBadge(event.category)}`}>
                      {event.category}
                    </span>
                    <span className={`text-[11px] font-mono tabular-nums px-2 py-0.5 rounded border font-medium ${
                      countdown.status === 'today'
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-500'
                        : countdown.status === 'urgent'
                        ? 'bg-amber-500/15 border-amber-500/30 text-amber-500'
                        : isDarkMode
                        ? 'bg-white/[0.04] border-white/[0.06] text-zinc-400'
                        : 'bg-zinc-100 border-zinc-200 text-zinc-600'
                    }`}>
                      {countdown.label}
                    </span>
                  </div>

                  {event.description && (
                    <p className={`text-xs mt-1.5 line-clamp-1 ${
                      isDarkMode ? 'text-zinc-400' : 'text-zinc-600'
                    }`}>
                      {event.description}
                    </p>
                  )}

                  {/* Metadata Row */}
                  <div className={`flex items-center gap-4 mt-3 text-xs flex-wrap ${
                    isDarkMode ? 'text-zinc-500' : 'text-zinc-600 font-medium'
                  }`}>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      <span className={isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}>{event.original_date}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      <span className={isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}>{event.reminder_time.slice(0, 5)}</span>
                      <span>({event.timezone})</span>
                    </span>
                    {event.recipient_name && (
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-zinc-400" />
                        <span className={isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}>{event.recipient_name}</span>
                      </span>
                    )}
                    {event.calendar_type !== 'GREGORIAN' && (
                      <span className="text-purple-500 dark:text-purple-400 font-medium px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[11px]">
                        🌙 {event.calendar_type}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Action buttons */}
                <div className={`flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 ${
                  isDarkMode ? 'border-white/[0.06]' : 'border-zinc-100'
                }`}>
                  {waLink && (
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  )}

                  <button
                    onClick={() => onOpenSnooze(event)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      isDarkMode
                        ? 'text-zinc-400 hover:text-zinc-200 bg-white/[0.03] hover:bg-white/[0.07] border-white/[0.08]'
                        : 'text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 border-zinc-200'
                    }`}
                    title="1-Click Snooze"
                  >
                    <BellOff className="w-3.5 h-3.5" />
                    <span>Snooze</span>
                  </button>

                  <button
                    onClick={() => generateIcsFile(event)}
                    className={`p-1.5 rounded-lg border transition-all ${
                      isDarkMode
                        ? 'text-zinc-400 hover:text-zinc-200 bg-white/[0.03] hover:bg-white/[0.07] border-white/[0.08]'
                        : 'text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 border-zinc-200'
                    }`}
                    title="Export .ics calendar"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
