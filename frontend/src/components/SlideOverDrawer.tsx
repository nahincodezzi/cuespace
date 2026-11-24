'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Globe, Bell, Sparkles, AlertCircle, Info, Moon, Sun, Mail } from 'lucide-react';
import { EventCreateInput, EventCategory, CalendarType, LeapYearHandling } from '@/types/event';
import { getStoredTemplates, EmailTemplate } from '@/types/template';

interface SlideOverDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EventCreateInput) => Promise<void>;
  isDarkMode: boolean;
  onOpenTemplatesModal?: () => void;
}

export const SlideOverDrawer: React.FC<SlideOverDrawerProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isDarkMode,
  onOpenTemplatesModal
}) => {
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('formal-birthday');
  const [customEmailBody, setCustomEmailBody] = useState<string>('');

  const [formData, setFormData] = useState<EventCreateInput>({
    title: '',
    description: '',
    category: 'birthday',
    original_date: '2026-11-20',
    reminder_time: '09:00:00',
    timezone: 'Asia/Dhaka',
    calendar_type: 'GREGORIAN',
    leap_year_handling: 'FEB_28',
    recurrence_type: 'YEARLY',
    recurrence_interval: 1,
    channels: { email: true, sms: false, whatsapp: true },
    alert_lead_days: [0, 3],
    recipient_name: '',
    recipient_phone: '',
    recipient_email: ''
  });

  useEffect(() => {
    if (isOpen) {
      const tmpls = getStoredTemplates();
      setTemplates(tmpls);
      const match = tmpls.find(t => t.category === formData.category) || tmpls[0];
      if (match) {
        setSelectedTemplateId(match.id);
        setCustomEmailBody(match.body);
      }
    }
  }, [isOpen, formData.category]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Check if date is Feb 29 for conditional disclosure
  const isFeb29 = formData.original_date.endsWith('-02-29');

  const setTestTimeOffset = (minutes: number) => {
    const now = new Date();
    const future = new Date(now.getTime() + minutes * 60000);
    const yyyy = future.getFullYear();
    const mm = String(future.getMonth() + 1).padStart(2, '0');
    const dd = String(future.getDate()).padStart(2, '0');
    const hh = String(future.getHours()).padStart(2, '0');
    const min = String(future.getMinutes()).padStart(2, '0');
    setFormData((prev) => ({
      ...prev,
      title: prev.title || `Instant Test Alert (+${minutes}m)`,
      original_date: `${yyyy}-${mm}-${dd}`,
      reminder_time: `${hh}:${min}:00`,
      recurrence_type: 'NONE',
      alert_lead_days: [0]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        description: customEmailBody || formData.description
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const bgDrawer = isDarkMode ? 'bg-[#0D0E13] border-white/[0.08]' : 'bg-white border-zinc-200';
  const textPrimary = isDarkMode ? 'text-zinc-100' : 'text-zinc-950 font-semibold';
  const textMuted = isDarkMode ? 'text-zinc-400' : 'text-zinc-600 font-medium';
  const inputBg = isDarkMode 
    ? 'bg-white/[0.04] border-white/[0.08] text-zinc-100 placeholder-zinc-500 focus:border-indigo-500' 
    : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-indigo-500';
  const selectBg = isDarkMode 
    ? 'bg-[#14161F] border-white/[0.08] text-zinc-200 focus:border-indigo-500' 
    : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-indigo-500';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className={`w-screen max-w-lg border-l shadow-2xl flex flex-col justify-between transition-colors ${bgDrawer}`}>
          
          {/* Header */}
          <div className={`p-6 border-b flex items-center justify-between ${
            isDarkMode ? 'border-white/[0.08]' : 'border-zinc-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 dark:text-indigo-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className={`text-base font-semibold tracking-tight ${textPrimary}`}>Schedule Smart Event</h2>
                <p className={`text-xs ${textMuted}`}>Automated, timezone-aware reminder engine</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg border transition-all ${
                isDarkMode 
                  ? 'text-zinc-400 hover:text-zinc-100 border-transparent hover:bg-white/[0.05]' 
                  : 'text-zinc-500 hover:text-zinc-800 border-transparent hover:bg-zinc-100'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <form id="drawer-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Section 1: Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                <span className={`text-xs font-semibold uppercase tracking-wider ${textMuted}`}>1. Event Identity</span>
              </div>

              <div>
                <label htmlFor="drawer_event_title" className={`block text-xs font-medium mb-1.5 ${textMuted}`}>
                  Event Title *
                </label>
                <input
                  id="drawer_event_title"
                  name="title"
                  type="text"
                  required
                  placeholder="e.g. Sarah's 30th Birthday / Tax Return"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-indigo-500 border ${inputBg}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="drawer_event_category" className={`block text-xs font-medium mb-1.5 ${textMuted}`}>Category</label>
                  <select
                    id="drawer_event_category"
                    name="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as EventCategory })}
                    className={`w-full rounded-xl px-3 py-2.5 text-xs focus:outline-none border ${selectBg}`}
                  >
                    <option value="birthday">🎂 Birthday</option>
                    <option value="anniversary">💍 Anniversary</option>
                    <option value="deadline">🎯 Work Deadline</option>
                    <option value="health">🩺 Health Checkup</option>
                    <option value="finance">💳 Finance & Bills</option>
                    <option value="custom">✨ Custom Event</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="drawer_recurrence_type" className={`block text-xs font-medium mb-1.5 ${textMuted}`}>Recurrence</label>
                  <select
                    id="drawer_recurrence_type"
                    name="recurrence_type"
                    value={formData.recurrence_type}
                    onChange={(e) => setFormData({ ...formData, recurrence_type: e.target.value })}
                    className={`w-full rounded-xl px-3 py-2.5 text-xs focus:outline-none border ${selectBg}`}
                  >
                    <option value="YEARLY">Annual (Every Year)</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="NONE">One-time Event</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="drawer_description" className={`block text-xs font-medium mb-1.5 ${textMuted}`}>Description (Optional)</label>
                <textarea
                  id="drawer_description"
                  name="description"
                  rows={2}
                  placeholder="Add notes, gift ideas, or checklist..."
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full rounded-xl px-3.5 py-2 text-xs transition-all focus:outline-none focus:ring-1 focus:ring-indigo-500 border ${inputBg}`}
                />
              </div>
            </div>

            {/* Section 2: Smart Schedule & Timezone */}
            <div className={`space-y-4 pt-4 border-t ${isDarkMode ? 'border-white/[0.06]' : 'border-zinc-200'}`}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className={`text-xs font-semibold uppercase tracking-wider ${textMuted}`}>2. Schedule & Timezone</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="drawer_original_date" className={`block text-xs font-medium mb-1.5 ${textMuted}`}>Original Date *</label>
                  <input
                    id="drawer_original_date"
                    name="original_date"
                    type="date"
                    required
                    value={formData.original_date}
                    onChange={(e) => setFormData({ ...formData, original_date: e.target.value })}
                    className={`w-full rounded-xl px-3 py-2 text-xs focus:outline-none border ${inputBg}`}
                  />
                </div>
                <div>
                  <label htmlFor="drawer_reminder_time" className={`block text-xs font-medium mb-1.5 ${textMuted}`}>Reminder Time (Local)</label>
                  <input
                    id="drawer_reminder_time"
                    name="reminder_time"
                    type="time"
                    required
                    value={formData.reminder_time.slice(0, 5)}
                    onChange={(e) => setFormData({ ...formData, reminder_time: e.target.value + ':00' })}
                    className={`w-full rounded-xl px-3 py-2 text-xs focus:outline-none border ${inputBg}`}
                  />
                </div>
              </div>

              {/* Quick Test Presets */}
              <div className="flex items-center gap-1.5 flex-wrap -mt-2">
                <span className={`text-[10px] ${textMuted}`}>Quick Test:</span>
                <button
                  type="button"
                  onClick={() => setTestTimeOffset(2)}
                  className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all flex items-center gap-1"
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>⚡ 2 Mins From Now</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTestTimeOffset(5)}
                  className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-all"
                >
                  5 Mins
                </button>
              </div>

              {/* Timezone */}
              <div>
                <label htmlFor="drawer_timezone" className={`block text-xs font-medium mb-1.5 flex items-center gap-1.5 ${textMuted}`}>
                  <Globe className="w-3.5 h-3.5 text-indigo-400" />
                  Target Timezone
                </label>
                <select
                  id="drawer_timezone"
                  name="timezone"
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  className={`w-full rounded-xl px-3 py-2.5 text-xs focus:outline-none border ${selectBg}`}
                >
                  <option value="Asia/Dhaka">Asia/Dhaka (GMT+6)</option>
                  <option value="America/New_York">America/New_York (EST / EDT)</option>
                  <option value="Europe/London">Europe/London (GMT / BST)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                  <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                  <option value="UTC">UTC (Universal Coordinated Time)</option>
                </select>
              </div>

              {/* Calendar System */}
              <div>
                <label htmlFor="drawer_calendar_type" className={`block text-xs font-medium mb-1.5 ${textMuted}`}>Calendar System</label>
                <select
                  id="drawer_calendar_type"
                  name="calendar_type"
                  value={formData.calendar_type}
                  onChange={(e) => setFormData({ ...formData, calendar_type: e.target.value as CalendarType })}
                  className={`w-full rounded-xl px-3 py-2.5 text-xs focus:outline-none border ${selectBg}`}
                >
                  <option value="GREGORIAN">Gregorian (Standard Solar)</option>
                  <option value="HIJRI">Hijri (Islamic Lunar Calendar)</option>
                  <option value="BENGALI">Bengali (National Solar Calendar)</option>
                </select>

                {/* Live Calendar Conversion Preview Banner */}
                {formData.calendar_type === 'HIJRI' && (
                  <div className="mt-2.5 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 flex items-start gap-2 animate-in fade-in">
                    <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Lunar Conversion:</strong> Automatically advances ~10-11 days annually based on Islamic lunar sighting calculations.
                    </span>
                  </div>
                )}
                {formData.calendar_type === 'BENGALI' && (
                  <div className="mt-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2 animate-in fade-in">
                    <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Solar Alignment:</strong> Standardized with Bangladesh Revised Solar Calendar (Pohela Boishakh = April 14).
                    </span>
                  </div>
                )}
              </div>

              {/* Advance Alert Timing (Lead Days Selector) */}
              <div>
                <label className={`block text-xs font-medium mb-1.5 flex items-center justify-between ${textMuted}`}>
                  <span>Advance Alert Timing (কত দিন আগে মেসেজ আসবে)</span>
                  <span className="text-[10px] text-indigo-400 font-normal">Multi-select</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { label: 'On The Day', value: 0 },
                    { label: '1 Day Before', value: 1 },
                    { label: '2 Days Before', value: 2 },
                    { label: '3 Days Before', value: 3 },
                  ].map((opt) => {
                    const active = formData.alert_lead_days.includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          const current = formData.alert_lead_days;
                          const updated = active
                            ? current.filter((v) => v !== opt.value)
                            : [...current, opt.value].sort((a, b) => b - a);
                          setFormData({
                            ...formData,
                            alert_lead_days: updated.length > 0 ? updated : [0],
                          });
                        }}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border text-center transition-all ${
                          active
                            ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50 shadow-xs'
                            : isDarkMode
                            ? 'bg-white/[0.02] text-zinc-400 border-white/[0.06] hover:bg-white/[0.05]'
                            : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Progressive Disclosure: Leap Year ONLY appears when user picks Feb 29 */}
              {isFeb29 && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 mb-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>February 29 Leap Year Detected</span>
                  </div>
                  <label className={`block text-[11px] mb-1.5 ${textMuted}`}>
                    How should CueSpace handle non-leap years?
                  </label>
                  <select
                    value={formData.leap_year_handling}
                    onChange={(e) => setFormData({ ...formData, leap_year_handling: e.target.value as LeapYearHandling })}
                    className={`w-full rounded-lg px-2.5 py-1.5 text-xs focus:outline-none border ${selectBg}`}
                  >
                    <option value="FEB_28">Trigger on February 28 (Recommended)</option>
                    <option value="MARCH_1">Trigger on March 1</option>
                    <option value="EXACT_ONLY">Trigger only in Leap Years (Every 4 years)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Section 3: Delivery Channels & Recipient */}
            <div className={`space-y-4 pt-4 border-t ${isDarkMode ? 'border-white/[0.06]' : 'border-zinc-200'}`}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span className={`text-xs font-semibold uppercase tracking-wider ${textMuted}`}>3. Delivery Channels</span>
              </div>

              {/* Multi-Channel Switches */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, channels: { ...formData.channels, email: !formData.channels.email } })}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-medium border transition-all ${
                    formData.channels.email
                      ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/50 shadow-xs'
                      : isDarkMode
                      ? 'bg-white/[0.02] text-zinc-500 border-white/[0.06]'
                      : 'bg-zinc-100 text-zinc-400 border-zinc-200'
                  }`}
                >
                  ✉️ Email
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, channels: { ...formData.channels, whatsapp: !formData.channels.whatsapp } })}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-medium border transition-all ${
                    formData.channels.whatsapp
                      ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/50 shadow-xs'
                      : isDarkMode
                      ? 'bg-white/[0.02] text-zinc-500 border-white/[0.06]'
                      : 'bg-zinc-100 text-zinc-400 border-zinc-200'
                  }`}
                >
                  💬 WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, channels: { ...formData.channels, sms: !formData.channels.sms } })}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-medium border transition-all ${
                    formData.channels.sms
                      ? 'bg-blue-600/20 text-blue-400 border-blue-500/50 shadow-xs'
                      : isDarkMode
                      ? 'bg-white/[0.02] text-zinc-500 border-white/[0.06]'
                      : 'bg-zinc-100 text-zinc-400 border-zinc-200'
                  }`}
                >
                  📱 SMS
                </button>
              </div>

              {/* Recipient Details: Name, WhatsApp & Email */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="drawer_recipient_name" className={`block text-xs font-medium mb-1.5 ${textMuted}`}>Recipient Name</label>
                    <input
                      id="drawer_recipient_name"
                      name="recipient_name"
                      type="text"
                      placeholder="e.g. Tamanna Rahman"
                      value={formData.recipient_name || ''}
                      onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                      className={`w-full rounded-xl px-3 py-2 text-xs focus:outline-none border ${inputBg}`}
                    />
                  </div>
                  <div>
                    <label htmlFor="drawer_recipient_phone" className={`block text-xs font-medium mb-1.5 ${textMuted}`}>Phone (WhatsApp)</label>
                    <input
                      id="drawer_recipient_phone"
                      name="recipient_phone"
                      type="text"
                      placeholder="+8801633518042"
                      value={formData.recipient_phone || ''}
                      onChange={(e) => setFormData({ ...formData, recipient_phone: e.target.value })}
                      className={`w-full rounded-xl px-3 py-2 text-xs focus:outline-none border ${inputBg}`}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="drawer_recipient_email" className={`block text-xs font-medium mb-1.5 ${textMuted}`}>
                    Recipient Email <span className="text-[10px] text-purple-400 font-normal">(for Formal Email Dispatch)</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      id="drawer_recipient_email"
                      name="recipient_email"
                      type="email"
                      placeholder="tamanna@example.com"
                      value={formData.recipient_email || ''}
                      onChange={(e) => setFormData({ ...formData, recipient_email: e.target.value })}
                      className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none border ${inputBg}`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Formal Email Template Customization */}
            {formData.channels.email && (
              <div className={`space-y-3 pt-4 border-t ${isDarkMode ? 'border-white/[0.06]' : 'border-zinc-200'} animate-in fade-in duration-200`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    <span className={`text-xs font-semibold uppercase tracking-wider ${textMuted}`}>4. Formal Email Template</span>
                  </div>
                  {onOpenTemplatesModal && (
                    <button
                      type="button"
                      onClick={onOpenTemplatesModal}
                      className="text-[11px] text-purple-400 hover:text-purple-300 font-medium underline flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Manage / Create Templates</span>
                    </button>
                  )}
                </div>

                <div>
                  <label htmlFor="drawer_template_select" className={`block text-[11px] mb-1.5 ${textMuted}`}>Choose Email Template</label>
                  <select
                    id="drawer_template_select"
                    name="template_select"
                    value={selectedTemplateId}
                    onChange={(e) => {
                      const selId = e.target.value;
                      setSelectedTemplateId(selId);
                      const found = templates.find(t => t.id === selId);
                      if (found) setCustomEmailBody(found.body);
                    }}
                    className={`w-full rounded-xl px-3 py-2 text-xs focus:outline-none border ${selectBg}`}
                  >
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="drawer_template_body" className={`block text-[11px] mb-1.5 ${textMuted}`}>Formal Message Body (Customizable)</label>
                  <textarea
                    id="drawer_template_body"
                    name="template_body"
                    rows={4}
                    value={customEmailBody}
                    onChange={(e) => setCustomEmailBody(e.target.value)}
                    placeholder="Enter formal email message..."
                    className={`w-full rounded-xl p-3 text-xs font-mono leading-relaxed focus:outline-none border ${inputBg}`}
                  />
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-1">
                    <span>Tags: {'{{recipient_name}}'}, {'{{event_title}}'}, {'{{event_date}}'}</span>
                    <span className="text-purple-400">Formal HTML Layout Active</span>
                  </div>
                </div>
              </div>
            )}
          </form>

          {/* Footer */}
          <div className={`p-6 border-t flex items-center justify-between ${
            isDarkMode ? 'border-white/[0.08] bg-[#0A0B0F]' : 'border-zinc-200 bg-zinc-50'
          }`}>
            <span className={`text-[11px] ${textMuted}`}>Press ESC to cancel</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                  isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="drawer-form"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2"
              >
                {loading ? 'Scheduling...' : 'Save & Schedule'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
