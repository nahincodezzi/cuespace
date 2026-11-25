'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Bell, Globe, Sparkles, TrendingUp } from 'lucide-react';
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

  const cardBaseClass = isDarkMode
    ? 'bg-[#0f1118]/80 border-white/[0.08] hover:border-indigo-500/30 hover:bg-[#141722] shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(99,102,241,0.12)]'
    : 'bg-white/95 border-zinc-200/90 shadow-sm hover:border-indigo-300 hover:shadow-md';

  const textMutedClass = isDarkMode ? 'text-zinc-400' : 'text-zinc-500 font-medium';
  const textPrimaryClass = isDarkMode ? 'text-zinc-100' : 'text-zinc-950 font-bold';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
      {/* 1. Total Tracked Events */}
      <div className={`card-lift relative group border rounded-2xl p-3.5 sm:p-5 overflow-hidden backdrop-blur-xl ${cardBaseClass}`}>
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all pointer-events-none" />
        
        <div className="flex items-center justify-between relative z-10 gap-1">
          <span className={`text-[10px] sm:text-xs font-medium tracking-tight ${textMutedClass} truncate`}>Total Tracked</span>
          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-indigo-500/15 to-purple-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform shrink-0">
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-2.5 sm:mt-3.5 flex items-baseline gap-1.5 relative z-10">
          <span className={`text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight ${textPrimaryClass}`}>{total}</span>
          <span className={`text-[10px] sm:text-[11px] font-medium ${textMutedClass} truncate`}>active dates</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-[9px] sm:text-[10px] text-indigo-400 font-medium">
          <TrendingUp className="w-3 h-3 shrink-0" />
          <span className="truncate">Continuous sync</span>
        </div>
      </div>

      {/* 2. Upcoming in 7 Days */}
      <div className={`card-lift relative group border rounded-2xl p-3.5 sm:p-5 overflow-hidden backdrop-blur-xl ${cardBaseClass}`}>
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />

        <div className="flex items-center justify-between relative z-10 gap-1">
          <span className={`text-[10px] sm:text-xs font-medium tracking-tight ${textMutedClass} truncate`}>7-Day Alerts</span>
          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-emerald-500/15 to-teal-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform shrink-0">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-2.5 sm:mt-3.5 flex items-baseline gap-1.5 relative z-10">
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-500 tabular-nums tracking-tight">{upcomingSoon}</span>
          <span className={`text-[10px] sm:text-[11px] font-medium ${textMutedClass} truncate`}>attention queue</span>
        </div>
        <div className="mt-2 flex items-center gap-1 text-[9px] sm:text-[10px] text-emerald-400 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="truncate">Real-time alerts</span>
        </div>
      </div>

      {/* 3. Delivery Channels */}
      <div className={`card-lift relative group border rounded-2xl p-3.5 sm:p-5 overflow-hidden backdrop-blur-xl ${cardBaseClass}`}>
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />

        <div className="flex items-center justify-between relative z-10 gap-1">
          <span className={`text-[10px] sm:text-xs font-medium tracking-tight ${textMutedClass} truncate`}>Channels</span>
          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-amber-500/15 to-orange-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform shrink-0">
            <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-2.5 sm:mt-3.5 flex flex-wrap items-center gap-1 sm:gap-2 relative z-10">
          <span className={`inline-flex items-center gap-1 text-[9.5px] sm:text-xs px-2 py-0.5 rounded-lg border font-semibold ${
            isDarkMode 
              ? 'bg-indigo-500/10 border-indigo-500/25 text-indigo-300' 
              : 'bg-indigo-50 border-indigo-200 text-indigo-700'
          }`}>
            ✉️ <span className="tabular-nums font-bold">{emailCount}</span> Mail
          </span>
          <span className={`inline-flex items-center gap-1 text-[9.5px] sm:text-xs px-2 py-0.5 rounded-lg border font-semibold ${
            isDarkMode 
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300' 
              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}>
            💬 <span className="tabular-nums font-bold">{whatsappCount}</span> WA
          </span>
        </div>
        <div className="mt-2 text-[9px] sm:text-[10px] text-zinc-400 font-medium truncate">
          <span>SMTP & WA live</span>
        </div>
      </div>

      {/* 4. Timezone Engine Status */}
      <div className={`card-lift relative group border rounded-2xl p-3.5 sm:p-5 overflow-hidden backdrop-blur-xl ${cardBaseClass}`}>
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all pointer-events-none" />

        <div className="flex items-center justify-between relative z-10 gap-1">
          <span className={`text-[10px] sm:text-xs font-medium tracking-tight ${textMutedClass} truncate`}>Timezones</span>
          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-purple-500/15 to-violet-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform shrink-0">
            <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-2.5 sm:mt-3.5 flex items-center gap-1.5 relative z-10">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className={`text-xs sm:text-sm font-bold tracking-tight ${textPrimaryClass} truncate`}>+400 UTC Active</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[9px] sm:text-[10px] text-zinc-400 font-mono">
          <span>&plusmn;10s loop</span>
          <span className="text-purple-400 font-medium">Leap-safe</span>
        </div>
      </div>
    </div>
  );
};
