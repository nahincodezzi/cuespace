'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useInView, animate } from 'framer-motion';
import { ease, dur } from '@/lib/motion';

interface CountUpProps {
  to: number;
  duration?: number;
  className?: string;
}

export const CountUp: React.FC<CountUpProps> = ({ to, duration = dur.xl, className }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(0, to, {
      duration,
      ease: ease.out,
      onUpdate: (latest) => {
        setDisplayValue(Math.round(latest));
      },
    });
    return () => controls.stop();
  }, [isInView, to, duration]);

  return (
    <span ref={ref} className={`tabular-nums ${className || ''}`}>
      {displayValue}
    </span>
  );
};
