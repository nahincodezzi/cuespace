'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Search, 
  Bell, 
  Mail, 
  MessageCircle, 
  Filter, 
  ArrowRight, 
  Check, 
  X, 
  Globe, 
  Heart, 
  Flag, 
  AlertCircle,
  RefreshCw,
  Zap,
  SlidersHorizontal
} from 'lucide-react';
import { SpecialDay, SpecialDaysResponse, SubscribeSpecialDaysPayload } from '@/types/specialDays';
import { fetchSpecialDays, subscribeSpecialDaysApi, unsubscribeSpecialDaysApi } from '@/lib/api';

interface SpecialDaysHubProps {
  isDarkMode: boolean;
  showToast: (msg: string) => void;
  onRefreshEvents?: () => void;
}

export const SpecialDaysHub: React.FC<SpecialDaysHubProps> = ({
  isDarkMode,
  showToast,
  onRefreshEvents
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [specialDays, setSpecialDays] = useState<SpecialDay[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'bangladesh' | 'international' | 'family' | 'subscribed'>('all');

  // Subscription Modal State
  const [isSubModalOpen, setIsSubModalOpen] = useState<boolean>(false);
  const [modalTargetDays, setModalTargetDays] = useState<SpecialDay[]>([]);
  const [subEmail, setSubEmail] = useState<string>('');
  const [subPhone, setSubPhone] = useState<string>('+8801');
  const [subName, setSubName] = useState<string>('');
  const [leadDays, setLeadDays] = useState<number[]>([1, 2]);
  const [channelEmail, setChannelEmail] = useState<boolean>(true);
  const [channelWhatsapp, setChannelWhatsapp] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const loadData = async (year: number) => {
    setLoading(true);
    try {
      const res = await fetchSpecialDays(year);
      setSpecialDays(res.special_days);
    } catch (err) {
      console.error('Failed to load special days', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedYear);
  }, [selectedYear]);

  // Statistics
  const totalCount = specialDays.length;
  const subscribedCount = specialDays.filter((d) => d.is_subscribed).length;
  const bdCount = specialDays.filter((d) => d.category === 'bangladesh').length;
  const globalCount = specialDays.filter((d) => d.category !== 'bangladesh').length;

  // Filtered List
  const filteredDays = useMemo(() => {
    return specialDays.filter((d) => {
      const matchSearch =
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.title_bn.includes(searchQuery) ||
        d.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchSearch) return false;

      if (selectedCategory === 'all') return true;
      if (selectedCategory === 'subscribed') return d.is_subscribed;
      return d.category === selectedCategory;
    });
  }, [specialDays, searchQuery, selectedCategory]);

  // Open modal for single day
  const handleOpenSingleSub = (day: SpecialDay) => {
    setModalTargetDays([day]);
    setIsSubModalOpen(true);
  };

  // Open modal for batch days
  const handleOpenBatchSub = (category?: 'bangladesh' | 'all_global' | 'all') => {
    let targets: SpecialDay[] = [];
    if (category === 'bangladesh') {
      targets = specialDays.filter((d) => d.category === 'bangladesh');
    } else if (category === 'all_global') {
      targets = specialDays.filter((d) => d.category !== 'bangladesh');
    } else {
      targets = specialDays;
    }
    setModalTargetDays(targets);
    setIsSubModalOpen(true);
  };

  // Handle Unsubscribe
  const handleUnsubscribe = async (dayId: string, dayTitle: string) => {
    try {
      await unsubscribeSpecialDaysApi([dayId]);
      showToast(`Unsubscribed from "${dayTitle}".`);
      loadData(selectedYear);
      if (onRefreshEvents) onRefreshEvents();
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  // Submit Subscription
  const handleConfirmSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subEmail && !subPhone) {
      showToast('Please provide an Email or WhatsApp phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: SubscribeSpecialDaysPayload = {
        day_ids: modalTargetDays.map((d) => d.id),
        year: selectedYear,
        recipient_email: subEmail.trim() || undefined,
        recipient_phone: subPhone.trim() || undefined,
        recipient_name: subName.trim() || undefined,
        channels: {
          email: channelEmail,
          whatsapp: channelWhatsapp,
          sms: false,
        },
        alert_lead_days: leadDays.length > 0 ? leadDays : [1, 2],
        timezone: 'Asia/Dhaka',
      };

      const res = await subscribeSpecialDaysApi(payload);
      showToast(res.message);
      setIsSubModalOpen(false);
      loadData(selectedYear);
      if (onRefreshEvents) onRefreshEvents();
    } catch (err: any) {
      showToast(`Subscription error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const textPrimary = isDarkMode ? 'text-zinc-100' : 'text-zinc-950 font-bold';
  const textMuted = isDarkMode ? 'text-zinc-400' : 'text-zinc-600 font-medium';
  const cardBg = isDarkMode
    ? 'bg-[#111318] border-white/[0.08] hover:border-white/[0.16]'
    : 'bg-white border-zinc-200/90 shadow-xs hover:border-zinc-300';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      
      {/* ======================================================== */}
      {/* 1. HERO HEADER                                           */}
      {/* ======================================================== */}
      <div className="relative mb-10 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-zinc-500/15">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
            <span>Annual Calendar & Autonomous Advance Alerts Engine</span>
          </div>
          <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${textPrimary}`}>
            Special Days & National Observances
          </h1>
          <p className={`text-sm mt-2 max-w-3xl leading-relaxed ${textMuted}`}>
            Track Bangladesh national holidays (Mother Language Day, Independence Day, Pohela Boishakh, Victory Day) 
            and worldwide observances (Men's Day, Women's Day, Mother's Day, Father's Day) with automated 
            <strong className="text-indigo-400 font-semibold"> 1-2 day advance reminders</strong> dispatched straight to your Email & WhatsApp.
          </p>
        </div>

        {/* Year Selector Pill */}
        <div className="flex items-center gap-2 self-start sm:self-center bg-white/[0.04] p-1 rounded-xl border border-white/10 shrink-0">
          {[2026, 2027].map((yr) => (
            <button
              key={yr}
              onClick={() => setSelectedYear(yr)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedYear === yr
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              Year {yr}
            </button>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. STATS OVERVIEW CARDS                                  */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className={`card-lift p-4.5 rounded-2xl border backdrop-blur-xl transition-all ${cardBg}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs ${textMuted}`}>Total Observances</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-extrabold tabular-nums tracking-tight ${textPrimary}`}>{totalCount}</div>
          <div className={`text-[11px] font-medium ${textMuted}`}>Annual special days</div>
        </div>

        <div className={`card-lift p-4.5 rounded-2xl border backdrop-blur-xl transition-all ${cardBg}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs ${textMuted}`}>Active Subscriptions</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 tabular-nums tracking-tight">{subscribedCount}</div>
          <div className={`text-[11px] font-medium ${textMuted}`}>Alerts active for you</div>
        </div>

        <div className={`card-lift p-4.5 rounded-2xl border backdrop-blur-xl transition-all ${cardBg}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs ${textMuted}`}>Bangladesh Days</span>
            <span className="text-lg">🇧🇩</span>
          </div>
          <div className={`text-2xl font-extrabold tabular-nums tracking-tight ${textPrimary}`}>{bdCount}</div>
          <div className={`text-[11px] font-medium ${textMuted}`}>National & cultural events</div>
        </div>

        <div className={`card-lift p-4.5 rounded-2xl border backdrop-blur-xl transition-all ${cardBg}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs ${textMuted}`}>Worldwide & Family</span>
            <span className="text-lg">🌍</span>
          </div>
          <div className={`text-2xl font-extrabold tabular-nums tracking-tight ${textPrimary}`}>{globalCount}</div>
          <div className={`text-[11px] font-medium ${textMuted}`}>International celebrations</div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. 1-CLICK BATCH ACTION STRIP                            */}
      {/* ======================================================== */}
      <div className={`p-5 rounded-2xl border mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isDarkMode ? 'bg-gradient-to-r from-purple-950/20 via-indigo-950/20 to-transparent border-indigo-500/20' : 'bg-indigo-50/60 border-indigo-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <Zap className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className={`text-sm font-bold ${textPrimary}`}>1-Click Quick Alert Subscriptions</h3>
            <p className={`text-xs ${textMuted}`}>
              Never miss a national or family milestone. Subscribe to entire categories with pre-configured 1-2 day advance alerts.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleOpenBatchSub('bangladesh')}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition-all flex items-center gap-1.5"
          >
            <span>🇧🇩 Subscribe All BD Days ({bdCount})</span>
          </button>
          <button
            onClick={() => handleOpenBatchSub('all_global')}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition-all flex items-center gap-1.5"
          >
            <span>🌍 Subscribe All Global ({globalCount})</span>
          </button>
          <button
            onClick={() => handleOpenBatchSub('all')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              isDarkMode 
                ? 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-zinc-200' 
                : 'bg-white hover:bg-zinc-100 border-zinc-300 text-zinc-800'
            }`}
          >
            <span>Subscribe to All ({totalCount})</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. FILTER & SEARCH BAR                                   */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: `All Observances (${totalCount})` },
            { id: 'bangladesh', label: `🇧🇩 Bangladesh (${bdCount})` },
            { id: 'family', label: '👨‍👩‍👧 Family & Appreciation' },
            { id: 'international', label: '🌍 Global Days' },
            { id: 'subscribed', label: `⭐ Subscribed (${subscribedCount})` },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600/15 border-indigo-500 text-indigo-400 shadow-xs'
                  : isDarkMode
                  ? 'bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:text-white'
                  : 'bg-white border-zinc-200 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search day or celebration..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-8 pr-3 py-1.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
              isDarkMode 
                ? 'bg-white/[0.03] border-white/[0.08] text-white placeholder-zinc-500' 
                : 'bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400'
            }`}
          />
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. SPECIAL DAYS GRID CARDS                               */}
      {/* ======================================================== */}
      {loading ? (
        <div className="py-20 text-center">
          <RefreshCw className="w-8 h-8 mx-auto animate-spin text-indigo-500 mb-3" />
          <p className={`text-xs ${textMuted}`}>Loading annual calendar observances...</p>
        </div>
      ) : filteredDays.length === 0 ? (
        <div className={`p-12 text-center border rounded-2xl ${cardBg}`}>
          <Calendar className="w-10 h-10 mx-auto text-zinc-400 mb-3" />
          <h3 className={`text-sm font-bold ${textPrimary}`}>No special days found</h3>
          <p className={`text-xs mt-1 ${textMuted}`}>Try clearing your search query or switching categories.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDays.map((day) => {
            const isSub = day.is_subscribed;

            return (
              <div
                key={day.id}
                className={`card-lift border rounded-2xl p-5 flex flex-col justify-between backdrop-blur-xl ${cardBg} ${
                  isSub ? (isDarkMode ? 'ring-1 ring-emerald-500/30' : 'ring-1 ring-emerald-500/40') : ''
                }`}
              >
                <div>
                  {/* Card Header: Date & Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{day.icon}</span>
                      <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                        {day.formatted_date.slice(0, 6)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isSub && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                          <Check className="w-3 h-3" />
                          <span>Subscribed</span>
                        </span>
                      )}
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        day.status === 'today'
                          ? 'bg-rose-500/15 text-rose-400 border-rose-500/25 animate-pulse'
                          : day.status === 'passed'
                          ? 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
                          : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                      }`}>
                        {day.days_until === 0 
                          ? '🎉 Today' 
                          : day.days_until === 1 
                          ? 'Tomorrow' 
                          : day.days_until > 1 
                          ? `in ${day.days_until} days` 
                          : 'Passed this year'}
                      </span>
                    </div>
                  </div>

                  {/* Title in English and Bengali */}
                  <h3 className={`text-base font-bold leading-snug mb-0.5 ${textPrimary}`}>
                    {day.title}
                  </h3>
                  <div className="text-xs font-semibold text-purple-400 mb-2 font-bengali">
                    {day.title_bn}
                  </div>

                  {/* Description */}
                  <p className={`text-xs leading-relaxed line-clamp-3 mb-4 ${textMuted}`}>
                    {day.description}
                  </p>

                  {/* Advance Alert Features */}
                  <div className={`p-2.5 rounded-xl border mb-4 text-[11px] space-y-1 ${
                    isDarkMode ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-zinc-50 border-zinc-200'
                  }`}>
                    <div className="flex items-center justify-between text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Bell className="w-3 h-3 text-indigo-400" />
                        <span>Advance Reminder:</span>
                      </span>
                      <strong className="text-indigo-400">1 & 2 days before</strong>
                    </div>
                    <div className="flex items-center justify-between text-zinc-400">
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3 text-emerald-400" />
                        <span>Channels:</span>
                      </span>
                      <span className="text-zinc-300 font-medium">Email + WhatsApp</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action Button */}
                <div className="pt-3 border-t border-zinc-500/15 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 flex-wrap">
                    {day.tags.slice(0, 2).map((t) => (
                      <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-500/10 text-zinc-400">
                        {t}
                      </span>
                    ))}
                  </div>

                  {isSub ? (
                    <button
                      onClick={() => handleUnsubscribe(day.id, day.title)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all`}
                      title="Turn off reminders for this day"
                    >
                      Unsubscribe
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenSingleSub(day)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition-all flex items-center gap-1"
                    >
                      <span>+ Subscribe Alert</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. MODAL: CONFIGURE & ACTIVATE SUBSCRIPTION               */}
      {/* ======================================================== */}
      {isSubModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setIsSubModalOpen(false)}
        >
          <div 
            className={`relative w-full max-w-lg border rounded-3xl p-6 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 ${
              isDarkMode ? 'bg-[#0f111a] border-white/[0.12]' : 'bg-white border-zinc-200'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-500/20 mb-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={`text-base font-bold ${textPrimary}`}>
                    Activate Special Day Reminders
                  </h3>
                  <p className={`text-xs ${textMuted}`}>
                    {modalTargetDays.length === 1 
                      ? `Subscribing to: ${modalTargetDays[0].title}`
                      : `Batch subscribing to ${modalTargetDays.length} special days`}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsSubModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Days Tags Strip */}
            <div className="max-h-24 overflow-y-auto mb-4 flex flex-wrap gap-1.5 p-2 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              {modalTargetDays.map((d) => (
                <span key={d.id} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 flex items-center gap-1">
                  <span>{d.icon}</span>
                  <span>{d.title}</span>
                </span>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmSubscription} className="space-y-4">
              
              <div>
                <label className={`block text-xs font-semibold mb-1 ${textPrimary}`}>
                  Your Email Address (For Email Reminder) *
                </label>
                <input
                  type="email"
                  placeholder="e.g. user@gmail.com"
                  value={subEmail}
                  onChange={(e) => setSubEmail(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                    isDarkMode ? 'bg-white/[0.04] border-white/[0.1] text-white placeholder-zinc-500' : 'bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${textPrimary}`}>
                  WhatsApp Phone Number (For WhatsApp Greeting) *
                </label>
                <input
                  type="text"
                  placeholder="+8801711223344"
                  value={subPhone}
                  onChange={(e) => setSubPhone(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                    isDarkMode ? 'bg-white/[0.04] border-white/[0.1] text-white placeholder-zinc-500' : 'bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400'
                  }`}
                />
              </div>

              {/* Advance Lead Time Selection */}
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${textPrimary}`}>
                  When do you want to receive the alerts?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { days: 2, label: '2 Days Before' },
                    { days: 1, label: '1 Day Before' },
                    { days: 0, label: 'On the Day' },
                  ].map((item) => {
                    const isChecked = leadDays.includes(item.days);
                    return (
                      <button
                        type="button"
                        key={item.days}
                        onClick={() => {
                          if (isChecked) {
                            if (leadDays.length > 1) {
                              setLeadDays(leadDays.filter((d) => d !== item.days));
                            }
                          } else {
                            setLeadDays([...leadDays, item.days]);
                          }
                        }}
                        className={`p-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                          isChecked
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-xs'
                            : isDarkMode ? 'bg-white/[0.02] border-white/[0.06] text-zinc-400' : 'bg-zinc-50 border-zinc-200 text-zinc-600'
                        }`}
                      >
                        {isChecked ? '✓ ' : ''}{item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Channel checkboxes */}
              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={channelEmail}
                    onChange={(e) => setChannelEmail(e.target.checked)}
                    className="rounded border-zinc-600 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>✉️ Email Delivery</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={channelWhatsapp}
                    onChange={(e) => setChannelWhatsapp(e.target.checked)}
                    className="rounded border-zinc-600 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>💬 WhatsApp Delivery</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-zinc-500/20 flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsSubModalOpen(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border ${
                    isDarkMode ? 'border-white/10 text-zinc-400 hover:text-white' : 'border-zinc-200 text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Activating Alerts...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Activate Alerts ({modalTargetDays.length} Days)</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
