'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SmartEvent } from '@/types/event';
import { useNow } from '@/hooks/useNow';
import { RadarNode, CityNodeData } from './RadarNode';
import { InspectPanel } from './InspectPanel';
import { Reveal } from '@/components/motion/Reveal';

interface TimezoneRadarProps {
  events: SmartEvent[];
  onOpenAddEvent: () => void;
}

const RADAR_CITIES: CityNodeData[] = [
  { id: 'dhaka', name: 'Dhaka', timezone: 'Asia/Dhaka', angle: 285, radiusPercent: 36 },
  { id: 'dubai', name: 'Dubai', timezone: 'Asia/Dubai', angle: 235, radiusPercent: 42 },
  { id: 'london', name: 'London', timezone: 'Europe/London', angle: 130, radiusPercent: 38 },
  { id: 'newyork', name: 'New York', timezone: 'America/New_York', angle: 185, radiusPercent: 44 },
  { id: 'tokyo', name: 'Tokyo', timezone: 'Asia/Tokyo', angle: 335, radiusPercent: 32 },
];

export const TimezoneRadar: React.FC<TimezoneRadarProps> = ({ events, onOpenAddEvent }) => {
  const { utcTime, formatZone } = useNow();
  const [activeCityId, setActiveCityId] = useState<string>('dhaka');
  const [pingedCityId, setPingedCityId] = useState<string | null>(null);

  const radarRef = useRef<HTMLDivElement>(null);

  // Ping detection when radar sweep beam passes city node angles
  useEffect(() => {
    let animId: number;
    let isVisible = true;

    // IntersectionObserver to only compute when in viewport (§11)
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    if (radarRef.current) observer.observe(radarRef.current);

    let lastBeamAngle = 0;
    const checkSweepPass = () => {
      if (isVisible) {
        // 12s period loop = 360 degrees
        const currentAngle = ((performance.now() % 12000) / 12000) * 360;

        RADAR_CITIES.forEach((city) => {
          // Check if beam crossed this angle in current frame
          if (lastBeamAngle < city.angle && currentAngle >= city.angle) {
            setPingedCityId(city.id);
            setTimeout(() => setPingedCityId((cur) => (cur === city.id ? null : cur)), 600);
          }
        });
        lastBeamAngle = currentAngle;
      }
      animId = requestAnimationFrame(checkSweepPass);
    };

    animId = requestAnimationFrame(checkSweepPass);

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
    };
  }, []);

  const activeNode = RADAR_CITIES.find((c) => c.id === activeCityId) || RADAR_CITIES[0];
  const activeZoneTime = formatZone(activeNode.timezone, true);

  return (
    <section id="timezone-radar" className="py-16 sm:py-24 px-5 sm:px-8 max-w-[1240px] mx-auto">
      
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <Reveal i={0}>
          <span className="text-xs uppercase font-mono font-bold tracking-wider text-[var(--accent-text)] px-3 py-1 rounded-full border border-[var(--border)] bg-[var(--surface)]">
            Celestial Radar
          </span>
        </Reveal>

        <Reveal i={1}>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.035em] text-[var(--fg)] mt-4 mb-3">
            Every zone, scanned{' '}
            <span className="font-serif-italic font-normal animate-shimmer text-transparent">
              every 60 seconds.
            </span>
          </h2>
        </Reveal>

        <Reveal i={2}>
          <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed">
            The radar sweep beam <em>is</em> the scheduler: as it crosses a global timezone, our autonomous engine converts local wall-clocks to UTC and dispatches exact reminders.
          </p>
        </Reveal>
      </div>

      {/* Interactive Radar & Inspection Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left: Radar Visualizer */}
        <div className="lg:col-span-7 flex justify-center">
          <div
            ref={radarRef}
            className="relative w-full max-w-[460px] aspect-square rounded-full border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)] overflow-hidden flex items-center justify-center select-none"
          >
            {/* Concentric Orbit Rings */}
            <div className="absolute w-[85%] h-[85%] rounded-full border border-[var(--radar-ring)] pointer-events-none" />
            <div className="absolute w-[60%] h-[60%] rounded-full border border-[var(--radar-ring)] pointer-events-none" />
            <div className="absolute w-[35%] h-[35%] rounded-full border border-[var(--radar-ring)] pointer-events-none" />

            {/* Sweep Beam (12s matching video period) */}
            <div
              className="absolute inset-0 pointer-events-none animate-radar-sweep opacity-75"
              style={{
                background: `conic-gradient(from 0deg, var(--radar-sweep) 0deg, transparent 75deg, transparent 360deg)`,
              }}
            />

            {/* Center Hub: Live UTC Clock (Bug #1 Fix) */}
            <div className="relative z-20 w-[112px] h-[112px] rounded-[28px] bg-gradient-to-br from-[#7C3AED] to-[#6366F1] shadow-[0_0_35px_rgba(124,58,237,0.5)] flex flex-col items-center justify-center text-white border border-white/20">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-purple-200">
                UTC HUB
              </span>
              <span className="font-mono text-xl font-extrabold tabular-nums tracking-tight text-white mt-0.5">
                {utcTime}
              </span>
              <span className="text-[9px] text-purple-200/80 font-medium mt-0.5">
                Master Clock
              </span>
            </div>

            {/* City Nodes */}
            {RADAR_CITIES.map((city) => (
              <RadarNode
                key={city.id}
                node={city}
                timeString={formatZone(city.timezone, false)}
                isActive={city.id === activeCityId}
                isPinged={city.id === pingedCityId}
                onClick={() => setActiveCityId(city.id)}
              />
            ))}
          </div>
        </div>

        {/* Right: Inspection Details Panel */}
        <div className="lg:col-span-5 h-full">
          <InspectPanel
            zoneName={activeNode.timezone}
            timeString={activeZoneTime}
            events={events}
            onOpenAddEvent={onOpenAddEvent}
          />
        </div>

      </div>

    </section>
  );
};
