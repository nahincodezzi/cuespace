'use client';

import React, { useEffect } from 'react';
import { Bell, Sparkles, X, Clock, MessageSquare, Check, ExternalLink } from 'lucide-react';

export interface LiveAlertItem {
  id: string;
  title: string;
  category: string;
  description: string;
  original_date: string;
  reminder_time: string;
  timezone: string;
  recipient_name: string;
  recipient_email?: string;
  recipient_phone?: string;
  triggered_at: string;
  channels: {
    email?: boolean;
    whatsapp?: boolean;
    sms?: boolean;
  };
}

interface LiveAlarmModalProps {
  alert: LiveAlertItem;
  onDismiss: () => void;
  onSnooze: (alertId: string, hours: number) => void;
  isDarkMode: boolean;
}

export function playNotificationChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // First note: 880Hz (A5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.exponentialRampToValueAtTime(1108.73, now + 0.15);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.7);

    // Harmonic chime note: 1318.51Hz (E6)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1318.51, now + 0.18);
    gain2.gain.setValueAtTime(0.25, now + 0.18);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.18);
    osc2.stop(now + 1.2);
  } catch (err) {
    // Handled silently
  }
}

export const LiveAlarmModal: React.FC<LiveAlarmModalProps> = ({
  alert,
  onDismiss,
  onSnooze,
  isDarkMode,
}) => {
  useEffect(() => {
    playNotificationChime();
  }, [alert.id]);

  const waLink = alert.recipient_phone
    ? `https://wa.me/${alert.recipient_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
        `CueSpace Alert: ${alert.title}! Wishing you all the best!`
      )}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className={`relative w-full max-w-lg border rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 ring-2 ring-indigo-500/30 ${
          isDarkMode ? 'bg-[#0e1017] border-indigo-500/40 text-white' : 'bg-white border-zinc-200 text-zinc-950'
        }`}
      >
        {/* Pulsing Glow Background */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-500/20 mb-5 relative z-10">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/40">
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-indigo-400">
                  🔔 Real-Time Reminder Fired!
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-semibold">
                  LIVE
                </span>
              </div>
              <h2 className="text-base font-extrabold tracking-tight mt-0.5">
                {alert.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
            title="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Box */}
        <div className="space-y-4 relative z-10">
          <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
            isDarkMode ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-zinc-50 border-zinc-200'
          }`}>
            <p className="text-sm font-semibold mb-2 text-indigo-400">
              {alert.description || 'Special milestone reminder scheduled in CueSpace.'}
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400 pt-2 border-t border-zinc-500/15">
              <div>
                <span>📅 Scheduled Date:</span>{' '}
                <strong className={isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}>{alert.original_date}</strong>
              </div>
              <div>
                <span>⏰ Time:</span>{' '}
                <strong className={isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}>{alert.reminder_time}</strong> ({alert.timezone})
              </div>
              {alert.recipient_name && (
                <div className="col-span-2">
                  <span>Recipient:</span>{' '}
                  <strong className={isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}>{alert.recipient_name}</strong>
                  {alert.recipient_email ? ` (${alert.recipient_email})` : ''}
                </div>
              )}
            </div>
          </div>

          {/* Delivery Channels status */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-400">Delivered via:</span>
            {alert.channels.email && (
              <span className="px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 font-medium text-[11px]">
                ✉️ Email Dispatched
              </span>
            )}
            {alert.channels.whatsapp && (
              <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 font-medium text-[11px]">
                💬 WhatsApp Prepared
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-5 border-t border-zinc-500/20 flex flex-wrap items-center justify-between gap-2.5 mt-5 relative z-10">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSnooze(alert.id, 1)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                isDarkMode ? 'bg-white/[0.05] border-white/10 hover:bg-white/10 text-zinc-200' : 'bg-zinc-100 border-zinc-300 hover:bg-zinc-200 text-zinc-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Snooze 1h</span>
            </button>
            <button
              onClick={() => onSnooze(alert.id, 24)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                isDarkMode ? 'bg-white/[0.05] border-white/10 hover:bg-white/10 text-zinc-200' : 'bg-zinc-100 border-zinc-300 hover:bg-zinc-200 text-zinc-800'
              }`}
            >
              Snooze 1 Day
            </button>
          </div>

          <div className="flex items-center gap-2">
            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition-all flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open WhatsApp</span>
              </a>
            )}
            <button
              onClick={onDismiss}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition-all"
            >
              Dismiss
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
