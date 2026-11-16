import { LandingContent, DEFAULT_LANDING_CONTENT } from '@/types/cms';

const STORAGE_KEY = 'cuespace_landing_cms_content';

export function getLandingContent(): LandingContent {
  if (typeof window === 'undefined') return DEFAULT_LANDING_CONTENT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_LANDING_CONTENT;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_LANDING_CONTENT;
  }
}

export function saveLandingContent(content: LandingContent): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
  } catch (e) {
    console.error('Failed to save CMS content:', e);
  }
}
