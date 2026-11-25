'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';

export const BackgroundVideo: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  const darkVideoRef = useRef<HTMLVideoElement>(null);
  const lightVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setMounted(true);
    // Detect prefers-reduced-motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(motionQuery.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    motionQuery.addEventListener('change', handleMotionChange);

    // Detect desktop screen width >= 768px for video playback
    const widthQuery = window.matchMedia('(min-width: 768px)');
    setIsDesktop(widthQuery.matches);
    const handleWidthChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    widthQuery.addEventListener('change', handleWidthChange);

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      widthQuery.removeEventListener('change', handleWidthChange);
    };
  }, []);

  const isDark = !mounted || resolvedTheme === 'dark';

  // Crossfade & Sync Playhead continuous tracking
  useEffect(() => {
    if (!mounted || reducedMotion || !isDesktop) return;

    const activeVideo = isDark ? darkVideoRef.current : lightVideoRef.current;
    const outgoingVideo = isDark ? lightVideoRef.current : darkVideoRef.current;

    if (activeVideo && outgoingVideo) {
      if (outgoingVideo.currentTime > 0) {
        try {
          activeVideo.currentTime = outgoingVideo.currentTime;
        } catch {}
      }
      activeVideo.play().catch(() => {});
      outgoingVideo.pause();
    } else if (activeVideo) {
      activeVideo.play().catch(() => {});
    }
  }, [isDark, mounted, reducedMotion, isDesktop]);

  // Pause on tab hide, resume on tab visible
  useEffect(() => {
    const handleVisibility = () => {
      const activeVideo = isDark ? darkVideoRef.current : lightVideoRef.current;
      if (!activeVideo) return;
      if (document.visibilityState === 'hidden') {
        activeVideo.pause();
      } else if (!reducedMotion && isDesktop) {
        activeVideo.play().catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isDark, reducedMotion, isDesktop]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none" aria-hidden="true">
      {/* Reduced-motion or Mobile Static Posters */}
      {(reducedMotion || !isDesktop) && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
          style={{
            backgroundImage: `url(${
              isDark ? '/cuespace-bg-dark-poster.jpg' : '/cuespace-bg-light-poster.jpg'
            })`,
          }}
        />
      )}

      {/* Looping Videos (Desktop, Motion-enabled) */}
      {!reducedMotion && isDesktop && (
        <>
          {/* Dark Loop */}
          <video
            ref={darkVideoRef}
            muted
            loop
            playsInline
            preload={isDark ? 'auto' : 'metadata'}
            poster="/cuespace-bg-dark-poster.jpg"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              isDark ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <source src="/cuespace-bg-dark.webm" type="video/webm" />
            <source src="/cuespace-bg-dark.mp4" type="video/mp4" />
          </video>

          {/* Light Loop */}
          <video
            ref={lightVideoRef}
            muted
            loop
            playsInline
            preload={!isDark ? 'auto' : 'metadata'}
            poster="/cuespace-bg-light-poster.jpg"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              !isDark ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <source src="/cuespace-bg-light.webm" type="video/webm" />
            <source src="/cuespace-bg-light.mp4" type="video/mp4" />
          </video>
        </>
      )}

      {/* Star-Dot Grid Texture Layer */}
      <div className="absolute inset-0 celestial-dots" />

      {/* Readability Gradient Vignette */}
      <div
        className={`absolute inset-0 bg-gradient-to-b from-transparent ${
          isDark
            ? 'via-[var(--bg)]/50 to-[var(--bg)]'
            : 'via-[var(--bg)]/40 to-[var(--bg)]'
        }`}
      />
    </div>
  );
};
