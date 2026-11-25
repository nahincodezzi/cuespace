'use client';

import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Reveal } from '@/components/motion/Reveal';
import {
  RotatingGlobeIcon,
  ChannelPingsIcon,
  FloatingSnoozeIcon,
  FlippingCalendarIcon,
} from './FeatureIcons';

const FEATURES = [
  {
    id: 'timezone',
    title: 'Autonomous Timezone Engine',
    desc: 'Automatic conversion across 400+ global zones with Daylight Saving Time tracking. Alerts fire precisely in the local wall clock hour.',
    IconComponent: RotatingGlobeIcon,
    tag: 'Global Accuracy',
  },
  {
    id: 'channels',
    title: 'Multi-Channel Dispatch',
    desc: 'Seamless automated delivery across transactional Email, SMS, and WhatsApp with instant pre-filled greeting links.',
    IconComponent: ChannelPingsIcon,
    tag: 'Omnichannel',
  },
  {
    id: 'snooze',
    title: 'Stateless 1-Click Snooze',
    desc: 'Tamper-proof HMAC signed tokens in alert messages allow recipients to postpone reminders for 3 hours or 1 day without logging in.',
    IconComponent: FloatingSnoozeIcon,
    tag: 'Frictionless',
  },
  {
    id: 'leap',
    title: 'Leap Year & Regional Observances',
    desc: 'Built-in handling for Feb 29 leap years (Feb 28 vs Mar 1 fallback) and 23 curated Bangladesh and International special days.',
    IconComponent: FlippingCalendarIcon,
    tag: 'Smart Logic',
  },
];

const FeatureCard: React.FC<{ feat: (typeof FEATURES)[0]; i: number }> = ({ feat, i }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);

  const springX = useSpring(rotX, { stiffness: 250, damping: 25 });
  const springY = useSpring(rotY, { stiffness: 250, damping: 25 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    rotX.set(-y * 0.04);
    rotY.set(x * 0.04);
  };

  const handleMouseLeave = () => {
    rotX.set(0);
    rotY.set(0);
  };

  const IconComp = feat.IconComponent;

  return (
    <Reveal i={i}>
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX: springX, rotateY: springY, transformPerspective: 800 }}
        className="h-full p-6 sm:p-7 rounded-[20px] border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-strong)] transition-colors duration-300 hover:border-[var(--accent)] hover:shadow-[var(--shadow)] flex flex-col justify-between group"
      >
        <div>
          {/* Top Row: Icon & Tag */}
          <div className="flex items-center justify-between gap-2 mb-6">
            <IconComp />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--accent-text)]">
              {feat.tag}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold tracking-tight text-[var(--fg)] mb-2 group-hover:text-[var(--accent-text)] transition-colors">
            {feat.title}
          </h3>

          {/* Description */}
          <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
            {feat.desc}
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-[var(--border)] flex items-center justify-between text-[11px] font-medium text-[var(--muted-2)]">
          <span>Enterprise Ready</span>
          <span className="text-[var(--accent-text)] font-semibold">Active Engine →</span>
        </div>
      </motion.div>
    </Reveal>
  );
};

export const Features: React.FC = () => {
  return (
    <section id="features" className="py-16 sm:py-24 px-5 sm:px-8 max-w-[1240px] mx-auto">
      
      {/* Heading */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <Reveal i={0}>
          <span className="text-xs uppercase font-mono font-bold tracking-wider text-[var(--accent-text)] px-3 py-1 rounded-full border border-[var(--border)] bg-[var(--surface)]">
            Engineering Precision
          </span>
        </Reveal>

        <Reveal i={1}>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.035em] text-[var(--fg)] mt-4 mb-3">
            Built so reminders{' '}
            <span className="font-serif-italic font-normal text-[var(--amber)]">
              never slip.
            </span>
          </h2>
        </Reveal>

        <Reveal i={2}>
          <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed">
            Every layer from database transaction locks to background delivery workers is engineered for high-availability milestone preservation.
          </p>
        </Reveal>
      </div>

      {/* 4 Cards Auto-Fit Grid (min 270px) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {FEATURES.map((feat, idx) => (
          <FeatureCard key={feat.id} feat={feat} i={idx} />
        ))}
      </div>

    </section>
  );
};
