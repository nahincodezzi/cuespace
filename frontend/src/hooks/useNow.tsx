'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';

interface NowContextType {
  now: Date;
  utcTime: string; // HH:mm
  utcSeconds: number;
  formatZone: (timeZone: string, includeSeconds?: boolean) => string;
}

const NowContext = createContext<NowContextType | null>(null);

// Static epoch date for SSR prerender safety
const STATIC_EPOCH = new Date(1764000000000);

export const NowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [now, setNow] = useState<Date>(STATIC_EPOCH);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setNow(new Date());

    let intervalId: NodeJS.Timeout;
    const delay = 1000 - (Date.now() % 1000);
    const timeoutId = setTimeout(() => {
      setNow(new Date());
      intervalId = setInterval(() => {
        setNow(new Date());
      }, 1000);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, []);

  const utcTime = useMemo(() => {
    if (!mounted) return '--:--';
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }, [now, mounted]);

  const utcSeconds = mounted ? now.getSeconds() : 0;

  const formatZone = useMemo(() => {
    const cache = new Map<string, Intl.DateTimeFormat>();
    return (timeZone: string, includeSeconds = false) => {
      if (!mounted) return '--:--';
      const key = `${timeZone}_${includeSeconds}`;
      if (!cache.has(key)) {
        cache.set(
          key,
          new Intl.DateTimeFormat('en-US', {
            timeZone,
            hour: '2-digit',
            minute: '2-digit',
            second: includeSeconds ? '2-digit' : undefined,
            hour12: true,
          })
        );
      }
      try {
        return cache.get(key)!.format(now);
      } catch {
        return now.toLocaleTimeString();
      }
    };
  }, [now, mounted]);

  return (
    <NowContext.Provider value={{ now, utcTime, utcSeconds, formatZone }}>
      {children}
    </NowContext.Provider>
  );
};

export function useNow(): NowContextType {
  const ctx = useContext(NowContext);
  if (!ctx) {
    throw new Error('useNow must be used within a NowProvider');
  }
  return ctx;
}
