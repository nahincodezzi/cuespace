'use client';

import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Globe, BellRing, Clock, Calendar, Check, Compass, Lock, ShieldAlert } from 'lucide-react';
import { LandingContent } from '@/types/cms';
import { SmartEvent } from '@/types/event';
import { StatsCards } from '@/components/StatsCards';
import { TimezoneOrbitAnimation } from '@/components/TimezoneOrbitAnimation';

interface LandingPageProps {
  content: LandingContent;
  events: SmartEvent[];
  isDarkMode: boolean;
  onOpenAddEvent: () => void;
  onOpenDashboard: () => void;
  onOpenAdmin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  content,
  events,
  isDarkMode,
  onOpenAddEvent,
  onOpenDashboard,
  onOpenAdmin,
}) => {
  return (
    <div className="relative overflow-hidden min-h-screen">
      
      {/* Background Cosmic Drift Orbs */}
      <div className="absolute top-[-150px] left-[15%] w-[650px] h-[650px] rounded-full bg-gradient-to-tr from-purple-700/20 via-indigo-600/15 to-transparent blur-[120px] pointer-events-none animate-drift-a" />
      <div className="absolute top-[250px] right-[10%] w-[550px] h-[550px] rounded-full bg-gradient-to-bl from-pink-600/15 via-purple-900/15 to-transparent blur-[110px] pointer-events-none animate-drift-b" />

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        {/* Glowing Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 shadow-xs mb-8 transition-transform hover:scale-105 cursor-pointer">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
          <span className="text-xs font-medium tracking-wide text-zinc-300">
            {content.heroBadge}
          </span>
          <ArrowRight className="w-3 h-3 text-zinc-500" />
        </div>

        {/* Main Headline with Serif Highlight */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-white max-w-4xl mx-auto leading-[1.12] mb-6">
          {content.heroTitlePrefix}{' '}
          <span className="font-serif-italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-100 to-indigo-200 px-1">
            {content.heroHighlight}
          </span>
          {content.heroTitleSuffix}
        </h1>

        {/* Hero Subtitle */}
        <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10 font-normal">
          {content.heroSubtitle}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-16">
          <button
            onClick={onOpenAddEvent}
            className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-xl shadow-indigo-600/25 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span>{content.ctaPrimaryText}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={onOpenDashboard}
            className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-semibold text-zinc-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 transition-all flex items-center justify-center gap-2"
          >
            <Compass className="w-4 h-4 text-indigo-400" />
            <span>Open SaaS Dashboard</span>
          </button>

          <button
            onClick={onOpenAdmin}
            className="w-full sm:w-auto px-4 py-3 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-transparent hover:bg-white/[0.03] border border-transparent hover:border-white/10 transition-all flex items-center justify-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5 text-purple-400" />
            <span>Admin CMS Login</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* SCREENSHOT SECTION 1: The 4 Metric Cards                */}
        {/* ======================================================== */}
        <div className="relative z-10 mb-12 text-left animate-in fade-in duration-500">
          <div className="flex items-center gap-2 mb-4 px-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Live Fleet Metrics
            </span>
          </div>
          <StatsCards events={events} isDarkMode={isDarkMode} />
        </div>

        {/* ======================================================== */}
        {/* SCREENSHOT SECTION 2: Live Global Timezone Radar & Orbit */}
        {/* ======================================================== */}
        <div className="relative z-10 mb-20 text-left animate-in fade-in duration-700">
          <TimezoneOrbitAnimation events={events} isDarkMode={isDarkMode} />
        </div>

        {/* Feature Cards Grid (Editable from Admin CMS) */}
        <div className="relative z-10 text-left mb-24">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-3">
              Precision Architecture for High-Reliability Events
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Built on asynchronous FastAPI queues, Redis Redlock mutex, and PostgreSQL row-level locks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {content.features.map((feat) => (
              <div
                key={feat.id}
                className="group relative rounded-2xl p-6 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.07] hover:border-white/[0.14] transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {feat.tag}
                    </span>
                    <Sparkles className="w-4 h-4 text-zinc-600 group-hover:text-indigo-400 transition-colors" />
                  </div>
                  <h3 className="text-base font-semibold text-zinc-100 mb-2">{feat.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{feat.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-12 pb-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>{content.footerNotice}</p>
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 text-zinc-600 hover:text-zinc-300 transition-colors text-xs font-mono group"
            title="Enterprise CMS & Database Console"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-zinc-600 group-hover:text-purple-400 transition-colors" />
            <span>Admin Console</span>
          </button>
        </footer>

      </section>
    </div>
  );
};
