'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Send, Clock, Shield, Database, 
  Search, CheckCircle2, AlertTriangle, ArrowUpDown, RefreshCw, X, Lock, LogOut, LayoutTemplate, Sparkles, Check, MessageCircle,
  Eye, EyeOff, User, ArrowLeft, ExternalLink, Mail
} from 'lucide-react';
import { SmartEvent, EventCreateInput } from '@/types/event';
import { LandingContent, FeatureItem } from '@/types/cms';
import { saveLandingContent } from '@/lib/cmsStorage';
import { 
  updateEventApi, deleteEventApi, dispatchNowApi, fetchAuditLogs, AuditLog,
  fetchSmtpStatus, configureSmtpApi, sendTestEmailApi, SmtpStatus,
  fetchTwilioStatus, configureTwilioApi, sendTestWhatsAppApi, TwilioStatus
} from '@/lib/api';

interface AdminPortalProps {
  events: SmartEvent[];
  onRefreshEvents: () => void;
  onOpenCreate: () => void;
  isDarkMode: boolean;
  showToast: (msg: string) => void;
  landingContent: LandingContent;
  onUpdateLandingContent: (newContent: LandingContent) => void;
  onExit?: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  events,
  onRefreshEvents,
  onOpenCreate,
  isDarkMode,
  showToast,
  landingContent,
  onUpdateLandingContent,
  onExit,
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Restore authenticated session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('cuespace_admin_auth');
      if (stored === 'true') {
        setIsAuthenticated(true);
      }
    }
  }, []);

  // Admin Navigation Tabs: 'landing_cms' | 'events' | 'logs' | 'smtp'
  const [activeTab, setActiveTab] = useState<'landing_cms' | 'events' | 'logs' | 'smtp'>('landing_cms');
  
  // Events CRUD state
  const [search, setSearch] = useState('');
  const [editingEvent, setEditingEvent] = useState<SmartEvent | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  
  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [selectedLogForPreview, setSelectedLogForPreview] = useState<AuditLog | null>(null);

  // Real Email & SMTP Configuration State
  const [smtpStatus, setSmtpStatus] = useState<SmtpStatus | null>(null);
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [smtpEnabled, setSmtpEnabled] = useState(false);
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState(587);
  const [isSavingSmtp, setIsSavingSmtp] = useState(false);

  // Test Real Email State
  const [testEmailRecipient, setTestEmailRecipient] = useState('');
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; message: string } | null>(null);

  // Real WhatsApp & Twilio Configuration State
  const [twilioStatus, setTwilioStatus] = useState<TwilioStatus | null>(null);
  const [twilioSid, setTwilioSid] = useState('');
  const [twilioToken, setTwilioToken] = useState('');
  const [twilioWaNumber, setTwilioWaNumber] = useState('');
  const [isSavingTwilio, setIsSavingTwilio] = useState(false);
  const [testWaPhone, setTestWaPhone] = useState('');
  const [isSendingTestWa, setIsSendingTestWa] = useState(false);
  const [testWaResult, setTestWaResult] = useState<{ success: boolean; message: string } | null>(null);

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
    if (activeTab === 'smtp') {
      loadSmtp();
      loadTwilio();
    }
  }, [activeTab]);

  const loadSmtp = async () => {
    try {
      const data = await fetchSmtpStatus();
      setSmtpStatus(data);
      setSmtpUser(data.smtp_user || '');
      setSmtpEnabled(data.smtp_enabled);
      setSmtpHost(data.smtp_host || 'smtp.gmail.com');
      setSmtpPort(data.smtp_port || 587);
    } catch (err) {
      console.error('Failed to load SMTP status', err);
    }
  };

  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smtpUser || !smtpPassword) {
      showToast('Please enter both your Gmail address and Google App Password.');
      return;
    }
    setIsSavingSmtp(true);
    try {
      const res = await configureSmtpApi({
        smtp_user: smtpUser,
        smtp_password: smtpPassword,
        smtp_enabled: smtpEnabled,
        smtp_host: smtpHost,
        smtp_port: smtpPort
      });
      showToast(res.message);
      await loadSmtp();
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    } finally {
      setIsSavingSmtp(false);
    }
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailRecipient) {
      showToast('Please enter a recipient email address to send test email.');
      return;
    }
    setIsSendingTestEmail(true);
    setTestEmailResult(null);
    try {
      const res = await sendTestEmailApi({
        recipient_email: testEmailRecipient,
        subject: '✨ CueSpace Real Email Dispatch Verification'
      });
      setTestEmailResult({ success: res.success, message: res.message });
      showToast(res.message);
    } catch (err: any) {
      setTestEmailResult({ success: false, message: err.message });
      showToast(`Failed: ${err.message}`);
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  const loadTwilio = async () => {
    try {
      const data = await fetchTwilioStatus();
      setTwilioStatus(data);
      if (data.twilio_whatsapp_number) setTwilioWaNumber(data.twilio_whatsapp_number);
    } catch (err) {
      console.error('Failed to load Twilio status', err);
    }
  };

  const handleSaveTwilio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twilioSid || !twilioToken || !twilioWaNumber) {
      showToast('Please enter Twilio Account SID, Auth Token, and WhatsApp Number.');
      return;
    }
    setIsSavingTwilio(true);
    try {
      const res = await configureTwilioApi({
        twilio_account_sid: twilioSid,
        twilio_auth_token: twilioToken,
        twilio_whatsapp_number: twilioWaNumber,
      });
      showToast(res.message);
      await loadTwilio();
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    } finally {
      setIsSavingTwilio(false);
    }
  };

  const handleSendTestWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testWaPhone) {
      showToast('Please enter a recipient phone number (e.g. +8801700000000).');
      return;
    }
    setIsSendingTestWa(true);
    setTestWaResult(null);
    try {
      const res = await sendTestWhatsAppApi({ recipient_phone: testWaPhone });
      setTestWaResult({ success: res.success, message: res.message });
      showToast(res.message);
    } catch (err: any) {
      setTestWaResult({ success: false, message: err.message });
      showToast(`Failed: ${err.message}`);
    } finally {
      setIsSendingTestWa(false);
    }
  };

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
    const user = loginEmail.trim().toLowerCase();
    const pass = loginPassword.trim();

    if ((user === 'admin' || user === 'admin@cuespace.app') && (pass === 'admin123' || pass === 'cuespace2026')) {
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('cuespace_admin_auth', 'true');
      }
      setLoginError('');
      showToast('Authenticated as Administrator successfully!');
    } else {
      setLoginError('Invalid username or password. Please verify and try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoginPassword('');
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('cuespace_admin_auth');
    }
    showToast('Logged out from Admin CMS.');
    if (onExit) onExit();
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

  // LOGIN SCREEN (GATED AUTHENTICATION)
  if (!isAuthenticated) {
    return (
      <div className={`border rounded-3xl p-6 sm:p-8 max-w-md mx-auto my-10 sm:my-16 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 duration-200 ${containerBg}`}>
        <div className="flex items-center gap-3.5 mb-6 pb-5 border-b border-[var(--border)]">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#6366F1] flex items-center justify-center text-white shadow-[0_0_20px_rgba(124,58,237,0.4)]">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className={`text-base sm:text-lg font-bold tracking-tight ${textPrimary}`}>
              CMS Portal & Admin Login
            </h2>
            <p className={`text-xs ${textMuted} mt-0.5`}>
              Restricted Area · Enter administrator credentials
            </p>
          </div>
        </div>

        {loginError && (
          <div className="p-3 mb-5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-500 flex items-center gap-2 animate-in fade-in duration-150">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
            <span className="font-medium">{loginError}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
              Username or Admin Email *
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. admin or admin@cuespace.app"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className={`w-full rounded-xl pl-9 pr-3.5 py-2.5 text-xs border focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors ${inputBg}`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter admin password..."
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className={`w-full rounded-xl pl-9 pr-10 py-2.5 text-xs border focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors ${inputBg}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#7C3AED] to-[#6366F1] hover:shadow-[0_4px_20px_rgba(124,58,237,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Authenticate & Enter Console</span>
            </button>

            {onExit && (
              <button
                type="button"
                onClick={onExit}
                className={`w-full py-2 px-4 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  isDarkMode 
                    ? 'border-white/10 text-zinc-400 hover:text-white hover:bg-white/5' 
                    : 'border-zinc-200 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Cancel & Return to App</span>
              </button>
            )}
          </div>
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

            <button
              onClick={() => setActiveTab('smtp')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'smtp'
                  ? isDarkMode ? 'bg-white/[0.1] text-white shadow-xs' : 'bg-white text-zinc-900 shadow-xs'
                  : textMuted
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-purple-400" />
              <span>Real Email & WhatsApp</span>
            </button>
          </div>

          <button
            onClick={handleLogout}
            className={`p-2 rounded-xl border text-xs text-zinc-400 hover:text-rose-400 transition-all cursor-pointer ${
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
                        {ev.recipient_phone && (
                          <a
                            href={`https://wa.me/${ev.recipient_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `Happy ${ev.category === 'birthday' ? 'Birthday' : 'Celebration'} ${ev.recipient_name || ''}! Wishing you the very best! 🎉 - from CueSpace`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                            title={`Open direct WhatsApp chat with ${ev.recipient_phone}`}
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => handleDispatchNow(ev.id, ev.title)}
                          className="p-1.5 rounded-lg text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                          title="Trigger Immediate Server Dispatch Simulation"
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
                  <th className="px-4 py-3 text-right">Message Preview</th>
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
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedLogForPreview(log)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                          isDarkMode
                            ? 'text-zinc-200 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border-white/[0.1]'
                            : 'text-zinc-800 hover:text-zinc-950 bg-zinc-100 hover:bg-zinc-200 border-zinc-200 shadow-2xs'
                        }`}
                        title="View actual rendered message payload"
                      >
                        <Eye className="w-3.5 h-3.5 text-indigo-500" />
                        <span>View Content</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Modal: Live Local Message Preview */}
          {selectedLogForPreview && (
            <div 
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
              onClick={() => setSelectedLogForPreview(null)}
            >
              <div 
                className={`relative w-full max-w-2xl max-h-[85vh] border rounded-3xl p-6 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 ${
                  isDarkMode ? 'bg-[#0f111a] border-white/[0.12]' : 'bg-white border-zinc-200'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-zinc-500/20 mb-4 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                      {selectedLogForPreview.channel === 'EMAIL' ? <Mail className="w-4 h-4" /> : <MessageCircle className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <div>
                      <h3 className={`text-sm font-bold flex items-center gap-2 ${textPrimary}`}>
                        <span>Local Dispatched {selectedLogForPreview.channel} Content</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                          {selectedLogForPreview.status}
                        </span>
                      </h3>
                      <p className={`text-[11px] ${textMuted}`}>
                        Delivered to: <strong className={isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}>{selectedLogForPreview.recipient}</strong> &bull; {selectedLogForPreview.sent_at || selectedLogForPreview.created_at}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedLogForPreview(null)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                  {selectedLogForPreview.channel === 'EMAIL' ? (
                    <div>
                      <div className={`p-3 rounded-xl border mb-3 text-xs ${
                        isDarkMode ? 'bg-white/[0.02] border-white/[0.08]' : 'bg-zinc-50 border-zinc-200'
                      }`}>
                        <div className="font-semibold text-indigo-400 mb-1">
                          Subject: {selectedLogForPreview.metadata_payload?.subject || 'CueSpace Milestone Reminder'}
                        </div>
                        <div className={`text-[11px] ${textMuted}`}>
                          From: CueSpace Autonomous Engine &lt;notifications@cuespace.app&gt;
                        </div>
                      </div>

                      {/* Rendered HTML Email Container */}
                      <div className="border border-zinc-700/40 rounded-2xl p-4 bg-[#090A0F] text-[#EDEDED] text-xs shadow-inner">
                        {selectedLogForPreview.metadata_payload?.html_body ? (
                          <div dangerouslySetInnerHTML={{ __html: selectedLogForPreview.metadata_payload.html_body }} />
                        ) : (
                          <div className="p-4 text-center text-zinc-400 italic">
                            Email notification logged for {selectedLogForPreview.recipient}. (No raw HTML saved for this legacy record)
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      {/* WhatsApp / SMS Chat Bubble */}
                      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                        <div className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5">
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp Message Preview</span>
                        </div>
                        <div className="max-w-md bg-emerald-950/60 border border-emerald-500/30 text-emerald-100 p-4 rounded-2xl rounded-tl-none text-xs leading-relaxed whitespace-pre-line shadow-md">
                          {selectedLogForPreview.metadata_payload?.message_text || 
                            `🎉 CueSpace Reminder: Notification dispatched to ${selectedLogForPreview.recipient}.`}
                        </div>
                        {selectedLogForPreview.recipient && (
                          <a
                            href={`https://wa.me/${selectedLogForPreview.recipient.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              selectedLogForPreview.metadata_payload?.message_text || 'CueSpace Reminder'
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-sm"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Open Direct in WhatsApp Web</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-zinc-500/20 flex items-center justify-between mt-3 shrink-0">
                  <span className={`text-[11px] ${textMuted}`}>Local Sandbox Simulation &bull; 100% Offline Safe</span>
                  <button
                    onClick={() => setSelectedLogForPreview(null)}
                    className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:opacity-90 transition-all"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 4: REAL EMAIL & SMTP CONFIGURATION                     */}
      {/* ========================================================== */}
      {activeTab === 'smtp' && (
        <div className="mt-6 space-y-8 animate-in fade-in">
          {/* Status & Live Mode Indicator */}
          <div className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
            isDarkMode ? 'bg-[#111318] border-white/[0.08]' : 'bg-white border-zinc-200 shadow-xs'
          }`}>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  smtpStatus?.is_configured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                }`} />
                <h3 className={`text-base font-bold ${textPrimary}`}>
                  {smtpStatus?.is_configured ? 'Real Email Engine Active' : 'Sandbox / Local Simulation Mode'}
                </h3>
              </div>
              <p className={`text-xs ${textMuted}`}>
                {smtpStatus?.is_configured 
                  ? `Emails are dispatched directly to real recipient inboxes via ${smtpStatus.provider} (${smtpStatus.smtp_user}).`
                  : 'Real email dispatch is not active yet. Enter your Gmail & 16-character Google App Password below to send real emails to your inbox.'}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-xs px-3 py-1 rounded-full font-mono font-medium border ${
                smtpStatus?.is_configured
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>
                {smtpStatus?.is_configured ? '● Live Dispatch' : '○ Sandbox'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Box 1: Send Real Test Email */}
            <div className={`p-6 rounded-2xl border flex flex-col justify-between ${
              isDarkMode ? 'bg-white/[0.02] border-white/[0.08]' : 'bg-zinc-50 border-zinc-200'
            }`}>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <Send className="w-3.5 h-3.5" />
                  </div>
                  <h4 className={`text-sm font-bold ${textPrimary}`}>Send Real Test Email</h4>
                </div>
                <p className={`text-xs ${textMuted} mb-4`}>
                  Type your personal email address below to immediately dispatch a CueSpace verification email to your real inbox.
                </p>

                <form onSubmit={handleSendTestEmail} className="space-y-3.5">
                  <div>
                    <label htmlFor="admin_test_recipient_email" className={`block text-xs font-semibold mb-1 ${textPrimary}`}>
                      Your Email Address (Recipient) *
                    </label>
                    <input
                      id="admin_test_recipient_email"
                      name="test_recipient_email"
                      type="email"
                      required
                      placeholder="e.g. yourname@gmail.com"
                      value={testEmailRecipient}
                      onChange={(e) => setTestEmailRecipient(e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                        isDarkMode ? 'bg-white/[0.04] border-white/[0.1] text-white placeholder-zinc-500' : 'bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400'
                      }`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingTestEmail}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-600/25 transition-all flex items-center justify-center gap-2"
                  >
                    {isSendingTestEmail ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending Real Email...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Real Test Email Now</span>
                      </>
                    )}
                  </button>
                </form>

                {testEmailResult && (
                  <div className={`mt-4 p-3.5 rounded-xl border text-xs leading-relaxed ${
                    testEmailResult.success
                      ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/25 text-rose-300'
                  }`}>
                    <p className="font-semibold mb-0.5">
                      {testEmailResult.success ? '✅ Success!' : '⚠️ Dispatch Result:'}
                    </p>
                    <p>{testEmailResult.message}</p>
                    {testEmailResult.success && (
                      <p className="mt-1 text-[11px] opacity-80">
                        Check your Inbox (or Spam/Promotions tab) for "CueSpace Live Test".
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Box 2: Gmail SMTP Credentials Setup */}
            <div className={`p-6 rounded-2xl border ${
              isDarkMode ? 'bg-white/[0.02] border-white/[0.08]' : 'bg-zinc-50 border-zinc-200'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <h4 className={`text-sm font-bold ${textPrimary}`}>Gmail SMTP Credentials</h4>
              </div>
              <p className={`text-xs ${textMuted} mb-4`}>
                Configure your Gmail sender and Google App Password (saved to local runtime and .env).
              </p>

              <form onSubmit={handleSaveSmtp} className="space-y-3.5">
                <div>
                  <label htmlFor="admin_smtp_user" className={`block text-xs font-semibold mb-1 ${textPrimary}`}>
                    Gmail Sender Address *
                  </label>
                  <input
                    id="admin_smtp_user"
                    name="smtp_user"
                    type="email"
                    required
                    placeholder="your_email@gmail.com"
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                      isDarkMode ? 'bg-white/[0.04] border-white/[0.1] text-white placeholder-zinc-500' : 'bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400'
                    }`}
                  />
                </div>

                <div>
                  <label htmlFor="admin_smtp_password" className={`block text-xs font-semibold mb-1 ${textPrimary}`}>
                    Google 16-Character App Password *
                  </label>
                  <input
                    id="admin_smtp_password"
                    name="smtp_password"
                    type="password"
                    required
                    placeholder="e.g. abcd efgh ijkl mnop"
                    value={smtpPassword}
                    onChange={(e) => setSmtpPassword(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl text-xs font-mono border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                      isDarkMode ? 'bg-white/[0.04] border-white/[0.1] text-white placeholder-zinc-500' : 'bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="enableSmtpCheck"
                    checked={smtpEnabled}
                    onChange={(e) => setSmtpEnabled(e.target.checked)}
                    className="rounded border-zinc-600 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="enableSmtpCheck" className={`text-xs font-semibold cursor-pointer ${textPrimary}`}>
                    Enable Real Email Dispatch (Send to real recipients)
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSavingSmtp}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2"
                >
                  {isSavingSmtp ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Credentials...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save & Activate Real Email</span>
                    </>
                  )}
                </button>
              </form>

              {/* Guide Note */}
              <div className={`mt-4 p-3 rounded-xl border text-[11px] leading-relaxed ${
                isDarkMode ? 'bg-black/30 border-white/[0.06] text-zinc-400' : 'bg-white border-zinc-200 text-zinc-600'
              }`}>
                <p className="font-semibold text-indigo-400 mb-1">💡 How to generate Google App Password:</p>
                <ol className="list-decimal list-inside space-y-0.5">
                  <li>Turn on 2-Step Verification in your Google Account.</li>
                  <li>Go to <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-indigo-400 underline">myaccount.google.com/apppasswords</a></li>
                  <li>Type app name "CueSpace" and click Create.</li>
                  <li>Copy the 16-character code generated and paste it above!</li>
                </ol>
              </div>
            </div>
          </div>

          {/* DIVIDER: WHATSAPP NOTIFICATION INTEGRATION */}
          <div className="pt-6 border-t border-[var(--border)]">
            {/* Status Indicator */}
            <div className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 ${
              isDarkMode ? 'bg-[#111318] border-white/[0.08]' : 'bg-white border-zinc-200 shadow-xs'
            }`}>
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    twilioStatus?.is_configured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                  }`} />
                  <h3 className={`text-base font-bold ${textPrimary}`}>
                    {twilioStatus?.is_configured ? 'Real WhatsApp Dispatch Active' : 'WhatsApp 1-Click Wish & Sandbox Mode'}
                  </h3>
                </div>
                <p className={`text-xs ${textMuted}`}>
                  {twilioStatus?.is_configured 
                    ? `Automated WhatsApp notifications are dispatched live via Twilio (${twilioStatus.twilio_whatsapp_number}).`
                    : 'Twilio WhatsApp API is not yet configured. The system provides 1-click wa.me instant wish buttons for free, or you can enter Twilio credentials below for automated bots.'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs px-3 py-1 rounded-full font-mono font-medium border ${
                  twilioStatus?.is_configured
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  {twilioStatus?.is_configured ? '● Live WhatsApp' : '○ 1-Click wa.me'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Box 3: Send Test WhatsApp Message */}
              <div className={`p-6 rounded-2xl border flex flex-col justify-between ${
                isDarkMode ? 'bg-white/[0.02] border-white/[0.08]' : 'bg-zinc-50 border-zinc-200'
              }`}>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                      <MessageCircle className="w-3.5 h-3.5" />
                    </div>
                    <h4 className={`text-sm font-bold ${textPrimary}`}>Test WhatsApp Dispatch</h4>
                  </div>
                  <p className={`text-xs ${textMuted} mb-4`}>
                    Enter your phone number (with country code, e.g. +8801700000000) to verify your WhatsApp setup.
                  </p>

                  <form onSubmit={handleSendTestWhatsApp} className="space-y-3.5">
                    <div>
                      <label htmlFor="admin_test_recipient_phone" className={`block text-xs font-semibold mb-1 ${textPrimary}`}>
                        Your WhatsApp Phone Number *
                      </label>
                      <input
                        id="admin_test_recipient_phone"
                        name="test_recipient_phone"
                        type="text"
                        required
                        placeholder="e.g. +8801712345678"
                        value={testWaPhone}
                        onChange={(e) => setTestWaPhone(e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                          isDarkMode ? 'bg-white/[0.04] border-white/[0.1] text-white placeholder-zinc-500' : 'bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400'
                        }`}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSendingTestWa}
                      className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
                    >
                      {isSendingTestWa ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Sending WhatsApp Message...</span>
                        </>
                      ) : (
                        <>
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Send Test WhatsApp Message</span>
                        </>
                      )}
                    </button>
                  </form>

                  {testWaResult && (
                    <div className={`mt-4 p-3.5 rounded-xl border text-xs leading-relaxed ${
                      testWaResult.success
                        ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
                        : 'bg-rose-500/10 border-rose-500/25 text-rose-300'
                    }`}>
                      <p className="font-semibold mb-0.5">
                        {testWaResult.success ? '✅ Success!' : '⚠️ Dispatch Result:'}
                      </p>
                      <p>{testWaResult.message}</p>
                    </div>
                  )}

                  {/* Free 1-Click WhatsApp Wish Link info */}
                  <div className={`mt-4 p-3.5 rounded-xl border text-[11px] leading-relaxed ${
                    isDarkMode ? 'bg-black/30 border-white/[0.06] text-zinc-400' : 'bg-white border-zinc-200 text-zinc-600'
                  }`}>
                    <p className="font-semibold text-emerald-400 mb-1">🎁 Free WhatsApp 1-Click Integration:</p>
                    <p>
                      Even without Twilio, every reminder email and live alarm modal includes an instant <strong>"Send WhatsApp Wish"</strong> button. Clicking it opens WhatsApp Web/App with a personalized, pre-written greeting for zero cost!
                    </p>
                  </div>
                </div>
              </div>

              {/* Box 4: Twilio WhatsApp Credentials Setup */}
              <div className={`p-6 rounded-2xl border ${
                isDarkMode ? 'bg-white/[0.02] border-white/[0.08]' : 'bg-zinc-50 border-zinc-200'
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400">
                    <Database className="w-3.5 h-3.5" />
                  </div>
                  <h4 className={`text-sm font-bold ${textPrimary}`}>Twilio WhatsApp Credentials</h4>
                </div>
                <p className={`text-xs ${textMuted} mb-4`}>
                  Enter your Twilio API keys to automate WhatsApp messages directly from the server.
                </p>

                <form onSubmit={handleSaveTwilio} className="space-y-3.5">
                  <div>
                    <label htmlFor="admin_twilio_sid" className={`block text-xs font-semibold mb-1 ${textPrimary}`}>
                      Twilio Account SID *
                    </label>
                    <input
                      id="admin_twilio_sid"
                      name="twilio_sid"
                      type="text"
                      required
                      placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      value={twilioSid}
                      onChange={(e) => setTwilioSid(e.target.value)}
                      className={`w-full px-3.5 py-2 rounded-xl text-xs font-mono border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                        isDarkMode ? 'bg-white/[0.04] border-white/[0.1] text-white placeholder-zinc-500' : 'bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400'
                      }`}
                    />
                  </div>

                  <div>
                    <label htmlFor="admin_twilio_token" className={`block text-xs font-semibold mb-1 ${textPrimary}`}>
                      Twilio Auth Token *
                    </label>
                    <input
                      id="admin_twilio_token"
                      name="twilio_token"
                      type="password"
                      required
                      placeholder="your_twilio_auth_token"
                      value={twilioToken}
                      onChange={(e) => setTwilioToken(e.target.value)}
                      className={`w-full px-3.5 py-2 rounded-xl text-xs font-mono border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                        isDarkMode ? 'bg-white/[0.04] border-white/[0.1] text-white placeholder-zinc-500' : 'bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400'
                      }`}
                    />
                  </div>

                  <div>
                    <label htmlFor="admin_twilio_wa_number" className={`block text-xs font-semibold mb-1 ${textPrimary}`}>
                      Twilio WhatsApp Sender Number *
                    </label>
                    <input
                      id="admin_twilio_wa_number"
                      name="twilio_wa_number"
                      type="text"
                      required
                      placeholder="e.g. whatsapp:+14155238886"
                      value={twilioWaNumber}
                      onChange={(e) => setTwilioWaNumber(e.target.value)}
                      className={`w-full px-3.5 py-2 rounded-xl text-xs font-mono border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                        isDarkMode ? 'bg-white/[0.04] border-white/[0.1] text-white placeholder-zinc-500' : 'bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400'
                      }`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingTwilio}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
                  >
                    {isSavingTwilio ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving Credentials...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Save & Activate Twilio WhatsApp</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Guide Note */}
                <div className={`mt-4 p-3 rounded-xl border text-[11px] leading-relaxed ${
                  isDarkMode ? 'bg-black/30 border-white/[0.06] text-zinc-400' : 'bg-white border-zinc-200 text-zinc-600'
                }`}>
                  <p className="font-semibold text-emerald-400 mb-1">💡 How to use Twilio WhatsApp Sandbox:</p>
                  <ol className="list-decimal list-inside space-y-0.5">
                    <li>Sign up for a free Twilio account at <a href="https://twilio.com" target="_blank" rel="noreferrer" className="text-emerald-400 underline">twilio.com</a>.</li>
                    <li>Copy Account SID and Auth Token from your Twilio Console dashboard.</li>
                    <li>Go to Messaging &rarr; Try it out &rarr; Send a WhatsApp message.</li>
                    <li>Use the Twilio Sandbox WhatsApp number (usually <code>whatsapp:+14155238886</code>).</li>
                  </ol>
                </div>
              </div>
            </div>
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
