'use client';

import React from 'react';
import { SmartEvent } from '@/types/event';
import { Reveal } from '@/components/motion/Reveal';
import { CountUp } from '@/components/motion/CountUp';
import { Spotlight } from '@/components/motion/Spotlight';
import { useNow } from '@/hooks/useNow';
import { Calendar, Clock, Bell, Globe } from 'lucide-react';

interface MetricsStripProps {
  events: SmartEvent[];
}

export const MetricsStrip: React.FC<MetricsStripProps> = ({ events }) => {
  const { now } = useNow();
  const total = events.length;

  const nextWeek = new Date(now.getTime() + 7 * 86400000);

  const upcomingSoon = events.filter((ev) => {
    if (!ev.next_trigger_at) return false;
    const trigger = new Date(ev.next_trigger_at);
    return trigger >= now && trigger <= nextWeek;
  }).length;

  const emailCount = events.filter((e) => e.channels.email).length;
  const whatsappCount = events.filter((e) => e.channels.whatsapp).length;

  const cards = [
    {
      id: 'total',
      label: 'Total Tracked Dates',
      value: total,
      unit: 'active milestones',
      icon: Calendar,
      dotColor: 'var(--accent)',
      badge: 'Continuous sync',
    },
    {
      id: 'upcoming',
      label: 'Next 7 Days Alerts',
      value: upcomingSoon,
      unit: 'requiring attention',
      icon: Clock,
      dotColor: 'var(--green)',
      badge: 'Real-time queue',
    },
    {
      id: 'channels',
      label: 'Dispatch Channels',
      value: emailCount + whatsappCount,
      unit: `${emailCount} Email · ${whatsappCount} WhatsApp`,
      icon: Bell,
      dotColor: 'var(--amber)',
      badge: 'Multi-channel active',
    },
    {
      id: 'engine',
      label: 'Timezone Engine',
      value: 400,
      prefix: '+',
      unit: 'IANA timezones synced',
      icon: Globe,
      dotColor: 'var(--indigo-text)',
      badge: 'Leap-safe UTC',
    },
  ];

  return (
    <section className="py-12 px-5 sm:px-8 max-w-[1240px] mx-auto">
      {/* Bug #4 Fix: grid-cols-2 below md, grid-cols-4 from lg */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Reveal key={card.id} i={idx}>
              <Spotlight className="h-full rounded-[18px]">
                <div className="h-full p-5 sm:p-6 rounded-[18px] border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-strong)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow)] hover:border-[var(--accent)] flex flex-col justify-between">
                  <div>
                    {/* Header Row */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[var(--muted)] truncate">
                        {card.label}
                      </span>
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          backgroundColor: card.dotColor,
                          boxShadow: `0 0 10px ${card.dotColor}`,
                        }}
                      />
                    </div>

                    {/* Numeric CountUp */}
                    <div className="flex items-baseline gap-1 my-1">
                      {card.prefix && (
                        <span className="text-2xl sm:text-3xl font-extrabold text-[var(--fg)]">
                          {card.prefix}
                        </span>
                      )}
                      <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--fg)]">
                        <CountUp to={card.value} />
                      </span>
                    </div>

                    {/* Unit / Subtitle */}
                    <p className="text-xs text-[var(--muted-2)] font-medium mt-1 truncate">
                      {card.unit}
                    </p>
                  </div>

                  {/* Footer Tag */}
                  <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-[11px] font-mono text-[var(--muted)]">
                    <span className="truncate">{card.badge}</span>
                    <Icon className="w-3.5 h-3.5 text-[var(--muted-2)] shrink-0 ml-1" />
                  </div>
                </div>
              </Spotlight>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
};
