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
      label: 'Total Tracked',
      value: total,
      unit: 'active milestones',
      icon: Calendar,
      dotColor: 'var(--accent)',
      badge: 'Continuous sync',
    },
    {
      id: 'upcoming',
      label: '7-Day Alerts',
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
      unit: `${emailCount} Email · ${whatsappCount} WA`,
      icon: Bell,
      dotColor: 'var(--amber)',
      badge: 'Multi-channel',
    },
    {
      id: 'engine',
      label: 'Timezone Engine',
      value: 400,
      prefix: '+',
      unit: 'IANA zones synced',
      icon: Globe,
      dotColor: 'var(--indigo-text)',
      badge: 'Leap-safe UTC',
    },
  ];

  return (
    <section className="py-8 sm:py-12 px-4 sm:px-8 max-w-[1240px] mx-auto">
      {/* Bug #4 Fix: grid-cols-2 below md, grid-cols-4 from lg */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Reveal key={card.id} i={idx}>
              <Spotlight className="h-full rounded-2xl sm:rounded-[18px]">
                <div className="h-full p-3.5 sm:p-5 lg:p-6 rounded-2xl sm:rounded-[18px] border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-strong)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow)] hover:border-[var(--accent)] flex flex-col justify-between">
                  <div>
                    {/* Header Row */}
                    <div className="flex items-center justify-between gap-1.5 mb-2 sm:mb-3">
                      <span className="text-[10px] sm:text-[11px] lg:text-xs font-semibold uppercase tracking-wider text-[var(--muted)] line-clamp-1">
                        {card.label}
                      </span>
                      <div
                        className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0"
                        style={{
                          backgroundColor: card.dotColor,
                          boxShadow: `0 0 10px ${card.dotColor}`,
                        }}
                      />
                    </div>

                    {/* Numeric CountUp */}
                    <div className="flex items-baseline gap-0.5 sm:gap-1 my-0.5 sm:my-1">
                      {card.prefix && (
                        <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[var(--fg)]">
                          {card.prefix}
                        </span>
                      )}
                      <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--fg)] tabular-nums">
                        <CountUp to={card.value} />
                      </span>
                    </div>

                    {/* Unit / Subtitle */}
                    <p className="text-[10px] sm:text-xs text-[var(--muted-2)] font-medium mt-0.5 sm:mt-1 leading-snug line-clamp-1 sm:line-clamp-none">
                      {card.unit}
                    </p>
                  </div>

                  {/* Footer Tag */}
                  <div className="mt-3 pt-2.5 sm:mt-4 sm:pt-3 border-t border-[var(--border)] flex items-center justify-between text-[9.5px] sm:text-[11px] font-mono text-[var(--muted)]">
                    <span className="truncate">{card.badge}</span>
                    <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[var(--muted-2)] shrink-0 ml-1" />
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
