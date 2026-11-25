'use client';

import React, { useEffect } from 'react';
import { Bell, Sparkles, X, Clock, MessageSquare, Check, ExternalLink, Volume2 } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div 
        className={`card-lift relative w-full max-w-lg border rounded-3xl p-6 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 ring-2 ring-indigo-500/40 ${
          isDarkMode 
            ? 'bg-[#0d0f18]/95 border-indigo-500/40 text-white' 
            : 'bg-white/95 border-zinc-200 text-zinc-950'
        }`}
      >
        {/* Pulsing Glow Background */}
        <div className="absolute -top-20 -right-20 w-52 h-52 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-52 h-52 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5 relative z-10">
          <div className="flex items-center gap-3">
            {/* Animated Soundwave Bell */}
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-600/40">
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping" />
              <Bell className="w-5 h-5 animate-bounce" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-indigo-400">
                  Real-Time Alarm Active
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE
                </span>
              </div>
              <h2 className="text-lg font-extrabold tracking-tight mt-0.5 truncate max-w-xs sm:max-w-sm">
                {alert.title}
              </h2>
            </div>
          </div>

          {/* Equalizer Wave Visualizer */}
          <div className="flex items-end gap-1 h-6 px-2 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
            <span className="w-1 bg-indigo-400 rounded-full animate-soundwave-1" />
            <span className="w-1 bg-indigo-400 rounded-full animate-soundwave-2" />
            <span className="w-1 bg-indigo-400 rounded-full animate-soundwave-3" />
            <span className="w-1 bg-indigo-400 rounded-full animate-soundwave-4" />
          </div>

          <button
            onClick={onDismiss}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-all btn-press ml-1"
            title="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Details */}
        <div className="space-y-4 relative z-10">
          <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
            isDarkMode ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-zinc-50 border-zinc-200'
          }`}>
            <p className="text-sm font-semibold mb-2.5 text-indigo-400 leading-snug">
              {alert.description || 'Special milestone reminder scheduled in CueSpace.'}
            </p>
            
            <div className="grid grid-cols-2 gap-3 text-[11px] text-zinc-400 pt-3 border-t border-white/[0.06]">
              <div>
                <span>📅 Scheduled Date:</span>{' '}
                <strong className={isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}>{alert.original_date}</strong>
              </div>
              <div>
                <span>⏰ Time:</span>{' '}
                <strong className={isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}>{alert.reminder_time}</strong> ({alert.timezone})
              </div>
              {alert.recipient_name && (
                <div className="col-span-2">
                  <span>👤 Recipient:</span>{' '}
                  <strong className={isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}>{alert.recipient_name}</strong>
                  {alert.recipient_email && ` (${alert.recipient_email})`}
                </div>
              )}
            </div>
          </div>

          {/* Quick Snooze Chips */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2 block">
              Quick Snooze
            </span>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: '+15m', hours: 0.25 },
                { label: '+1 Hour', hours: 1 },
                { label: '+3 Hours', hours: 3 },
                { label: 'Tomorrow', hours: 24 },
              ].map((sn) => (
                <button
                  key={sn.label}
                  onClick={() => onSnooze(alert.id, sn.hours)}
                  className={`btn-press py-2 px-2.5 rounded-xl text-xs font-semibold border text-center transition-all ${
                    isDarkMode
                      ? 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-zinc-200 hover:border-indigo-500/30'
                      : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-800'
                  }`}
                >
                  {sn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-3 pt-2">
            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-press flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Message on WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
            )}

            <button
              onClick={onDismiss}
              className={`btn-press py-3 px-5 rounded-xl text-xs font-bold border transition-all ${
                waLink ? 'w-auto' : 'w-full'
              } ${
                isDarkMode 
                  ? 'bg-white/[0.06] hover:bg-white/[0.1] border-white/10 text-white' 
                  : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-900'
              }`}
            >
              Acknowledge & Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
