'use client';

import React from 'react';
import { motion, useScroll } from 'framer-motion';

export const ScrollProgress: React.FC = () => {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      style={{ scaleX: scrollYProgress, transformOrigin: 'left' }}
      className="fixed top-0 left-0 right-0 h-[2.5px] z-50 pointer-events-none bg-gradient-to-r from-[#6366F1] via-[#A78BFA] to-[var(--amber)]"
    />
  );
};
