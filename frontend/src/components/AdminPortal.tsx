'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Send, Clock, Shield, Database, 
  Search, CheckCircle2, AlertTriangle, ArrowUpDown, RefreshCw, X, Lock, LogOut, LayoutTemplate, Sparkles, Check
} from 'lucide-react';
import { SmartEvent, EventCreateInput } from '@/types/event';
import { LandingContent, FeatureItem } from '@/types/cms';
import { saveLandingContent } from '@/lib/cmsStorage';
import { updateEventApi, deleteEventApi, dispatchNowApi, fetchAuditLogs, AuditLog } from '@/lib/api';

interface AdminPortalProps {
  events: SmartEvent[];
  onRefreshEvents: () => void;
  onOpenCreate: () => void;
  isDarkMode: boolean;
  showToast: (msg: string) => void;
  landingContent: LandingContent;
  onUpdateLandingContent: (newContent: LandingContent) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  events,
  onRefreshEvents,
  onOpenCreate,
  isDarkMode,
  showToast,
  landingContent,
  onUpdateLandingContent,
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // default logged in for convenience, with logout/login toggle
  const [loginEmail, setLoginEmail] = useState('admin@cuespace.app');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [loginError, setLoginError] = useState('');

  // Admin Navigation Tabs: 'landing_cms' | 'events' | 'logs'
  const [activeTab, setActiveTab] = useState<'landing_cms' | 'events' | 'logs'>('landing_cms');
  
  // Events CRUD state
  const [search, setSearch] = useState('');
  const [editingEvent, setEditingEvent] = useState<SmartEvent | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  
  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Landing Page CMS Form State
  const [cmsForm, setCmsForm] = useState<LandingContent>(landingContent);
  const [editingFeature, setEditingFeature] = useState<FeatureItem | null>(null);
  const [isCreatingFeature, setIsCreatingFeature] = useState(false);
  const [newFeature, setNewFeature] = useState<FeatureItem>({
    id: '',
    title: '',
    description: '',
    tag: 'Feature',
    iconName: 'Sparkles'
  });

  useEffect(() => {
    setCmsForm(landingContent);
  }, [landingContent]);

  useEffect(() => {
    if (activeTab === 'logs') loadLogs();
  }, [activeTab]);

  const loadLogs = async () => {
    setLoadingLogs(true);
    try {
      const logs = await fetchAuditLogs();
      setAuditLogs(logs);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail === 'admin@cuespace.app' && loginPassword === 'admin123') {
      setIsAuthenticated(true);
      setLoginError('');
      showToast('Logged in to Admin CMS successfully!');
    } else {
      setLoginError('Invalid admin credentials. Use admin@cuespace.app / admin123');
    }
  };

  // Save Landing Page CMS text
  const handleSaveLandingCMS = (e: React.FormEvent) => {
    e.preventDefault();
    saveLandingContent(cmsForm);
    onUpdateLandingContent(cmsForm);
    showToast('Landing Page contents updated live!');
  };

