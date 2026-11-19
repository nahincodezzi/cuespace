export interface SpecialDay {
  id: string;
  title: string;
  title_bn: string;
  category: 'bangladesh' | 'international' | 'family';
  rule: string;
  month: number;
  day: number;
  icon: string;
  description: string;
  tags: string[];
  default_lead_days: number[];
  wish_template: string;
  year: number;
  date: string;
  month_name: string;
  formatted_date: string;
  days_until: number;
  status: 'passed' | 'today' | 'upcoming';
  is_subscribed: boolean;
  subscribed_event_id?: string;
}

export interface SpecialDaysResponse {
  year: number;
  total_count: number;
  subscribed_count: number;
  special_days: SpecialDay[];
}

export interface SubscribeSpecialDaysPayload {
  day_ids: string[];
  year: number;
  recipient_email?: string;
  recipient_phone?: string;
  recipient_name?: string;
  channels: {
    email: boolean;
    whatsapp: boolean;
    sms: boolean;
  };
  alert_lead_days: number[];
  timezone: string;
}
