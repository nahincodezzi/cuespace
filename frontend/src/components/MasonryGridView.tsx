'use client';

import React from 'react';
import { Calendar, Clock, MessageSquare, Download, BellOff, User, ArrowUpRight } from 'lucide-react';
import { SmartEvent } from '@/types/event';
import { generateIcsFile } from '@/lib/ics';

interface MasonryGridViewProps {
  events: SmartEvent[];
  isDarkMode: boolean;
  onOpenSnooze: (event: SmartEvent) => void;
  onResetCategory?: () => void;
  onOpenDrawer?: () => void;
}

export const MasonryGridView: React.FC<MasonryGridViewProps> = ({ 
  events, 
  isDarkMode, 
  onOpenSnooze,
  onResetCategory,
  onOpenDrawer 
}) => {
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
          No events match the selected filter. Create a new event or reset filters to view all dates.
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

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'birthday': return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
      case 'deadline': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'health': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'anniversary': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {events.map((event) => {
        const waLink = event.recipient_phone
          ? `https://wa.me/${event.recipient_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
              `Happy ${event.category}! Wishing you a wonderful time! 🎉`
            )}`
          : null;

        return (
          <div
            key={event.id}
            className={`card-lift relative border rounded-2xl p-5 flex flex-col justify-between backdrop-blur-xl ${
              isDarkMode 
                ? 'bg-[#0f1118]/80 hover:bg-[#141722] border-white/[0.08] hover:border-indigo-500/30 shadow-[0_4px_25px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_35px_rgba(99,102,241,0.12)]' 
                : 'bg-white hover:bg-zinc-50 border-zinc-200 shadow-sm hover:border-indigo-200 hover:shadow-md'
            }`}
          >
            <div>
              {/* Category & Date Header */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getCategoryBadge(event.category)}`}>
                  {event.category}
                </span>
                <span className={`text-xs font-mono tabular-nums font-semibold ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  {event.original_date}
                </span>
              </div>

              {/* Title */}
              <h3 className={`text-base font-bold tracking-tight mb-2 line-clamp-1 ${isDarkMode ? 'text-zinc-100' : 'text-zinc-950'}`}>
                {event.title}
              </h3>
              
              {/* Description */}
              {event.description && (
                <p className={`text-xs leading-relaxed line-clamp-2 mb-4 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  {event.description}
                </p>
              )}

              {/* Event Attributes */}
              <div className={`space-y-2 text-xs pt-3 border-t ${
                isDarkMode ? 'border-white/[0.06] text-zinc-400' : 'border-zinc-200 text-zinc-600'
              }`}>
                <div className="flex items-center justify-between">
                  <span>Reminder</span>
                  <span className={`font-mono font-medium ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>
                    {event.reminder_time.slice(0, 5)} <span className="text-[10px] text-zinc-500">({event.timezone})</span>
                  </span>
                </div>
                {event.recipient_name && (
                  <div className="flex items-center justify-between">
                    <span>Recipient</span>
                    <span className={`font-medium ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>{event.recipient_name}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span>Channels</span>
                  <div className="flex items-center gap-1.5">
                    {event.channels.email && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Email</span>}
                    {event.channels.whatsapp && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">WA</span>}
                    {event.channels.sms && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">SMS</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className={`flex items-center justify-between gap-2 mt-5 pt-3.5 border-t ${
              isDarkMode ? 'border-white/[0.06]' : 'border-zinc-100'
            }`}>
              <div className="flex items-center gap-1.5">
                {waLink && (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-press inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 transition-all"
                    title="WhatsApp"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WA</span>
                    <ArrowUpRight className="w-2.5 h-2.5 opacity-70" />
                  </a>
                )}

                <button
                  onClick={() => onOpenSnooze(event)}
                  className={`btn-press inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    isDarkMode
                      ? 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-zinc-300 hover:text-white'
                      : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-700'
                  }`}
                  title="Snooze"
                >
                  <BellOff className="w-3.5 h-3.5 text-amber-400" />
                  <span>Snooze</span>
                </button>
              </div>

              <button
                onClick={() => generateIcsFile(event)}
                className={`btn-press p-2 rounded-xl border transition-all ${
                  isDarkMode
                    ? 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-zinc-400 hover:text-white'
                    : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-600'
                }`}
                title="Export .ics"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
