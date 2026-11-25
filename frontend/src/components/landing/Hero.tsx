'use client';

import React from 'react';
import { useNow } from '@/hooks/useNow';
import { Reveal } from '@/components/motion/Reveal';
import { Magnetic } from '@/components/motion/Magnetic';
import { NotificationStack } from './NotificationStack';
import { WallClock } from './WallClock';
import { ArrowRight, Compass, ShieldAlert } from 'lucide-react';

interface HeroProps {
  onOpenAddEvent: () => void;
  onOpenDashboard: () => void;
  onOpenAdmin: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenAddEvent,
  onOpenDashboard,
  onOpenAdmin,
}) => {
  const { utcTime, utcSeconds } = useNow();

  // Words for staged entrance
  const headlineWords = ['Never', 'miss', 'a'];

  return (
    <section className="relative pt-12 pb-20 sm:pt-16 sm:pb-28 px-5 sm:px-8 max-w-[1240px] mx-auto overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        
        {/* Left Column: Copy & CTAs */}
        <div className="lg:col-span-7 text-left space-y-6">
          
          {/* Eyebrow Chip */}
          <Reveal i={0}>
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] backdrop-blur-md shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--green)] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--green)]" />
              </span>
              <span className="text-xs font-semibold tracking-wide text-[var(--fg)]">
                Live in 400+ timezones · <span className="font-mono text-[var(--accent-text)]">UTC {utcTime}</span>
              </span>
            </div>
          </Reveal>

          {/* Staged H1 Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-[76px] font-bold tracking-[-0.045em] leading-[1.05] sm:leading-[1.02] text-[var(--fg)]">
            <span className="inline-flex flex-wrap gap-x-2.5 sm:gap-x-3 gap-y-1">
              {headlineWords.map((word, idx) => (
                <Reveal key={word} i={idx + 1} className="inline-block">
                  {word}
                </Reveal>
              ))}
            </span>{' '}
            <Reveal i={4} className="inline-block">
              <span className="font-serif-italic font-normal animate-shimmer text-transparent block sm:inline">
                moment that matters.
              </span>
            </Reveal>
          </h1>

          {/* Sub-Copy */}
          <Reveal i={5}>
            <p className="text-sm sm:text-base lg:text-lg text-[var(--muted)] max-w-xl leading-relaxed">
              Timezone-aware smart event tracking for birthdays, anniversaries, and critical milestones. Automated multi-channel dispatch via Email, WhatsApp & SMS with stateless 1-click snooze.
            </p>
          </Reveal>

          {/* Action CTAs */}
          <Reveal i={6}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
              <Magnetic maxDistance={6}>
                <button
                  onClick={onOpenAddEvent}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#7C3AED] to-[#6366F1] hover:shadow-[0_0_28px_rgba(124,58,237,0.45)] transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Schedule First Event</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </Magnetic>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={onOpenDashboard}
                  className="flex-1 sm:flex-none px-4 sm:px-5 py-3.5 rounded-xl text-sm font-semibold border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-strong)] text-[var(--fg)] hover:text-[var(--accent-text)] shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Compass className="w-4 h-4 text-[var(--accent-text)]" />
                  <span>Open Dashboard</span>
                </button>

                <button
                  onClick={onOpenAdmin}
                  className="px-3.5 sm:px-4 py-3.5 rounded-xl text-xs font-semibold text-[var(--muted)] hover:text-[var(--fg)] transition-colors cursor-pointer text-center"
                >
                  <span>Admin CMS</span>
                </button>
              </div>
            </div>
          </Reveal>

          {/* Mobile Toast Stack & Wall Clock Preview */}
          <div className="lg:hidden pt-4 flex flex-col items-center gap-3 w-full">
            <NotificationStack />
            <WallClock />
          </div>

        </div>

        {/* Right Column: Celestial Orbit & Live Clocks (Desktop >= 1024px) */}
        <div className="hidden lg:flex lg:col-span-5 relative items-center justify-center min-h-[460px]">
          
          {/* 400px Outer Dashed Orbit Ring */}
          <div
            className="absolute w-[400px] h-[400px] rounded-full border border-dashed border-[var(--radar-ring)] animate-spin pointer-events-none"
            style={{ animationDuration: '60s' }}
          />

          {/* 300px Inner Ring with Live Second Hand */}
          <div className="relative w-[300px] h-[300px] rounded-full border border-[var(--radar-ring)] flex items-center justify-center">
            
            {/* Live Second Hand */}
            <div
              className="absolute inset-0 flex items-start justify-center transition-transform duration-200 pointer-events-none"
              style={{
                transform: `rotate(${utcSeconds * 6}deg)`,
                willChange: 'transform',
              }}
            >
              <div
                className="w-1 h-36 rounded-full -mt-2 shadow-sm"
                style={{ backgroundColor: 'var(--clock-hand)' }}
              />
            </div>

            {/* Orbit Center Hub Dot */}
            <div className="w-4 h-4 rounded-full bg-[var(--accent)] ring-4 ring-[var(--bg-glow)] z-10" />

            {/* Notification Stack centered over visual */}
            <div className="absolute z-20 top-8">
              <NotificationStack />
            </div>

            {/* Floating Wall Clock Card */}
            <div className="absolute z-20 -bottom-8">
              <WallClock />
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
