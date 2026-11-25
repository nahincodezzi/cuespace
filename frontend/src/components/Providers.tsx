'use client';

import React from 'react';
import { ThemeProvider } from 'next-themes';
import { MotionConfig } from 'framer-motion';
import { NowProvider } from '@/hooks/useNow';
import { BackgroundVideo } from '@/components/BackgroundVideo';
import { ScrollProgress } from '@/components/ScrollProgress';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange={false}
    >
      <MotionConfig reducedMotion="user">
        <NowProvider>
          <ScrollProgress />
          <BackgroundVideo />
          {children}
        </NowProvider>
      </MotionConfig>
    </ThemeProvider>
  );
}
