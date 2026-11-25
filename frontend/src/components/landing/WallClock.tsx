'use client';

import React from 'react';
import { useNow } from '@/hooks/useNow';
import { Globe, Clock } from 'lucide-react';

export const WallClock: React.FC<{ className?: string }> = ({ className }) => {
  const { formatZone } = useNow();
  const dhakaTime = formatZone('Asia/Dhaka', true);

  return (
    <div
      className={`animate-floaty p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] backdrop-blur-xl shadow-[var(--shadow)] flex items-center justify-between gap-4 max-w-[280px] ${className || ''}`}
    >
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-[var(--node-active)] border border-[var(--node-active-border)] flex items-center justify-center text-[var(--accent-text)]">
          <Clock className="w-4 h-4" />
        </div>
        <div className="text-left">
          <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[var(--muted-2)] block">
            Wall Clock
          </span>
          <span className="text-xs font-semibold text-[var(--fg)]">Asia/Dhaka</span>
        </div>
      </div>

      <div className="font-mono text-sm font-bold text-[var(--accent-text)] tracking-tight tabular-nums">
        {dhakaTime}
      </div>
    </div>
  );
};
