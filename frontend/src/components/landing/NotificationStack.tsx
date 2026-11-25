'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cake, Mail, MessageSquare, Sparkles } from 'lucide-react';

const NOTIFICATIONS = [
  {
    id: 1,
    title: "Sarah's 30th birthday",
    subtitle: 'in 2 hours · Asia/Dhaka',
    icon: Cake,
    color: 'var(--amber)',
    tag: 'Birthday',
  },
  {
    id: 2,
    title: 'Email sent to 4 recipients',
    subtitle: 'Automated delivery via Resend SMTP',
    icon: Mail,
    color: 'var(--indigo-text)',
    tag: 'Email Dispatched',
  },
  {
    id: 3,
    title: 'WhatsApp greeting prepared',
    subtitle: '1-click snooze available · 3h',
    icon: MessageSquare,
    color: 'var(--green)',
    tag: 'WhatsApp Ready',
  },
];

export const NotificationStack: React.FC<{ className?: string }> = ({ className }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const cycle = () => {
      if (document.visibilityState !== 'hidden') {
        setIndex((prev) => (prev + 1) % NOTIFICATIONS.length);
      }
    };
    timer = setInterval(cycle, 3000);
    return () => clearInterval(timer);
  }, []);

  const active = NOTIFICATIONS[index];
  const Icon = active.icon;

  return (
    <div className={`relative h-24 w-full max-w-[340px] flex items-center justify-center ${className || ''}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={active.id}
          initial={{ opacity: 0, y: 14, scale: 0.96, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -14, scale: 0.96, filter: 'blur(4px)' }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="w-full p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--toast)] backdrop-blur-xl shadow-[var(--shadow)] flex items-center gap-3.5"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${active.color}18`, color: active.color }}
          >
            <Icon className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center justify-between gap-1 mb-0.5">
              <span className="text-xs font-bold text-[var(--fg)] truncate">{active.title}</span>
              <span
                className="text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded-full"
                style={{ backgroundColor: `${active.color}18`, color: active.color }}
              >
                {active.tag}
              </span>
            </div>
            <p className="text-[11px] text-[var(--muted)] truncate">{active.subtitle}</p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
