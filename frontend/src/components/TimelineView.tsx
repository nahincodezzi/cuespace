'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MessageSquare, Download, BellOff, Sparkles, User, ArrowUpRight } from 'lucide-react';
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
      <div className={`card-lift border rounded-3xl p-12 text-center transition-all ${
        isDarkMode 
          ? 'bg-[#0f1118]/80 border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.4)]' 
          : 'bg-white border-zinc-200 shadow-sm'
      }`}>
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          <Calendar className="w-7 h-7" />
        </div>
        <h3 className={`text-base font-bold tracking-tight ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>
          No special dates in this view
        </h3>
        <p className={`text-xs mt-1.5 mb-6 max-w-sm mx-auto leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
          No events match the selected category filter or search query. Create a new event or reset filters to view all dates.
        </p>
        <div className="flex items-center justify-center gap-3">
          {onResetCategory && (
            <button
              onClick={onResetCategory}
              className={`btn-press px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
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
              className="btn-press px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-indigo-600/30 transition-all"
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
        return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
      case 'deadline':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'health':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'anniversary':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default:
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    }
  };

  return (
    <div className={`relative border-l-2 ml-3 sm:ml-5 pl-6 sm:pl-8 space-y-5 transition-colors ${
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
            <div className={`absolute -left-[31px] sm:-left-[39px] top-5 w-4 h-4 rounded-full border-2 transition-all duration-300 ${
              isDarkMode ? 'border-[#08080d]' : 'border-slate-50'
            } ${
              countdown.status === 'today'
                ? 'bg-emerald-500 ring-4 ring-emerald-500/40 animate-pulse scale-110'
                : countdown.status === 'urgent'
                ? 'bg-amber-400 ring-4 ring-amber-400/30'
                : 'bg-indigo-500 group-hover:scale-125'
            }`} />

            {/* Event Card */}
            <div className={`card-lift relative border rounded-2xl p-5 sm:p-6 backdrop-blur-xl ${
              isDarkMode 
                ? 'bg-[#0f1118]/80 hover:bg-[#141722] border-white/[0.08] hover:border-indigo-500/30 shadow-[0_4px_25px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_35px_rgba(99,102,241,0.12)]' 
                : 'bg-white hover:bg-zinc-50 border-zinc-200 shadow-sm hover:border-indigo-200 hover:shadow-md'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                
                {/* Info Column */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap mb-2">
                    <h3 className={`text-base font-bold tracking-tight truncate ${
                      isDarkMode ? 'text-zinc-100' : 'text-zinc-950'
                    }`}>
                      {event.title}
                    </h3>

                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getCategoryBadge(event.category)}`}>
                      {event.category}
                    </span>

                    <span className={`text-[11px] font-mono tabular-nums px-2.5 py-0.5 rounded-md border font-bold ${
                      countdown.status === 'today'
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 animate-pulse'
                        : countdown.status === 'urgent'
                        ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                        : isDarkMode
                        ? 'bg-white/[0.04] border-white/[0.08] text-zinc-300'
                        : 'bg-zinc-100 border-zinc-200 text-zinc-700'
                    }`}>
                      {countdown.label}
                    </span>

                    {event.snooze_until && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                        <BellOff className="w-3 h-3" />
                        <span>Snoozed</span>
                      </span>
                    )}
                  </div>

                  {event.description && (
                    <p className={`text-xs leading-relaxed line-clamp-2 mb-3.5 ${
                      isDarkMode ? 'text-zinc-400' : 'text-zinc-600'
                    }`}>
                      {event.description}
                    </p>
                  )}

                  {/* Metadata Chips */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                    <div className="flex items-center gap-1.5 text-zinc-400 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      <span className={isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}>
                        {event.original_date}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-zinc-400 font-mono">
                      <Clock className="w-3.5 h-3.5 text-purple-400" />
                      <span className={isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}>
                        {event.reminder_time.slice(0, 5)}
                      </span>
                      <span className="text-[10px] text-zinc-500">({event.timezone})</span>
                    </div>

                    {event.recipient_name && (
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <User className="w-3.5 h-3.5 text-emerald-400" />
                        <span className={`font-medium ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>
                          {event.recipient_name}
                        </span>
                      </div>
                    )}

                    {/* Delivery Channels */}
                    <div className="flex items-center gap-1">
                      {event.channels.email && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          Email
                        </span>
                      )}
                      {event.channels.whatsapp && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          WA
                        </span>
                      )}
                      {event.channels.sms && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          SMS
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/[0.06] shrink-0">
                  <div className="flex items-center gap-1.5">
                    {/* WhatsApp 1-Click Action */}
                    {waLink && (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-press inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 shadow-xs transition-all"
                        title="Open WhatsApp Direct Message"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                        <ArrowUpRight className="w-3 h-3 opacity-70" />
                      </a>
                    )}

                    {/* Snooze Trigger */}
                    <button
                      onClick={() => onOpenSnooze(event)}
                      className={`btn-press inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        isDarkMode
                          ? 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-zinc-300 hover:text-white'
                          : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-700'
                      }`}
                      title="Snooze Reminder"
                    >
                      <BellOff className="w-3.5 h-3.5 text-amber-400" />
                      <span>Snooze</span>
                    </button>

                    {/* iCal Export */}
                    <button
                      onClick={() => generateIcsFile(event)}
                      className={`btn-press p-2 rounded-xl border transition-all ${
                        isDarkMode
                          ? 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-zinc-400 hover:text-white'
                          : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-600'
                      }`}
                      title="Export .ics calendar file"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
