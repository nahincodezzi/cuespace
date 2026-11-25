'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Navbar } from '@/components/Navbar';
import { StatsCards } from '@/components/StatsCards';
import { TimelineView } from '@/components/TimelineView';
import { MasonryGridView } from '@/components/MasonryGridView';
import { SlideOverDrawer } from '@/components/SlideOverDrawer';
import { SnoozeModal } from '@/components/SnoozeModal';
import { ImportModal } from '@/components/ImportModal';
import { AdminPortal } from '@/components/AdminPortal';
import { TimezoneOrbitAnimation } from '@/components/TimezoneOrbitAnimation';
import { LandingPage } from '@/components/LandingPage';
import { SpecialDaysHub } from '@/components/SpecialDaysHub';
import { CommandPalette } from '@/components/CommandPalette';
import { EmailTemplatesModal } from '@/components/EmailTemplatesModal';
import { SmartEvent, EventCreateInput } from '@/types/event';
import { LandingContent, DEFAULT_LANDING_CONTENT } from '@/types/cms';
import { getLandingContent, saveLandingContent } from '@/lib/cmsStorage';
import { fetchEvents, createEventApi, fetchLiveAlerts, clearLiveAlertsApi } from '@/lib/api';
import { LiveAlarmModal, LiveAlertItem } from '@/components/LiveAlarmModal';
import { LayoutGrid, ListFilter, Sparkles, Compass, ShieldAlert, Calendar } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function DashboardPage() {
  const [events, setEvents] = useState<SmartEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline');
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'admin' | 'orbit' | 'special_days'>('landing');
  
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDarkMode = !mounted || resolvedTheme === 'dark';
  const toggleTheme = () => setTheme(isDarkMode ? 'light' : 'dark');
  
  // Landing Page CMS Content State
  const [landingContent, setLandingContent] = useState<LandingContent>(DEFAULT_LANDING_CONTENT);

  // Modals
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [snoozeTarget, setSnoozeTarget] = useState<SmartEvent | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Real-time Live Alarm Modal State & Polling Tracking
  const [activeLiveAlert, setActiveLiveAlert] = useState<LiveAlertItem | null>(null);
  const seenAlertIdsRef = useRef<Set<string>>(new Set());

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Load events and CMS content
  const loadEvents = async () => {
    try {
      const data = await fetchEvents();
      setEvents(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
    setLandingContent(getLandingContent());
  }, []);

  // Autonomous Live Alerts Polling Heartbeat (every 4 seconds)
  useEffect(() => {
    let isSubscribed = true;
    const pollAlerts = async () => {
      try {
        const liveAlerts = await fetchLiveAlerts();
        if (!isSubscribed || !liveAlerts || liveAlerts.length === 0) return;

        // Find alert not yet shown in this session
        const freshAlert = liveAlerts.find((a) => !seenAlertIdsRef.current.has(a.id));
        if (freshAlert) {
          seenAlertIdsRef.current.add(freshAlert.id);
          setActiveLiveAlert(freshAlert);
        }
      } catch (err) {
        // Handled silently
      }
    };

    // Immediate check + repeating timer
    pollAlerts();
    const interval = setInterval(pollAlerts, 4000);
    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputActive = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT');

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      if (isInputActive) return;

      if (e.key.toLowerCase() === 'c' || e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setIsDrawerOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCreateEvent = async (input: EventCreateInput) => {
    const created = await createEventApi(input);
    setEvents((prev) => [created, ...prev]);
    showToast(`"${created.title}" scheduled successfully with timezone awareness!`);
  };

  const handleImportComplete = (imported: SmartEvent[]) => {
    setEvents((prev) => [...imported, ...prev]);
    showToast(`${imported.length} contacts & dates successfully synchronized!`);
  };

  const handleSnoozeSuccess = (eventId: string, hours: number) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? { ...e, snooze_until: new Date(Date.now() + hours * 3600000).toISOString() }
          : e
      )
    );
    showToast(`Reminder postponed for ${hours} hour(s).`);
  };

  // Filtered events
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchesSearch =
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (e.recipient_name && e.recipient_name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = selectedCategory === 'all' || e.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [events, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-transparent text-[var(--fg)] antialiased transition-colors duration-500">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[var(--surface-strong)] border border-[var(--border)] text-[var(--fg)] px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-[var(--accent-text)] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Navbar */}
      <Navbar
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onOpenImport={() => setIsImportOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        totalEvents={events.length}
        searchInputRef={searchInputRef}
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenTemplates={() => setIsTemplatesModalOpen(true)}
      />

      <main>
        {/* VIEW 1: LANDING PAGE (CueSpace Cosmic Landing + The 2 Screenshot Sections) */}
        {currentView === 'landing' && (
          <LandingPage
            content={landingContent}
            events={events}
            isDarkMode={isDarkMode}
            onOpenAddEvent={() => setIsDrawerOpen(true)}
            onOpenDashboard={() => setCurrentView('dashboard')}
            onOpenAdmin={() => setCurrentView('admin')}
          />
        )}

        {/* VIEW 2: TIMEZONE RADAR ORBIT ANIMATION */}
        {currentView === 'orbit' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
            <TimezoneOrbitAnimation events={events} isDarkMode={isDarkMode} />
          </div>
        )}

        {/* VIEW 3: SPECIAL DAYS & OBSERVANCES CALENDAR (Bangladesh + Worldwide) */}
        {currentView === 'special_days' && (
          <SpecialDaysHub
            isDarkMode={isDarkMode}
            showToast={showToast}
            onRefreshEvents={loadEvents}
          />
        )}

        {/* VIEW 3: ADMIN CMS PORTAL */}
        {currentView === 'admin' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
            <AdminPortal
              events={events}
              onRefreshEvents={loadEvents}
              onOpenCreate={() => setIsDrawerOpen(true)}
              isDarkMode={isDarkMode}
              showToast={showToast}
              landingContent={landingContent}
              onUpdateLandingContent={setLandingContent}
              onExit={() => setCurrentView('landing')}
            />
          </div>
        )}

        {/* VIEW 4: SAAS DASHBOARD (Timeline & Masonry Grid) */}
        {currentView === 'dashboard' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
            {/* Metric Summary Cards */}
            <StatsCards events={events} isDarkMode={isDarkMode} />

            {/* View Controls & Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              {/* Category Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {[
                  { id: 'all', label: 'All Dates' },
                  { id: 'birthday', label: '🎂 Birthdays' },
                  { id: 'deadline', label: '🎯 Deadlines' },
                  { id: 'anniversary', label: '💍 Anniversaries' },
                  { id: 'health', label: '🩺 Health' },
                ].map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap border transition-all ${
                        isActive
                          ? 'bg-indigo-600/15 border-indigo-500 text-indigo-500 dark:text-indigo-400 shadow-xs'
                          : isDarkMode
                          ? 'bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]'
                          : 'bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Timeline vs Grid View Toggle */}
              <div className={`flex items-center gap-1 p-1 rounded-xl border self-start sm:self-auto ${
                isDarkMode ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-zinc-100 border-zinc-200'
              }`}>
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    viewMode === 'timeline'
                      ? isDarkMode
                        ? 'bg-white/[0.1] text-white shadow-xs'
                        : 'bg-white text-zinc-900 shadow-xs'
                      : isDarkMode
                      ? 'text-zinc-400 hover:text-zinc-200'
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  <ListFilter className="w-3.5 h-3.5" />
                  <span>Timeline</span>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    viewMode === 'grid'
                      ? isDarkMode
                        ? 'bg-white/[0.1] text-white shadow-xs'
                        : 'bg-white text-zinc-900 shadow-xs'
                      : isDarkMode
                      ? 'text-zinc-400 hover:text-zinc-200'
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Grid View</span>
                </button>
              </div>
            </div>

            {/* Content View */}
            {loading ? (
              <div className="py-24 text-center text-xs text-zinc-500">
                Syncing events with PostgreSQL engine...
              </div>
            ) : viewMode === 'timeline' ? (
              <TimelineView 
                events={filteredEvents} 
                isDarkMode={isDarkMode} 
                onOpenSnooze={setSnoozeTarget}
                onResetCategory={() => setSelectedCategory('all')}
                onOpenDrawer={() => setIsDrawerOpen(true)}
              />
            ) : (
              <MasonryGridView 
                events={filteredEvents} 
                isDarkMode={isDarkMode} 
                onOpenSnooze={setSnoozeTarget}
                onResetCategory={() => setSelectedCategory('all')}
                onOpenDrawer={() => setIsDrawerOpen(true)}
              />
            )}
          </div>
        )}
      </main>

      {/* Slide-over Drawer for Add Event */}
      <SlideOverDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSubmit={handleCreateEvent}
        isDarkMode={isDarkMode}
        onOpenTemplatesModal={() => setIsTemplatesModalOpen(true)}
      />

      {/* Formal Email Templates Manager Dialog */}
      <EmailTemplatesModal
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        isDarkMode={isDarkMode}
        showToast={showToast}
      />

      {/* 1-Click Snooze Dialog */}
      <SnoozeModal
        event={snoozeTarget}
        isOpen={!!snoozeTarget}
        onClose={() => setSnoozeTarget(null)}
        onSnoozeSuccess={handleSnoozeSuccess}
        isDarkMode={isDarkMode}
      />

      {/* Bulk Import Dialog */}
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportComplete={handleImportComplete}
        isDarkMode={isDarkMode}
      />

      {/* Real-time In-Browser Audio-Visual Alarm Modal */}
      {activeLiveAlert && (
        <LiveAlarmModal
          alert={activeLiveAlert}
          onDismiss={() => setActiveLiveAlert(null)}
          onSnooze={(alertId, hours) => {
            handleSnoozeSuccess(alertId, hours);
            setActiveLiveAlert(null);
          }}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Global Raycast/Linear Command Palette (Cmd+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        events={events}
        onSelectEvent={(evt) => {
          setCurrentView('dashboard');
          setSearchQuery(evt.title);
        }}
        onOpenCreate={() => setIsDrawerOpen(true)}
        onNavigate={setCurrentView}
        onToggleTheme={toggleTheme}
        isDarkMode={isDarkMode}
        onOpenTemplates={() => setIsTemplatesModalOpen(true)}
      />
    </div>
  );
}
