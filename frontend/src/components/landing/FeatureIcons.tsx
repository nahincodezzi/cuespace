'use client';

import React from 'react';
import { Globe, Bell, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

// 1. Timezone Engine: Globe line icon slowly rotating (14 s)
export const RotatingGlobeIcon: React.FC = () => {
  return (
    <div className="w-12 h-12 rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] flex items-center justify-center text-[var(--accent-text)] overflow-hidden">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
      >
        <Globe className="w-6 h-6" />
      </motion.div>
    </div>
  );
};

// 2. Multi-channel Delivery: Three dots (indigo / green / amber) pinging in sequence (0 / .3 / .6 s)
export const ChannelPingsIcon: React.FC = () => {
  return (
    <div className="w-12 h-12 rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] flex items-center justify-center gap-1.5 px-2">
      <motion.span
        animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
        className="w-2.5 h-2.5 rounded-full"
        style={{ backgroundColor: 'var(--indigo-text)' }}
      />
      <motion.span
        animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 }}
        className="w-2.5 h-2.5 rounded-full"
        style={{ backgroundColor: 'var(--green)' }}
      />
      <motion.span
        animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.2, repeat: Infinity, delay: 0.6 }}
        className="w-2.5 h-2.5 rounded-full"
        style={{ backgroundColor: 'var(--amber)' }}
      />
    </div>
  );
};

// 3. 1-Click Snooze: "zZ" in Geist Mono floating up and fading on a 4 s loop
export const FloatingSnoozeIcon: React.FC = () => {
  return (
    <div className="relative w-12 h-12 rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] flex items-center justify-center text-[var(--amber)] overflow-hidden font-mono font-bold">
      <Clock className="w-5 h-5 text-[var(--muted-2)]" />
      <motion.span
        animate={{ y: [4, -14], opacity: [0, 1, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute text-xs font-mono font-bold text-[var(--amber)] top-2 right-2"
      >
        zZ
      </motion.span>
    </div>
  );
};

// 4. Leap Year & Regional Calendars: Mini calendar tile "FEB / 29"; flips on hover
export const FlippingCalendarIcon: React.FC = () => {
  return (
    <div className="w-12 h-12 rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] flex items-center justify-center perspective-[600px]">
      <motion.div
        whileHover={{ rotateX: 180 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-8 h-8 rounded-lg border border-[var(--border)] bg-[var(--surface)] flex flex-col items-center justify-center text-center font-mono select-none"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <span className="text-[7px] font-bold text-[var(--muted-2)] uppercase leading-none block">
          FEB
        </span>
        <span className="text-[10px] font-bold text-[var(--accent-text)] leading-none mt-0.5 block">
          29
        </span>
      </motion.div>
    </div>
  );
};
