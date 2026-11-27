'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';

export const BackgroundVideo: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [darkVideoReady, setDarkVideoReady] = useState(false);
  const [lightVideoReady, setLightVideoReady] = useState(false);

  const darkVideoRef = useRef<HTMLVideoElement>(null);
  const lightVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setMounted(true);

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(motionQuery.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    motionQuery.addEventListener('change', handleMotionChange);

    const widthQuery = window.matchMedia('(min-width: 768px)');
    setIsDesktop(widthQuery.matches);
    const handleWidthChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    widthQuery.addEventListener('change', handleWidthChange);

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      widthQuery.removeEventListener('change', handleWidthChange);
    };
  }, []);

  // Catch already-buffered videos if loaded before React attached handlers
  useEffect(() => {
    if (!mounted || reducedMotion || !isDesktop) return;
    if (darkVideoRef.current && darkVideoRef.current.readyState >= 2) {
      setDarkVideoReady(true);
    }
    if (lightVideoRef.current && lightVideoRef.current.readyState >= 2) {
      setLightVideoReady(true);
    }
  }, [mounted, reducedMotion, isDesktop]);

  const isDark = !mounted || resolvedTheme === 'dark';

  // Play active ambient loop immediately without forcing a network seek,
  // and pause the outgoing video only AFTER the 480ms opacity crossfade completes.
  useEffect(() => {
    if (!mounted || reducedMotion || !isDesktop) return;

    const activeVideo = isDark ? darkVideoRef.current : lightVideoRef.current;
    const outgoingVideo = isDark ? lightVideoRef.current : darkVideoRef.current;

    if (activeVideo) {
      activeVideo.play().catch(() => {});
    }

    if (!outgoingVideo) return;

    const pauseTimer = setTimeout(() => {
      outgoingVideo.pause();
    }, 540);

    return () => clearTimeout(pauseTimer);
  }, [isDark, mounted, reducedMotion, isDesktop]);

  // Pause on tab hide, resume active loop on tab visible
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
    <div
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none bg-[#07060B]"
      aria-hidden="true"
    >
      {/* BOTTOM LAYER: Dark Mode Theme Stack (always opaque; no transparency dip during crossfade) */}
      <div className="absolute inset-0 bg-[#07060B]">
        <img
          src="/cuespace-bg-dark-poster.jpg"
          alt=""
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {!reducedMotion && isDesktop && (
          <video
            ref={darkVideoRef}
            muted
            loop
            playsInline
            preload="auto"
            onLoadedData={() => setDarkVideoReady(true)}
            onCanPlay={() => setDarkVideoReady(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              darkVideoReady ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <source src="/cuespace-bg-dark.webm" type="video/webm" />
            <source src="/cuespace-bg-dark.mp4" type="video/mp4" />
          </video>
        )}

        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(rgb(255 255 255 / 0.35) 1px, transparent 1px)',
            backgroundSize: '46px 46px',
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, transparent, rgb(7 6 11 / 0.5) 55%, #07060B)',
          }}
        />
      </div>

      {/* TOP LAYER: Light Mode Theme Stack (CSS html.dark vs html:not(.dark) controls initial state,
          `.theme-fade` ensures 480ms GPU crossfade during active theme switches) */}
      <div
        className="light-theme-layer theme-fade absolute inset-0 bg-[#F8F6FF] will-change-[opacity]"
        style={{ transform: 'translateZ(0)' }}
      >
        <img
          src="/cuespace-bg-light-poster.jpg"
          alt=""
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {!reducedMotion && isDesktop && (
          <video
            ref={lightVideoRef}
            muted
            loop
            playsInline
            preload="auto"
            onLoadedData={() => setLightVideoReady(true)}
            onCanPlay={() => setLightVideoReady(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              lightVideoReady ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <source src="/cuespace-bg-light.webm" type="video/webm" />
            <source src="/cuespace-bg-light.mp4" type="video/mp4" />
          </video>
        )}

        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(rgb(76 29 149 / 0.55) 1px, transparent 1px)',
            backgroundSize: '46px 46px',
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, transparent, rgb(248 246 255 / 0.4) 55%, #F8F6FF)',
          }}
        />
      </div>
    </div>
  );
};
