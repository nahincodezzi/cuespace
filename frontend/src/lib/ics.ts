import { SmartEvent } from '@/types/event';

export function generateIcsFile(event: SmartEvent): void {
  const dateFormatted = event.original_date.replace(/-/g, '');
  const timeFormatted = event.reminder_time.replace(/:/g, '').slice(0, 6);
  const startStamp = `${dateFormatted}T${timeFormatted}Z`;
  
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CueSpace//Smart Event SaaS//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id}@cuespace.app`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART:${startStamp}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description || 'Scheduled via CueSpace Timezone Engine'}`,
    `STATUS:CONFIRMED`,
    event.recurrence_type === 'YEARLY' ? 'RRULE:FREQ=YEARLY' : '',
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(Boolean).join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${event.title.toLowerCase().replace(/\s+/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
