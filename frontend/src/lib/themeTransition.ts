import { flushSync } from 'react-dom';

let themeTransitionTimer: ReturnType<typeof setTimeout> | null = null;
let themeTransitionRaf: number | null = null;
let vtCleanupGuardTimer: ReturnType<typeof setTimeout> | null = null;
let isVtSwitching = false;

function nextPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

function warmThemeVideo(nextTheme: 'light' | 'dark'): Promise<void> {
  const video = document.querySelector<HTMLVideoElement>(
    `video[data-theme-video="${nextTheme}"]`
  );
  if (!video) return Promise.resolve();

  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (!settled) {
        settled = true;
        resolve();
      }
    };

    const timeoutId = setTimeout(finish, 120);

    video
      .play()
      .then(() => {
        const rvfc = (
          video as HTMLVideoElement & {
            requestVideoFrameCallback?: (cb: () => void) => number;
          }
        ).requestVideoFrameCallback;

        if (typeof rvfc === 'function') {
          rvfc.call(video, () => {
            clearTimeout(timeoutId);
            finish();
          });
        } else if (video.readyState >= 2) {
          clearTimeout(timeoutId);
          finish();
        }
      })
      .catch(() => {
        clearTimeout(timeoutId);
        finish();
      });
  });
}

/**
 * Switches theme using Chromium's GPU View Transitions API when supported,
 * avoiding per-frame backdrop-blur recomputation, video decoder stalls,
 * and CSS color-scheme repaints. Falls back to synchronized CSS transitions.
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
    startViewTransition?: (cb: () => void | Promise<void>) => {
      ready: Promise<void>;
      finished: Promise<void>;
      updateCallbackDone: Promise<void>;
    };
  };

  if (typeof doc.startViewTransition === 'function') {
    if (isVtSwitching) return;
    isVtSwitching = true;

    const root = document.documentElement;
    const disableStyle = document.createElement('style');
    disableStyle.setAttribute('data-cue-vt', 'true');
    disableStyle.textContent = `
      *, *::before, *::after {
        transition: none !important;
      }
    `;

    let cleaned = false;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      disableStyle.remove();
      isVtSwitching = false;
      if (vtCleanupGuardTimer) {
        clearTimeout(vtCleanupGuardTimer);
        vtCleanupGuardTimer = null;
      }
    };

    vtCleanupGuardTimer = setTimeout(cleanup, 800);

    try {
      const transition = doc.startViewTransition(async () => {
        document.head.appendChild(disableStyle);

        root.classList.remove('light', 'dark', 'theme-transitioning');
        root.classList.add(nextTheme);
        root.style.colorScheme = nextTheme;

        flushSync(() => {
          setTheme(nextTheme);
        });

        await warmThemeVideo(nextTheme);
        await nextPaint();
      });

      transition.finished.finally(cleanup);
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
