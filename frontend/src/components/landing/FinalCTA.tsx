'use client';

import React from 'react';
import { Reveal } from '@/components/motion/Reveal';
import { Magnetic } from '@/components/motion/Magnetic';
import { ArrowRight, Sparkles } from 'lucide-react';

interface FinalCTAProps {
  onOpenAddEvent: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onOpenAddEvent }) => {
  return (
    <section className="py-16 sm:py-24 px-5 sm:px-8 max-w-[1240px] mx-auto">
      <Reveal i={0}>
        <div
          className="relative rounded-[28px] border border-[var(--border)] p-8 sm:p-14 text-center overflow-hidden shadow-[var(--shadow)]"
          style={{
            backgroundColor: 'var(--surface-strong)',
            backgroundImage: `radial-gradient(600px 300px at 50% 0%, var(--bg-glow), transparent 70%)`,
          }}
        >
          {/* Decorative Sparkle Accent */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border)] bg-[var(--surface)] text-xs font-semibold text-[var(--accent-text)] mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Celestial Scheduler</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.035em] text-[var(--fg)] max-w-2xl mx-auto leading-tight mb-4">
            The next moment is{' '}
            <span className="font-serif-italic font-normal animate-shimmer text-transparent block sm:inline">
              already ticking.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-[var(--muted)] max-w-xl mx-auto mb-8 leading-relaxed">
            Never miss a friend&apos;s birthday, client milestone, or national observance again. Schedule in seconds with timezone awareness and instant 1-click delivery.
          </p>

          <Magnetic maxDistance={6}>
            <button
              onClick={onOpenAddEvent}
              className="px-7 py-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#7C3AED] to-[#6366F1] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] transition-all flex items-center gap-2.5 mx-auto group cursor-pointer"
            >
              <span>Schedule Your First Event</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </Magnetic>
        </div>
      </Reveal>
    </section>
  );
};
