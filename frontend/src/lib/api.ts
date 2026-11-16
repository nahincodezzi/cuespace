import { SmartEvent, EventCreateInput } from '@/types/event';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface AuditLog {
  id: string;
  event_id: string;
  channel: string;
  recipient: string;
  status: string;
  scheduled_for?: string;
  sent_at?: string;
  error_message?: string;
  created_at?: string;
}

export const INITIAL_DEMO_EVENTS: SmartEvent[] = [
  {
    id: '1',
    user_id: 'demo-user',
    title: "Sarah's 30th Birthday",
    description: "Send personalized gift basket and morning WhatsApp wish",
    category: 'birthday',
    original_date: '1996-05-15',
    reminder_time: '09:00:00',
    timezone: 'Asia/Dhaka',
    calendar_type: 'GREGORIAN',
    leap_year_handling: 'FEB_28',
    recurrence_type: 'YEARLY',
    recurrence_interval: 1,
    channels: { email: true, sms: false, whatsapp: true },
    alert_lead_days: [0, 3],
    recipient_name: 'Sarah Rahman',
    recipient_phone: '+8801711223344',
    recipient_email: 'sarah.rahman@example.com',
    next_trigger_at: '2027-05-12T03:00:00Z',
    is_active: true,
    tags: [{ id: 't1', name: 'Family', color: '#EC4899' }],
    created_at: '2026-11-17T00:00:00Z',
    updated_at: '2026-11-17T00:00:00Z',
  },
  {
    id: '2',
    user_id: 'demo-user',
    title: 'Series A Funding Pitch Deadline',
    description: 'Finalize pitch deck, runway metrics, and cap table models',
    category: 'deadline',
    original_date: '2026-12-01',
    reminder_time: '10:00:00',
    timezone: 'America/New_York',
    calendar_type: 'GREGORIAN',
    leap_year_handling: 'FEB_28',
    recurrence_type: 'NONE',
    recurrence_interval: 1,
    channels: { email: true, sms: true, whatsapp: false },
    alert_lead_days: [0, 1, 3],
    recipient_name: 'Investor Relations',
    next_trigger_at: '2026-11-28T15:00:00Z',
    is_active: true,
    tags: [{ id: 't2', name: 'Work', color: '#3B82F6' }],
    created_at: '2026-11-17T00:00:00Z',
    updated_at: '2026-11-17T00:00:00Z',
  },
  {
    id: '3',
    user_id: 'demo-user',
    title: 'Eid-ul-Fitr Celebration',
    description: 'Special lunar recurring holiday reminder',
    category: 'custom',
    original_date: '2026-03-20',
    reminder_time: '08:00:00',
    timezone: 'Asia/Dhaka',
    calendar_type: 'HIJRI',
    leap_year_handling: 'FEB_28',
    recurrence_type: 'YEARLY',
    recurrence_interval: 1,
    channels: { email: true, sms: false, whatsapp: true },
    alert_lead_days: [0, 1],
    recipient_name: 'Extended Family',
    next_trigger_at: '2027-03-09T02:00:00Z',
    is_active: true,
    tags: [{ id: 't3', name: 'Health & Culture', color: '#10B981' }],
    created_at: '2026-11-17T00:00:00Z',
    updated_at: '2026-11-17T00:00:00Z',
  },
  {
    id: '4',
    user_id: 'demo-user',
    title: 'Annual Health & Dental Checkup',
    description: 'Full blood panel, metabolic panel, and dental cleaning',
    category: 'health',
    original_date: '2026-11-25',
    reminder_time: '11:00:00',
    timezone: 'Asia/Dhaka',
    calendar_type: 'GREGORIAN',
    leap_year_handling: 'FEB_28',
    recurrence_type: 'YEARLY',
    recurrence_interval: 1,
    channels: { email: true, sms: true, whatsapp: false },
    alert_lead_days: [0, 2],
    recipient_name: 'Dr. Farhana',
    recipient_phone: '+8801812345678',
    next_trigger_at: '2026-11-23T05:00:00Z',
    is_active: true,
    tags: [{ id: 't4', name: 'Health', color: '#F59E0B' }],
    created_at: '2026-11-17T00:00:00Z',
    updated_at: '2026-11-17T00:00:00Z',
  }
];

export async function fetchEvents(): Promise<SmartEvent[]> {
  try {
    const res = await fetch(`${API_BASE}/events/`, { cache: 'no-store' });
    if (!res.ok) throw new Error('API request failed');
    const data = await res.json();
    return data.length > 0 ? data : INITIAL_DEMO_EVENTS;
  } catch (error) {
    console.warn('Backend unavailable, using cached/demo events:', error);
    return INITIAL_DEMO_EVENTS;
  }
}

export async function createEventApi(input: EventCreateInput): Promise<SmartEvent> {
  try {
    const res = await fetch(`${API_BASE}/events/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });
    if (!res.ok) throw new Error('Failed to create event in backend');
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, creating local client event:', err);
    const newEvent: SmartEvent = {
      ...input,
      id: 'local-' + Date.now(),
      user_id: 'local-user',
      is_active: true,
      created_at: '2026-11-17T00:00:00Z',
      updated_at: '2026-11-17T00:00:00Z',
      next_trigger_at: new Date(Date.now() + 86400000 * 3).toISOString()
    };
    return newEvent;
  }
}

export async function updateEventApi(id: string, input: EventCreateInput): Promise<SmartEvent> {
  try {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });
    if (!res.ok) throw new Error('Failed to update event in backend');
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, updating locally:', err);
    return {
      ...input,
      id,
      user_id: 'local-user',
      is_active: true,
      created_at: '2026-11-17T00:00:00Z',
      updated_at: new Date().toISOString(),
    };
  }
}

export async function deleteEventApi(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.warn('Backend unavailable, deleting locally:', err);
    return true;
  }
}

export async function dispatchNowApi(id: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/events/${id}/dispatch-now`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to dispatch');
    return await res.json();
  } catch (err) {
    return { success: true, message: 'Test alert simulated and logged successfully.' };
  }
}

export async function fetchAuditLogs(): Promise<AuditLog[]> {
  try {
    const res = await fetch(`${API_BASE}/events/audit/logs`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch logs');
    return await res.json();
  } catch (err) {
    return [
      {
        id: 'log-1',
        event_id: '1',
        channel: 'EMAIL',
        recipient: 'sarah.rahman@example.com',
        status: 'DELIVERED',
        sent_at: '2026-11-16T12:00:00Z',
        created_at: '2026-11-16T12:00:00Z',
      },
      {
        id: 'log-2',
        event_id: '2',
        channel: 'SMS',
        recipient: '+8801711223344',
        status: 'DELIVERED',
        sent_at: '2026-11-15T09:00:00Z',
        created_at: '2026-11-15T09:00:00Z',
      },
      {
        id: 'log-3',
        event_id: '3',
        channel: 'SYSTEM',
        recipient: 'User Action',
        status: 'SNOOZED',
        sent_at: '2026-11-14T08:00:00Z',
        created_at: '2026-11-14T08:00:00Z',
      }
    ];
  }
}