  // Feature Card CRUD in CMS
  const handleSaveNewFeature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeature.title) return;
    const item: FeatureItem = {
      ...newFeature,
      id: 'feat-' + Date.now()
    };
    const updated = {
      ...cmsForm,
      features: [...cmsForm.features, item]
    };
    setCmsForm(updated);
    saveLandingContent(updated);
    onUpdateLandingContent(updated);
    setIsCreatingFeature(false);
    setNewFeature({ id: '', title: '', description: '', tag: 'Feature', iconName: 'Sparkles' });
    showToast('New feature card inserted to landing page!');
  };

  const handleSaveEditFeature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFeature) return;
    const updatedFeatures = cmsForm.features.map(f => f.id === editingFeature.id ? editingFeature : f);
    const updated = { ...cmsForm, features: updatedFeatures };
    setCmsForm(updated);
    saveLandingContent(updated);
    onUpdateLandingContent(updated);
    setEditingFeature(null);
    showToast('Feature card updated successfully!');
  };

  const handleDeleteFeature = (id: string) => {
    if (!confirm('Are you sure you want to remove this feature card from landing page?')) return;
    const updatedFeatures = cmsForm.features.filter(f => f.id !== id);
    const updated = { ...cmsForm, features: updatedFeatures };
    setCmsForm(updated);
    saveLandingContent(updated);
    onUpdateLandingContent(updated);
    showToast('Feature card deleted.');
  };

  // Event CRUD
  const handleDeleteEvent = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete '${title}'?`)) return;
    setIsDeletingId(id);
    try {
      await deleteEventApi(id);
      showToast(`Event '${title}' deleted.`);
      onRefreshEvents();
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleDispatchNow = async (id: string, title: string) => {
    const res = await dispatchNowApi(id);
    showToast(res.message);
    if (activeTab === 'logs') loadLogs();
  };

  const handleSaveEditEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    try {
      await updateEventApi(editingEvent.id, {
        title: editingEvent.title,
        description: editingEvent.description,
        category: editingEvent.category,
        original_date: editingEvent.original_date,
        reminder_time: editingEvent.reminder_time,
        timezone: editingEvent.timezone,
        calendar_type: editingEvent.calendar_type,
        leap_year_handling: editingEvent.leap_year_handling,
        recurrence_type: editingEvent.recurrence_type,
        recurrence_interval: editingEvent.recurrence_interval,
        channels: editingEvent.channels,
        alert_lead_days: editingEvent.alert_lead_days,
        recipient_name: editingEvent.recipient_name,
        recipient_phone: editingEvent.recipient_phone,
        recipient_email: editingEvent.recipient_email,
      });
      showToast(`Event '${editingEvent.title}' updated.`);
      setEditingEvent(null);
      onRefreshEvents();
    } catch {
      showToast('Failed to update event.');
    }
  };

  const containerBg = isDarkMode ? 'bg-[#0E1017] border-white/[0.08]' : 'bg-white border-zinc-200 shadow-sm';
  const textPrimary = isDarkMode ? 'text-zinc-100' : 'text-zinc-900';
  const textMuted = isDarkMode ? 'text-zinc-400' : 'text-zinc-500';
  const inputBg = isDarkMode ? 'bg-white/[0.04] border-white/[0.08] text-zinc-100' : 'bg-zinc-50 border-zinc-200 text-zinc-900';

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className={`border rounded-3xl p-8 max-w-md mx-auto my-12 ${containerBg}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className={`text-base font-bold ${textPrimary}`}>Admin Portal Login</h2>
            <p className={`text-xs ${textMuted}`}>Enter credentials to manage CMS & database</p>
          </div>
        </div>

        {loginError && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
            {loginError}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${textMuted}`}>Email</label>
            <input
              type="email"
              required
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className={`w-full rounded-xl px-3.5 py-2.5 text-xs border ${inputBg}`}
            />
          </div>
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${textMuted}`}>Password</label>
            <input
              type="password"
              required
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className={`w-full rounded-xl px-3.5 py-2.5 text-xs border ${inputBg}`}
            />
          </div>

          <div className={`p-2.5 rounded-lg text-[11px] ${textMuted} bg-white/[0.02] border border-white/[0.05]`}>
            Demo credentials: <strong className="text-indigo-400">admin@cuespace.app</strong> / <strong className="text-indigo-400">admin123</strong>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/30"
          >
            Authenticate & Access CMS
          </button>
        </form>
      </div>
    );
  }

  // AUTHENTICATED ADMIN PORTAL
  return (
    <div className={`border rounded-3xl p-6 sm:p-8 mb-8 transition-all ${containerBg}`}>
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h2 className={`text-base font-bold tracking-tight ${textPrimary}`}>
              Enterprise Admin CMS & Content Manager
            </h2>
          </div>
          <p className={`text-xs mt-1 ${textMuted}`}>
            Full control over Landing Page text, Feature Cards, Events Database & Audit Logs
          </p>
        </div>

        {/* Tab Controls & Sign Out */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className={`flex items-center p-1 rounded-xl border ${
            isDarkMode ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-zinc-100 border-zinc-200'
          }`}>
            <button
              onClick={() => setActiveTab('landing_cms')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'landing_cms'
                  ? isDarkMode ? 'bg-white/[0.1] text-white shadow-xs' : 'bg-white text-zinc-900 shadow-xs'
                  : textMuted
              }`}
            >
              <LayoutTemplate className="w-3.5 h-3.5 text-indigo-400" />
              <span>Landing Page CMS</span>
            </button>

            <button
              onClick={() => setActiveTab('events')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'events'
                  ? isDarkMode ? 'bg-white/[0.1] text-white shadow-xs' : 'bg-white text-zinc-900 shadow-xs'
                  : textMuted
              }`}
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Events CRUD ({events.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'logs'
                  ? isDarkMode ? 'bg-white/[0.1] text-white shadow-xs' : 'bg-white text-zinc-900 shadow-xs'
                  : textMuted
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Audit Logs</span>
            </button>
          </div>

          <button
            onClick={() => setIsAuthenticated(false)}
            className={`p-2 rounded-xl border text-xs text-zinc-400 hover:text-rose-400 transition-all ${
              isDarkMode ? 'border-white/[0.08] hover:bg-white/[0.05]' : 'border-zinc-200 hover:bg-zinc-100'
            }`}
            title="Sign Out Admin"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================================== */}
      {/* TAB 1: LANDING PAGE CMS EDITOR                            */}
      {/* ========================================================== */}
      {activeTab === 'landing_cms' && (
        <div className="mt-6 space-y-8 animate-in fade-in">
          {/* Section 1: Hero & Text Customization */}
          <form onSubmit={handleSaveLandingCMS} className={`p-6 rounded-2xl border ${
            isDarkMode ? 'bg-white/[0.02] border-white/[0.07]' : 'bg-zinc-50 border-zinc-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-sm font-bold ${textPrimary}`}>Landing Hero Text & Headlines</h3>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Text Updates</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={`block text-xs font-medium mb-1 ${textMuted}`}>Pill Badge Text</label>
                <input
                  type="text"
                  value={cmsForm.heroBadge}
                  onChange={(e) => setCmsForm({ ...cmsForm, heroBadge: e.target.value })}
                  className={`w-full rounded-xl px-3 py-2 text-xs border ${inputBg}`}
                />
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1 ${textMuted}`}>Primary CTA Button</label>
                <input
                  type="text"
                  value={cmsForm.ctaPrimaryText}
                  onChange={(e) => setCmsForm({ ...cmsForm, ctaPrimaryText: e.target.value })}
                  className={`w-full rounded-xl px-3 py-2 text-xs border ${inputBg}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className={`block text-xs font-medium mb-1 ${textMuted}`}>Title Prefix</label>
                <input
                  type="text"
                  value={cmsForm.heroTitlePrefix}
                  onChange={(e) => setCmsForm({ ...cmsForm, heroTitlePrefix: e.target.value })}
                  className={`w-full rounded-xl px-3 py-2 text-xs border ${inputBg}`}
                />
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1 ${textMuted}`}>Italic Highlight (Instrument Serif)</label>
                <input
                  type="text"
                  value={cmsForm.heroHighlight}
                  onChange={(e) => setCmsForm({ ...cmsForm, heroHighlight: e.target.value })}
                  className={`w-full rounded-xl px-3 py-2 text-xs border ${inputBg}`}
                />
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1 ${textMuted}`}>Title Suffix</label>
                <input
                  type="text"
                  value={cmsForm.heroTitleSuffix}
                  onChange={(e) => setCmsForm({ ...cmsForm, heroTitleSuffix: e.target.value })}
                  className={`w-full rounded-xl px-3 py-2 text-xs border ${inputBg}`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-medium mb-1 ${textMuted}`}>Hero Subtitle</label>
              <textarea
                rows={2}
                value={cmsForm.heroSubtitle}
                onChange={(e) => setCmsForm({ ...cmsForm, heroSubtitle: e.target.value })}
                className={`w-full rounded-xl px-3 py-2 text-xs border ${inputBg}`}
              />
            </div>
          </form>

          {/* Section 2: Features Cards Manager (Insert, Update, Delete) */}
          <div className={`p-6 rounded-2xl border ${
            isDarkMode ? 'bg-white/[0.02] border-white/[0.07]' : 'bg-zinc-50 border-zinc-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`text-sm font-bold ${textPrimary}`}>Landing Feature Cards</h3>
                <p className={`text-xs ${textMuted}`}>Insert, edit or remove cards shown on the landing page</p>
              </div>
              <button
                onClick={() => setIsCreatingFeature(true)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Insert Feature</span>
              </button>
            </div>

            {/* List of features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {cmsForm.features.map((feat) => (
                <div
                  key={feat.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between ${
                    isDarkMode ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-white border-zinc-200 shadow-2xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {feat.tag}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingFeature(feat)}
                          className="p-1 rounded text-indigo-400 hover:bg-indigo-500/10"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteFeature(feat.id)}
                          className="p-1 rounded text-rose-400 hover:bg-rose-500/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className={`text-xs font-semibold mb-1 ${textPrimary}`}>{feat.title}</div>
                    <div className={`text-[11px] leading-relaxed ${textMuted}`}>{feat.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 2: EVENTS CRUD DATABASE TABLE                          */}
      {/* ========================================================== */}
      {activeTab === 'events' && (
        <div className="mt-6 animate-in fade-in">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="relative w-full max-w-xs">
              <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`} />
              <input
                type="text"
                placeholder="Search events rows..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none border ${inputBg}`}
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onRefreshEvents}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border ${
                  isDarkMode ? 'border-white/[0.08] text-zinc-300' : 'border-zinc-200 text-zinc-700'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
              <button
                onClick={onOpenCreate}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Insert Event</span>
              </button>
            </div>
          </div>

          <div className={`overflow-x-auto rounded-2xl border ${isDarkMode ? 'border-white/[0.08]' : 'border-zinc-200'}`}>
            <table className="w-full text-left text-xs">
              <thead className={`border-b font-semibold uppercase tracking-wider ${
                isDarkMode ? 'bg-white/[0.02] border-white/[0.08] text-zinc-400' : 'bg-zinc-50 border-zinc-200 text-zinc-500'
              }`}>
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Date & Time</th>
                  <th className="px-4 py-3">Timezone</th>
                  <th className="px-4 py-3">Channels</th>
                  <th className="px-4 py-3 text-right">Actions (CRUD)</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-white/[0.06]' : 'divide-zinc-200'}`}>
                {events.filter(e => e.title.toLowerCase().includes(search.toLowerCase())).map((ev) => (
                  <tr key={ev.id} className={isDarkMode ? 'hover:bg-white/[0.02]' : 'hover:bg-zinc-50'}>
                    <td className="px-4 py-3.5">
                      <div className={`font-semibold ${textPrimary}`}>{ev.title}</div>
                      {ev.description && <div className={`text-[11px] truncate max-w-xs ${textMuted}`}>{ev.description}</div>}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {ev.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono">
                      <div className={textPrimary}>{ev.original_date}</div>
                      <div className={`text-[10px] ${textMuted}`}>{ev.reminder_time.slice(0, 5)}</div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[10px] text-zinc-400">{ev.timezone}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        {ev.channels.email && <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-400 font-medium">Email</span>}
                        {ev.channels.whatsapp && <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-medium">WA</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleDispatchNow(ev.id, ev.title)}
                          className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10"
                          title="Trigger Immediate Dispatch Test"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingEvent(ev)}
                          className="p-1.5 rounded-lg text-indigo-400 hover:bg-indigo-500/10"
                          title="Edit Event"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(ev.id, ev.title)}
                          disabled={isDeletingId === ev.id}
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10"
                          title="Delete Event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 3: NOTIFICATION AUDIT LOGS                             */}
      {/* ========================================================== */}
      {activeTab === 'logs' && (
        <div className="mt-6 animate-in fade-in">
          <div className="flex items-center justify-between mb-4">
            <span className={`text-xs ${textMuted}`}>Showing multi-channel notification dispatch records</span>
            <button
              onClick={loadLogs}
              disabled={loadingLogs}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border ${
                isDarkMode ? 'border-white/[0.08] text-zinc-300' : 'border-zinc-200 text-zinc-700'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin' : ''}`} />
              <span>Refresh Logs</span>
            </button>
          </div>

          <div className={`overflow-x-auto rounded-2xl border ${isDarkMode ? 'border-white/[0.08]' : 'border-zinc-200'}`}>
            <table className="w-full text-left text-xs">
              <thead className={`border-b font-semibold uppercase tracking-wider ${
                isDarkMode ? 'bg-white/[0.02] border-white/[0.08] text-zinc-400' : 'bg-zinc-50 border-zinc-200 text-zinc-500'
              }`}>
                <tr>
                  <th className="px-4 py-3">Channel</th>
                  <th className="px-4 py-3">Recipient</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Dispatched Time</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-white/[0.06]' : 'divide-zinc-200'}`}>
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-4 py-3 font-semibold text-indigo-400">{log.channel}</td>
                    <td className="px-4 py-3 font-mono">{log.recipient}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        log.status === 'DELIVERED' 
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className={`px-4 py-3 font-mono text-[11px] ${textMuted}`}>
                      {log.sent_at || log.created_at || 'Just now'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Insert Feature Card */}
      {isCreatingFeature && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`relative w-full max-w-md border rounded-2xl p-6 shadow-2xl ${
            isDarkMode ? 'bg-[#111318] border-white/[0.1]' : 'bg-white border-zinc-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-base font-bold ${textPrimary}`}>Insert Feature Card</h3>
              <button onClick={() => setIsCreatingFeature(false)} className={textMuted}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewFeature} className="space-y-4">
              <div>
                <label className={`block text-xs font-medium mb-1 ${textMuted}`}>Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Real-Time SMS Sync"
                  value={newFeature.title}
                  onChange={(e) => setNewFeature({ ...newFeature, title: e.target.value })}
                  className={`w-full rounded-xl px-3 py-2 text-xs border ${inputBg}`}
                />
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1 ${textMuted}`}>Badge Tag</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Instant Delivery"
                  value={newFeature.tag}
                  onChange={(e) => setNewFeature({ ...newFeature, tag: e.target.value })}
                  className={`w-full rounded-xl px-3 py-2 text-xs border ${inputBg}`}
                />
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1 ${textMuted}`}>Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Briefly describe what this feature offers..."
                  value={newFeature.description}
                  onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                  className={`w-full rounded-xl px-3 py-2 text-xs border ${inputBg}`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsCreatingFeature(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${textMuted}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500"
                >
                  Insert Feature
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Feature Card */}
      {editingFeature && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`relative w-full max-w-md border rounded-2xl p-6 shadow-2xl ${
            isDarkMode ? 'bg-[#111318] border-white/[0.1]' : 'bg-white border-zinc-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-base font-bold ${textPrimary}`}>Edit Feature Card</h3>
              <button onClick={() => setEditingFeature(null)} className={textMuted}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditFeature} className="space-y-4">
              <div>
                <label className={`block text-xs font-medium mb-1 ${textMuted}`}>Title</label>
                <input
                  type="text"
                  required
                  value={editingFeature.title}
                  onChange={(e) => setEditingFeature({ ...editingFeature, title: e.target.value })}
                  className={`w-full rounded-xl px-3 py-2 text-xs border ${inputBg}`}
                />
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1 ${textMuted}`}>Badge Tag</label>
                <input
                  type="text"
                  required
                  value={editingFeature.tag}
                  onChange={(e) => setEditingFeature({ ...editingFeature, tag: e.target.value })}
                  className={`w-full rounded-xl px-3 py-2 text-xs border ${inputBg}`}
                />
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1 ${textMuted}`}>Description</label>
                <textarea
                  rows={3}
                  required
                  value={editingFeature.description}
                  onChange={(e) => setEditingFeature({ ...editingFeature, description: e.target.value })}
                  className={`w-full rounded-xl px-3 py-2 text-xs border ${inputBg}`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setEditingFeature(null)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${textMuted}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500"
                >
                  Save Feature
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Event */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`relative w-full max-w-md border rounded-2xl p-6 shadow-2xl ${
            isDarkMode ? 'bg-[#111318] border-white/[0.1]' : 'bg-white border-zinc-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-base font-bold ${textPrimary}`}>Update Event Record</h3>
              <button onClick={() => setEditingEvent(null)} className={textMuted}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditEvent} className="space-y-4">
              <div>
                <label className={`block text-xs font-medium mb-1 ${textMuted}`}>Title</label>
                <input
                  type="text"
                  required
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  className={`w-full rounded-xl px-3 py-2 text-xs border ${inputBg}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${textMuted}`}>Date</label>
                  <input
                    type="date"
                    required
                    value={editingEvent.original_date}
                    onChange={(e) => setEditingEvent({ ...editingEvent, original_date: e.target.value })}
                    className={`w-full rounded-xl px-3 py-2 text-xs border ${inputBg}`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${textMuted}`}>Time</label>
                  <input
                    type="time"
                    required
                    value={editingEvent.reminder_time.slice(0, 5)}
                    onChange={(e) => setEditingEvent({ ...editingEvent, reminder_time: e.target.value + ':00' })}
                    className={`w-full rounded-xl px-3 py-2 text-xs border ${inputBg}`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1 ${textMuted}`}>Timezone</label>
                <select
                  value={editingEvent.timezone}
                  onChange={(e) => setEditingEvent({ ...editingEvent, timezone: e.target.value })}
                  className={`w-full rounded-xl px-3 py-2 text-xs border ${inputBg}`}
                >
                  <option value="Asia/Dhaka">Asia/Dhaka</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="Asia/Dubai">Asia/Dubai</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1 ${textMuted}`}>Recipient Phone</label>
                <input
                  type="text"
                  value={editingEvent.recipient_phone || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, recipient_phone: e.target.value })}
                  className={`w-full rounded-xl px-3 py-2 text-xs border ${inputBg}`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${textMuted}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
