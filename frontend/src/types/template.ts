export interface EmailTemplate {
  id: string;
  name: string;
  category: 'birthday' | 'deadline' | 'anniversary' | 'health' | 'general' | 'custom';
  subject: string;
  body: string;
  isCustom?: boolean;
}

export const DEFAULT_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'formal-birthday',
    name: 'Formal Birthday Wishes',
    category: 'birthday',
    subject: 'Warm Birthday Wishes on Your Special Day, {{recipient_name}}! 🎉',
    body: 'Dear {{recipient_name}},\n\nOn behalf of everyone at CueSpace, we extend our warmest wishes on your birthday!\n\nMay this year bring you abundant joy, good health, and continued success in all your endeavors.\n\nWarm regards,\nCueSpace Notifications'
  },
  {
    id: 'official-deadline',
    name: 'Executive Milestone & Deadline Alert',
    category: 'deadline',
    subject: 'Action Required: {{event_title}} is due on {{event_date}}',
    body: 'Dear {{recipient_name}},\n\nThis is an automated priority reminder regarding "{{event_title}}", scheduled for {{event_date}} at {{event_time}} ({{timezone}}).\n\nPlease ensure all deliverables or preparation are finalized prior to the deadline.\n\nSincerely,\nCueSpace Scheduler'
  },
  {
    id: 'formal-anniversary',
    name: 'Distinguished Anniversary Congratulations',
    category: 'anniversary',
    subject: 'Heartiest Congratulations on Your Anniversary, {{recipient_name}}!',
    body: 'Dear {{recipient_name}},\n\nSending our sincerest congratulations on reaching this remarkable anniversary milestone.\n\nMay your journey ahead continue to be blessed with happiness, harmony, and cherished memories.\n\nBest wishes,\nCueSpace Team'
  },
  {
    id: 'health-consultation',
    name: 'Medical & Health Appointment Reminder',
    category: 'health',
    subject: 'Upcoming Health Reminder: {{event_title}} on {{event_date}}',
    body: 'Dear {{recipient_name}},\n\nA gentle reminder for your scheduled appointment: "{{event_title}}" on {{event_date}} at {{event_time}}.\n\nPlease remember to bring any required documentation or medical reports.\n\nWarm regards,\nCueSpace Health Desk'
  },
  {
    id: 'custom-user-template',
    name: 'Custom Professional Template',
    category: 'custom',
    subject: 'Important Reminder: {{event_title}}',
    body: 'Hello {{recipient_name}},\n\nThis is a notification regarding {{event_title}} on {{event_date}}.\n\nThank you,\nCueSpace'
  }
];

const STORAGE_KEY = 'cuespace_email_templates_v1';

export function getStoredTemplates(): EmailTemplate[] {
  if (typeof window === 'undefined') return DEFAULT_EMAIL_TEMPLATES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_EMAIL_TEMPLATES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_EMAIL_TEMPLATES;
  } catch {
    return DEFAULT_EMAIL_TEMPLATES;
  }
}

export function saveStoredTemplates(templates: EmailTemplate[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  } catch {
    // Graceful fallback
  }
}

export function renderEmailTemplate(
  template: EmailTemplate,
  variables: {
    recipient_name?: string;
    event_title?: string;
    event_date?: string;
    event_time?: string;
    timezone?: string;
  }
): { subject: string; body: string } {
  let sub = template.subject;
  let txt = template.body;

  const replaceMap: Record<string, string> = {
    '{{recipient_name}}': variables.recipient_name || 'Valued Recipient',
    '{{event_title}}': variables.event_title || 'Special Event',
    '{{event_date}}': variables.event_date || 'Upcoming Date',
    '{{event_time}}': variables.event_time || '09:00 AM',
    '{{timezone}}': variables.timezone || 'UTC'
  };

  for (const [k, v] of Object.entries(replaceMap)) {
    sub = sub.replaceAll(k, v);
    txt = txt.replaceAll(k, v);
  }

  return { subject: sub, body: txt };
}
