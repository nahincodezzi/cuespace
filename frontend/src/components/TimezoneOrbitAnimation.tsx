'use client';

import React, { useState, useEffect } from 'react';
import { Globe, Clock, Sparkles, BellRing, Compass, ShieldCheck } from 'lucide-react';
import { SmartEvent } from '@/types/event';

interface TimezoneOrbitProps {
  events: SmartEvent[];
  isDarkMode: boolean;
}

interface WorldCity {
  city: string;
  tz: string;
  offset: string;
  angle: number; // degrees on orbit
  color: string;
}

export const TimezoneOrbitAnimation: React.FC<TimezoneOrbitProps> = ({ events, isDarkMode }) => {
  const [rotation, setRotation] = useState(0);
  const [selectedCity, setSelectedCity] = useState<string>('Asia/Dhaka');
  const [currentTime, setCurrentTime] = useState<{ [tz: string]: string }>({});

  const CITIES: WorldCity[] = [
    { city: 'Dhaka', tz: 'Asia/Dhaka', offset: '+06:00', angle: 45, color: '#10B981' },
    { city: 'Dubai', tz: 'Asia/Dubai', offset: '+04:00', angle: 105, color: '#F59E0B' },
    { city: 'London', tz: 'Europe/London', offset: '+00:00', angle: 180, color: '#3B82F6' },
    { city: 'New York', tz: 'America/New_York', offset: '-05:00', angle: 250, color: '#EC4899' },
    { city: 'Tokyo', tz: 'Asia/Tokyo', offset: '+09:00', angle: 320, color: '#8B5CF6' },
  ];

  // Rotate radar sweep
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 1.2) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  // Update live clocks
  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      const times: { [tz: string]: string } = {};
      CITIES.forEach((c) => {
        try {
          times[c.tz] = now.toLocaleTimeString('en-US', {
            timeZone: c.tz,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
          });
        } catch {
          times[c.tz] = '--:--:--';
        }
      });
      setCurrentTime(times);
    };

    updateClocks();
    const clockInterval = setInterval(updateClocks, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  const cityEvents = events.filter((e) => e.timezone === selectedCity);

  const containerBg = isDarkMode 
    ? 'bg-[#0E1017] border-white/[0.08]' 
    : 'bg-white border-zinc-200 shadow-sm';
  const textPrimary = isDarkMode ? 'text-zinc-100' : 'text-zinc-950';
  const textMuted = isDarkMode ? 'text-zinc-400' : 'text-zinc-600 font-medium';

  return (
    <div className={`border rounded-3xl p-6 sm:p-8 mb-8 overflow-hidden relative transition-all duration-300 ${containerBg}`}>
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h2 className={`text-base font-semibold tracking-tight ${textPrimary}`}>
              Live Global Timezone Radar & Celestial Clock
            </h2>
          </div>
          <p className={`text-xs mt-1 ${textMuted}`}>
            Autonomous Celery Beat background scheduler scanning all global timezones every 60s
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>UTC Engine Syncing</span>
          </div>
        </div>
      </div>

      {/* Interactive Orbit Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Orbital SVG Radar Canvas */}
        <div className="lg:col-span-7 flex justify-center py-4">
          <div className="relative w-[310px] h-[310px] sm:w-[350px] sm:h-[350px]">
            {/* Outer Orbit Ring */}
            <div className={`absolute inset-0 rounded-full border border-dashed transition-colors ${
              isDarkMode ? 'border-white/[0.12]' : 'border-zinc-300'
            }`} />

            {/* Middle Orbit Ring */}
            <div className={`absolute inset-8 rounded-full border transition-colors ${
              isDarkMode ? 'border-white/[0.08]' : 'border-zinc-200'
            }`} />

            {/* Inner Core Ring */}
            <div className={`absolute inset-20 rounded-full border border-dashed transition-colors ${
              isDarkMode ? 'border-indigo-500/20' : 'border-indigo-500/30'
            }`} />

            {/* Radar Sweeping Beam */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                transform: `rotate(${rotation}deg)`,
                background: 'conic-gradient(from 0deg, rgba(99, 102, 241, 0.25) 0deg, rgba(99, 102, 241, 0) 60deg)',
              }}
            />

            {/* Center Core Node (UTC Origin) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex flex-col items-center justify-center text-white shadow-xl shadow-indigo-600/30 z-20">
              <Compass className="w-5 h-5 animate-pulse" />
              <span className="text-[10px] font-mono font-bold mt-0.5">UTC 00:00</span>
            </div>

            {/* Rotating World Nodes */}
            {CITIES.map((c) => {
              const rad = (c.angle * Math.PI) / 180;
              const radius = 135; // px from center
              const x = 155 + radius * Math.cos(rad);
              const y = 155 + radius * Math.sin(rad);

              const isSelected = selectedCity === c.tz;

              return (
                <button
                  key={c.city}
                  onClick={() => setSelectedCity(c.tz)}
                  style={{ left: `${x}px`, top: `${y}px` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 p-2 rounded-xl border text-center transition-all z-30 group hover:scale-110 active:scale-95 ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/40 ring-4 ring-indigo-500/20'
                      : isDarkMode
                      ? 'bg-[#151822] text-zinc-300 border-white/[0.1] hover:border-indigo-500/50'
                      : 'bg-white text-zinc-800 border-zinc-300 shadow-xs hover:border-indigo-400'
                  }`}
                >
                  <div className="text-[11px] font-semibold tracking-tight">{c.city}</div>
                  <div className={`text-[9px] font-mono ${
                    isSelected ? 'text-indigo-100' : isDarkMode ? 'text-zinc-400' : 'text-zinc-600 font-medium'
                  }`}>
                    {currentTime[c.tz] || '--:--'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Timezone Details & Reminder Feed */}
        <div className="lg:col-span-5 space-y-4">
          <div className={`p-5 rounded-2xl border transition-colors ${
            isDarkMode ? 'bg-white/[0.02] border-white/[0.08]' : 'bg-zinc-50 border-zinc-200'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className={`text-[11px] uppercase tracking-wider font-semibold ${textMuted}`}>
                  Inspecting Timezone
                </span>
                <h3 className={`text-base font-bold tracking-tight ${textPrimary}`}>
                  {selectedCity}
                </h3>
              </div>
              <div className="text-right">
                <div className={`text-base font-mono font-bold text-indigo-500`}>
                  {currentTime[selectedCity] || '12:00:00 PM'}
                </div>
                <div className={`text-[10px] ${textMuted}`}>Active Wall Clock</div>
              </div>
            </div>

            <div className={`text-xs ${textMuted} mb-4`}>
              Events scheduled in this zone are converted to UTC at runtime taking into account local Daylight Saving Time (DST) rules.
            </div>

            {/* List of events in this timezone */}
            <div className="space-y-2">
              <div className={`text-xs font-semibold ${textPrimary}`}>
                Scheduled in this zone ({cityEvents.length})
              </div>

              {cityEvents.length === 0 ? (
                <div className={`text-xs italic p-3 rounded-xl border text-center ${
                  isDarkMode ? 'border-white/[0.06] text-zinc-500' : 'border-zinc-200 text-zinc-400'
                }`}>
                  No events configured for {selectedCity} yet.
                </div>
              ) : (
                cityEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                      isDarkMode ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-white border-zinc-200 shadow-2xs'
                    }`}
                  >
                    <div>
                      <div className={`text-xs font-semibold ${textPrimary}`}>{ev.title}</div>
                      <div className={`text-[10px] ${textMuted}`}>
                        📅 {ev.original_date} &bull; ⏰ {ev.reminder_time.slice(0, 5)}
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {ev.category}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
