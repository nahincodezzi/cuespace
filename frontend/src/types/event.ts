export type CalendarType = 'GREGORIAN' | 'HIJRI' | 'BENGALI';
export type LeapYearHandling = 'FEB_28' | 'MARCH_1' | 'EXACT_ONLY';
export type EventCategory = 'birthday' | 'anniversary' | 'deadline' | 'health' | 'finance' | 'custom';

export interface Tag {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export interface NotificationChannels {
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
}

export interface SmartEvent {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: EventCategory;
  original_date: string;
  reminder_time: string;
  timezone: string;
  calendar_type: CalendarType;
  leap_year_handling: LeapYearHandling;
  recurrence_type: string;
  recurrence_interval: number;
  channels: NotificationChannels;
  alert_lead_days: number[];
  recipient_name?: string;
  recipient_phone?: string;
  recipient_email?: string;
  next_trigger_at?: string;
  last_triggered_at?: string;
  snooze_until?: string;
  is_active: boolean;
  tags?: Tag[];
  created_at: string;
  updated_at: string;
}

export interface EventCreateInput {
  title: string;
  description?: string;
  category: EventCategory;
  original_date: string;
  reminder_time: string;
  timezone: string;
  calendar_type: CalendarType;
  leap_year_handling: LeapYearHandling;
  recurrence_type: string;
  recurrence_interval: number;
  channels: NotificationChannels;
  alert_lead_days: number[];
  recipient_name?: string;
  recipient_phone?: string;
  recipient_email?: string;
  tag_ids?: string[];
}
