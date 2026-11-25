'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface CityNodeData {
  id: string;
  name: string;
  timezone: string;
  angle: number; // in degrees (0 to 360)
  radiusPercent: number; // percentage from center (0 to 50)
  color?: string;
}

interface RadarNodeProps {
  node: CityNodeData;
  timeString: string;
  isActive: boolean;
  isPinged: boolean;
  onClick: () => void;
}

export const RadarNode: React.FC<RadarNodeProps> = ({
  node,
  timeString,
  isActive,
  isPinged,
  onClick,
}) => {
  // Convert polar coordinates to percentage X & Y (center is 50%, 50%)
  const rad = (node.angle * Math.PI) / 180;
  const x = 50 + node.radiusPercent * Math.cos(rad);
  const y = 50 + node.radiusPercent * Math.sin(rad);

  return (
    <div
      style={{ left: `${x}%`, top: `${y}%` }}
      className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
    >
      {/* Expanding Radar Ping Ring */}
      {isPinged && (
        <span className="absolute -inset-2.5 rounded-full border-2 border-[var(--accent)] animate-ping pointer-events-none opacity-80" />
      )}

      {/* Interactive City Button */}
      <button
        onClick={onClick}
        aria-label={`${node.name}: ${timeString}`}
        className={`group relative flex flex-col items-center p-2 rounded-2xl transition-all duration-300 border select-none ${
          isActive
            ? 'bg-[var(--node-active)] border-[var(--node-active-border)] shadow-[0_0_20px_var(--node-active-border)] scale-105'
            : 'bg-[var(--node-bg)] border-[var(--border)] hover:border-[var(--accent)] shadow-xs hover:scale-102'
        }`}
      >
        {/* Glowing Center Dot */}
        <div className="flex items-center gap-1.5 mb-1">
          <span
            className={`w-2 h-2 rounded-full transition-transform ${
              isActive ? 'bg-[var(--accent)] scale-125' : 'bg-[var(--muted)] group-hover:bg-[var(--accent)]'
            }`}
          />
          <span className="text-[11px] sm:text-xs font-bold tracking-tight text-[var(--fg)]">
            {node.name}
          </span>
        </div>

        {/* Live Local Time */}
        <span className="text-[10px] font-mono font-semibold text-[var(--muted-2)] tabular-nums">
          {timeString}
        </span>
      </button>
    </div>
  );
};
