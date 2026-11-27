'use client';

import React from 'react';
import { SmartEvent } from '@/types/event';
import { Hero } from './landing/Hero';
import { MetricsStrip } from './landing/MetricsStrip';
import { TimezoneRadar } from './landing/TimezoneRadar';
import { Features } from './landing/Features';
import { FinalCTA } from './landing/FinalCTA';
import { Footer } from './landing/Footer';

interface LandingPageProps {
  events: SmartEvent[];
  onOpenAddEvent: () => void;
  onOpenDashboard: () => void;
  onOpenAdmin: () => void;
  content?: any;
  isDarkMode?: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  events,
  onOpenAddEvent,
  onOpenDashboard,
  onOpenAdmin,
}) => {
  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* 1. Hero: copy left · live clock + notification stack right */}
      <Hero
        onOpenAddEvent={onOpenAddEvent}
        onOpenDashboard={onOpenDashboard}
      />

      {/* 2. MetricsStrip: 4 cards with count up & spotlight (2x2 on mobile) */}
      <MetricsStrip events={events} />

      {/* 3. TimezoneRadar: Signature radar visualizer with live UTC hub */}
      <TimezoneRadar
        events={events}
        onOpenAddEvent={onOpenAddEvent}
      />

      {/* 4. Features: 4 cards with unique animated icons & 3D tilt */}
      <Features />

      {/* 5. FinalCTA: Celestial scheduler call to action */}
      <FinalCTA onOpenAddEvent={onOpenAddEvent} />

      {/* 6. Footer: Brand copyright, links, and status */}
      <Footer onOpenAdmin={onOpenAdmin} />
    </div>
  );
};
