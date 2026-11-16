'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { AdminPortal } from '@/components/AdminPortal';
import { SmartEvent } from '@/types/event';
import { LandingContent, DEFAULT_LANDING_CONTENT } from '@/types/cms';
import { fetchEvents } from '@/lib/api';
import { getLandingContent, saveLandingContent } from '@/lib/cmsStorage';

export default function AdminPage() {
  const [events, setEvents] = useState<SmartEvent[]>([]);
  const [landingContent, setLandingContent] = useState<LandingContent>(DEFAULT_LANDING_CONTENT);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    try {
      const liveEvents = await fetchEvents();
      setEvents(liveEvents);
    } catch {
      // Graceful fallback
    }
    const storedCms = getLandingContent();
    setLandingContent(storedCms);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-[#08080d] text-zinc-100 flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#161922] border border-purple-500/40 text-purple-200 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-medium animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Dedicated Header */}
      <header className="border-b border-white/[0.08] bg-[#0c0d14]/90 backdrop-blur-xl px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link 
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to CueSpace App</span>
          </Link>
          <div className="h-4 w-[1px] bg-white/10" />
          <span className="text-xs font-mono text-purple-400 font-medium">Enterprise Admin Console</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            System Secure
          </span>
        </div>
      </header>

      {/* Main Admin View */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <AdminPortal
          events={events}
          onRefreshEvents={loadData}
          onOpenCreate={() => {}}
          isDarkMode={true}
          showToast={showToast}
          landingContent={landingContent}
          onUpdateLandingContent={(newContent) => {
            setLandingContent(newContent);
            saveLandingContent(newContent);
          }}
        />
      </main>
    </div>
  );
}
