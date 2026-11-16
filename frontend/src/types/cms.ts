export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  tag: string;
  iconName: string;
}

export interface LandingContent {
  heroBadge: string;
  heroTitlePrefix: string;
  heroHighlight: string;
  heroTitleSuffix: string;
  heroSubtitle: string;
  ctaPrimaryText: string;
  ctaSecondaryText: string;
  features: FeatureItem[];
  footerNotice: string;
}

export const DEFAULT_LANDING_CONTENT: LandingContent = {
  heroBadge: 'Smart event & notification flow',
  heroTitlePrefix: 'Never miss a',
  heroHighlight: 'moment that matters',
  heroTitleSuffix: '',
  heroSubtitle: 'Timezone-aware reminders for birthdays, anniversaries, and critical deadlines. Automated multi-channel dispatch via Email, SMS & WhatsApp with 1-click snooze.',
  ctaPrimaryText: 'Schedule First Event',
  ctaSecondaryText: 'Explore Timezone Radar',
  footerNotice: 'Designed with Linear, Vercel & CueSpace aesthetics. Powered by FastAPI & Next.js.',
  features: [
    {
      id: 'f1',
      title: 'Autonomous Timezone Engine',
      description: 'Never worry about timezone shifts or Daylight Saving Time. Reminders fire in the exact local wall-clock hour across 400+ IANA zones.',
      tag: 'Global Sync',
      iconName: 'Globe'
    },
    {
      id: 'f2',
      title: 'Multi-Channel Delivery',
      description: 'Dispatch alerts directly via Resend transactional email, Twilio SMS, and WhatsApp with instant pre-filled greeting links.',
      tag: 'Omnichannel',
      iconName: 'BellRing'
    },
    {
      id: 'f3',
      title: 'Stateless 1-Click Snooze',
      description: 'Notification emails contain tamper-proof HMAC tokens allowing users to snooze for 3 hours or 1 day without logging in.',
      tag: 'Frictionless',
      iconName: 'Clock'
    },
    {
      id: 'f4',
      title: 'Leap Year & Regional Calendars',
      description: 'Built-in handling for Feb 29 leap years (Feb 28 vs Mar 1) and astronomical conversion for Hijri lunar and Bengali solar calendars.',
      tag: 'Smart Logic',
      iconName: 'Calendar'
    }
  ]
};
