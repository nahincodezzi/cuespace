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
        <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full shadow-xs mb-8 transition-transform hover:scale-105 cursor-pointer ${
          isDarkMode 
            ? 'bg-white/[0.04] border border-white/10 text-zinc-300' 
            : 'bg-purple-50 border border-purple-200 text-purple-700 shadow-xs'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full animate-ping ${isDarkMode ? 'bg-indigo-400' : 'bg-purple-600'}`} />
          <span className={`text-xs font-semibold tracking-wide ${isDarkMode ? 'text-zinc-300' : 'text-purple-900'}`}>
            {content.heroBadge}
          </span>
          <ArrowRight className={`w-3 h-3 ${isDarkMode ? 'text-zinc-500' : 'text-purple-600'}`} />
        </div>

        {/* Main Headline with Serif Highlight */}
        <h1 className={`text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight max-w-4xl mx-auto leading-[1.12] mb-6 ${
          isDarkMode ? 'text-white' : 'text-zinc-950'
        }`}>
          {content.heroTitlePrefix}{' '}
          <span className={`font-serif-italic font-normal text-transparent bg-clip-text px-1 ${
            isDarkMode 
              ? 'bg-gradient-to-r from-purple-200 via-pink-100 to-indigo-200' 
              : 'bg-gradient-to-r from-purple-700 via-pink-600 to-indigo-700 font-medium'
          }`}>
            {content.heroHighlight}
          </span>
          {content.heroTitleSuffix}
        </h1>

        {/* Hero Subtitle */}
        <p className={`text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-10 ${
          isDarkMode ? 'text-zinc-400 font-normal' : 'text-zinc-600 font-medium'
        }`}>
          {content.heroSubtitle}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-16">
          <button
            onClick={onOpenAddEvent}
            className="btn-press w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 group"
          >
            <span>{content.ctaPrimaryText}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
          
          <button
            onClick={onOpenDashboard}
            className={`btn-press w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              isDarkMode
                ? 'text-zinc-200 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 shadow-sm'
                : 'text-zinc-800 hover:text-zinc-950 bg-white hover:bg-zinc-50 border border-zinc-300 shadow-sm'
            }`}
          >
            <Compass className={`w-4 h-4 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
            <span>Open SaaS Dashboard</span>
          </button>

          <button
            onClick={onOpenAdmin}
            className={`btn-press w-full sm:w-auto px-4 py-3.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              isDarkMode
                ? 'text-zinc-400 hover:text-zinc-200 bg-transparent hover:bg-white/[0.04] border border-transparent hover:border-white/10'
                : 'text-zinc-700 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200/80 border border-zinc-200'
            }`}
          >
            <Lock className={`w-3.5 h-3.5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            <span>Admin CMS Login</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* SCREENSHOT SECTION 1: The 4 Metric Cards                */}
        {/* ======================================================== */}
        <div className="relative z-10 mb-12 text-left animate-in fade-in duration-500">
          <div className="flex items-center gap-2 mb-4 px-1">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${
              isDarkMode ? 'text-zinc-500' : 'text-zinc-700'
            }`}>
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
            <h2 className={`text-2xl sm:text-3xl font-semibold tracking-tight mb-3 ${
              isDarkMode ? 'text-white' : 'text-zinc-950 font-bold'
            }`}>
              Precision Architecture for High-Reliability Events
            </h2>
            <p className={`text-xs sm:text-sm ${
              isDarkMode ? 'text-zinc-400' : 'text-zinc-600 font-medium'
            }`}>
              Built on asynchronous FastAPI queues, Redis Redlock mutex, and PostgreSQL row-level locks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {content.features.map((feat) => (
              <div
                key={feat.id}
                className={`card-lift group relative rounded-2xl p-6 border flex flex-col justify-between backdrop-blur-xl ${
                  isDarkMode
                    ? 'bg-[#0f1118]/80 hover:bg-[#141722] border-white/[0.08] hover:border-indigo-500/30 shadow-[0_4px_25px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_35px_rgba(99,102,241,0.12)]'
                    : 'bg-white hover:bg-zinc-50/90 border-zinc-200/90 hover:border-indigo-300 shadow-sm hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      isDarkMode
                        ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200/80'
                    }`}>
                      {feat.tag}
                    </span>
                    <Sparkles className={`w-4 h-4 transition-colors ${
                      isDarkMode 
                        ? 'text-zinc-600 group-hover:text-indigo-400' 
                        : 'text-zinc-400 group-hover:text-indigo-600'
                    }`} />
                  </div>
                  <h3 className={`text-base font-semibold mb-2 ${
                    isDarkMode ? 'text-zinc-100' : 'text-zinc-900 font-bold'
                  }`}>{feat.title}</h3>
                  <p className={`text-xs leading-relaxed ${
                    isDarkMode ? 'text-zinc-400' : 'text-zinc-600 font-normal'
                  }`}>{feat.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className={`pt-12 pb-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs ${
          isDarkMode 
            ? 'border-white/[0.06] text-zinc-500' 
            : 'border-zinc-200 text-zinc-600 font-medium'
        }`}>
          <p>{content.footerNotice}</p>
          <button
            onClick={onOpenAdmin}
            className={`flex items-center gap-1.5 transition-colors text-xs font-mono group ${
              isDarkMode ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-600 hover:text-zinc-950 font-semibold'
            }`}
            title="Enterprise CMS & Database Console"
          >
            <ShieldAlert className={`w-3.5 h-3.5 transition-colors ${
              isDarkMode ? 'text-zinc-600 group-hover:text-purple-400' : 'text-zinc-500 group-hover:text-purple-600'
            }`} />
            <span>Admin Console</span>
          </button>
        </footer>

      </section>
    </div>
  );
};
