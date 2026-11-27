let themeTransitionTimer: ReturnType<typeof setTimeout> | null = null;
let themeTransitionRaf: number | null = null;

/**
 * Switches theme cleanly without CSS desynchronization, flicker, or abrupt color snaps.
 * Arms `.theme-transitioning` on <html> for one animation frame before flipping the theme
 * so all surfaces, borders, text, shadows, and background layers animate in lockstep.
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
