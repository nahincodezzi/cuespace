'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Bell, Globe, Sparkles } from 'lucide-react';
import { SmartEvent } from '@/types/event';

interface StatsCardsProps {
  events: SmartEvent[];
  isDarkMode: boolean;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ events, isDarkMode }) => {
  const total = events.length;
  const [upcomingSoon, setUpcomingSoon] = useState(0);

  useEffect(() => {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    const count = events.filter((ev) => {
      if (!ev.next_trigger_at) return false;
      const trigger = new Date(ev.next_trigger_at);
      return trigger >= now && trigger <= nextWeek;
    }).length;

    setUpcomingSoon(count);
  }, [events]);

  const emailCount = events.filter((e) => e.channels.email).length;
  const whatsappCount = events.filter((e) => e.channels.whatsapp).length;

  const cardClass = isDarkMode
    ? 'bg-[#111318] border-white/[0.08] hover:border-white/[0.14]'
    : 'bg-white border-zinc-200/90 shadow-xs hover:border-zinc-300';

  const textMutedClass = isDarkMode ? 'text-zinc-400' : 'text-zinc-500';
  const textPrimaryClass = isDarkMode ? 'text-zinc-100' : 'text-zinc-900';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total Events */}
      <div className={`border rounded-2xl p-5 transition-all hover:scale-[1.01] ${cardClass}`}>
        <div className="flex items-center justify-between">
          <span className={`text-xs font-medium ${textMutedClass}`}>Total Tracked Dates</span>
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 dark:text-indigo-400">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3.5 flex items-baseline gap-2">
          <span className={`text-2xl font-bold tabular-nums tracking-tight ${textPrimaryClass}`}>{total}</span>
          <span className={`text-[11px] ${textMutedClass}`}>active special dates</span>
        </div>
      </div>

      {/* Upcoming in 7 Days */}
      <div className={`border rounded-2xl p-5 transition-all hover:scale-[1.01] ${cardClass}`}>
        <div className="flex items-center justify-between">
          <span className={`text-xs font-medium ${textMutedClass}`}>Next 7 Days Alerts</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3.5 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-emerald-500 tabular-nums tracking-tight">{upcomingSoon}</span>
          <span className={`text-[11px] ${textMutedClass}`}>requiring attention</span>
        </div>
      </div>

      {/* Delivery Channels */}
      <div className={`border rounded-2xl p-5 transition-all hover:scale-[1.01] ${cardClass}`}>
        <div className="flex items-center justify-between">
          <span className={`text-xs font-medium ${textMutedClass}`}>Active Channels</span>
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Bell className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3.5 flex items-center gap-3">
          <span className={`text-xs font-medium ${textPrimaryClass}`}>
            ✉️ <span className="tabular-nums font-semibold">{emailCount}</span> Email
          </span>
          <span className={`text-xs font-medium ${textPrimaryClass}`}>
            💬 <span className="tabular-nums font-semibold">{whatsappCount}</span> WA
          </span>
        </div>
      </div>

      {/* Timezone Engine */}
      <div className={`border rounded-2xl p-5 transition-all hover:scale-[1.01] ${cardClass}`}>
        <div className="flex items-center justify-between">
          <span className={`text-xs font-medium ${textMutedClass}`}>Timezone Engine</span>
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 dark:text-purple-400">
            <Globe className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3.5 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className={`text-xs font-medium ${textPrimaryClass}`}>UTC Sync Active</span>
          <span className={`text-[10px] ${textMutedClass}`}>(&plusmn;60s cron)</span>
        </div>
      </div>
    </div>
  );
};
