'use client';

import React from 'react';
import { Calendar, Clock, MessageSquare, Download, BellOff, User } from 'lucide-react';
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

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'birthday': return 'bg-pink-500/10 text-pink-500 dark:text-pink-400 border-pink-500/20';
      case 'deadline': return 'bg-blue-500/10 text-blue-500 dark:text-blue-400 border-blue-500/20';
      case 'health': return 'bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/20';
      case 'anniversary': return 'bg-purple-500/10 text-purple-500 dark:text-purple-400 border-purple-500/20';
      default: return 'bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border-indigo-500/20';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {events.map((event) => {
        const waLink = event.recipient_phone
          ? `https://wa.me/${event.recipient_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
              `Happy ${event.category}! Wishing you a wonderful time! 🎉`
            )}`
          : null;

        return (
          <div
            key={event.id}
            className={`border rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-lg ${
              isDarkMode 
                ? 'bg-[#111318] hover:bg-[#141720] border-white/[0.08] hover:border-white/[0.16]' 
                : 'bg-white hover:bg-zinc-50 border-zinc-200 shadow-xs hover:border-zinc-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getCategoryBadge(event.category)}`}>
                  {event.category}
                </span>
                <span className={`text-xs font-mono tabular-nums font-medium ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  {event.original_date}
                </span>
              </div>

              <h3 className={`text-sm font-semibold tracking-tight mb-1.5 ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>
                {event.title}
              </h3>
              {event.description && (
                <p className={`text-xs line-clamp-2 mb-4 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  {event.description}
                </p>
              )}

              <div className={`space-y-2 text-xs pt-3 border-t ${
                isDarkMode ? 'border-white/[0.06] text-zinc-400' : 'border-zinc-200 text-zinc-600'
              }`}>
                <div className="flex items-center justify-between">
                  <span>Reminder</span>
                  <span className={`font-mono font-medium ${isDarkMode ? 'text-zinc-200' : 'text-zinc-700'}`}>
                    {event.reminder_time.slice(0, 5)} ({event.timezone})
                  </span>
                </div>
                {event.recipient_name && (
                  <div className="flex items-center justify-between">
                    <span>Recipient</span>
                    <span className={isDarkMode ? 'text-zinc-200' : 'text-zinc-700'}>{event.recipient_name}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span>Channels</span>
                  <div className="flex items-center gap-1.5">
                    {event.channels.email && <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">Email</span>}
                    {event.channels.whatsapp && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">WA</span>}
                    {event.channels.sms && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">SMS</span>}
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
                    className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 transition-all"
                    title="Send WhatsApp Wish"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={() => onOpenSnooze(event)}
                  className={`p-1.5 rounded-lg border transition-all ${
                    isDarkMode
                      ? 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05] border-transparent hover:border-white/[0.08]'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border-transparent hover:border-zinc-200'
                  }`}
                  title="Snooze"
                >
                  <BellOff className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => generateIcsFile(event)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                  isDarkMode
                    ? 'text-zinc-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.07] border-white/[0.08]'
                    : 'text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 border-zinc-200'
                }`}
              >
                <Download className="w-3 h-3" />
                <span>.ics</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
