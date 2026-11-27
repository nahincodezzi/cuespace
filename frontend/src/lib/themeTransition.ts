import { flushSync } from 'react-dom';

let themeTransitionTimer: ReturnType<typeof setTimeout> | null = null;
let themeTransitionRaf: number | null = null;
let vtCleanupGuardTimer: ReturnType<typeof setTimeout> | null = null;
let activeCleanup: (() => void) | null = null;

/**
 * Switches theme using Chromium's GPU View Transitions API when supported,
 * executing DOM and React updates strictly synchronously inside the callback
 * so Chromium never hits a DOM update timeout.
 * Falls back to synchronized CSS transitions on browsers without View Transitions.
 */
export function switchThemeSmoothly(
  setTheme: (theme: string) => void,
  nextTheme: 'light' | 'dark'
): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    setTheme(nextTheme);
    return;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    setTheme(nextTheme);
    return;
  }

  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => {
      ready: Promise<void>;
      finished: Promise<void>;
      updateCallbackDone: Promise<void>;
      skipTransition: () => void;
    };
  };

  if (typeof doc.startViewTransition === 'function') {
    // Clean up any leftover previous transition styles before starting a new one
    if (activeCleanup) {
      activeCleanup();
    }

    const root = document.documentElement;
    const disableStyle = document.createElement('style');
    disableStyle.setAttribute('data-cue-vt', 'true');
    disableStyle.textContent = `
      *, *::before, *::after {
        transition: none !important;
      }
    `;

    // Kick off incoming background video playback immediately without blocking callback
    const incomingVideo = document.querySelector<HTMLVideoElement>(
      `video[data-theme-video="${nextTheme}"]`
    );
    if (incomingVideo && incomingVideo.paused) {
      incomingVideo.play().catch(() => {});
    }

    let cleaned = false;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      disableStyle.remove();
      if (vtCleanupGuardTimer) {
        clearTimeout(vtCleanupGuardTimer);
        vtCleanupGuardTimer = null;
      }
      if (activeCleanup === cleanup) {
        activeCleanup = null;
      }
    };

    activeCleanup = cleanup;
    vtCleanupGuardTimer = setTimeout(cleanup, 750);

    try {
      const transition = doc.startViewTransition(() => {
        document.head.appendChild(disableStyle);

        root.classList.remove('light', 'dark', 'theme-transitioning');
        root.classList.add(nextTheme);
        root.style.colorScheme = nextTheme;

        flushSync(() => {
          setTheme(nextTheme);
        });
      });

      // Prevent unhandled promise rejections on aborted/skipped transitions
      transition.updateCallbackDone.catch(() => {});
      transition.ready.catch(() => {});
      transition.finished.catch(() => {}).finally(cleanup);
      return;
    } catch {
      cleanup();
    }
  }

  // Fallback for browsers without View Transitions API
  const root = document.documentElement;

  if (themeTransitionTimer) {
    clearTimeout(themeTransitionTimer);
    themeTransitionTimer = null;
  }
  if (themeTransitionRaf !== null) {
    cancelAnimationFrame(themeTransitionRaf);
    themeTransitionRaf = null;
  }

  root.classList.add('theme-transitioning');

  themeTransitionRaf = requestAnimationFrame(() => {
    themeTransitionRaf = null;
    setTheme(nextTheme);
    themeTransitionTimer = setTimeout(() => {
      root.classList.remove('theme-transitioning');
      themeTransitionTimer = null;
    }, 540);
  });
}
