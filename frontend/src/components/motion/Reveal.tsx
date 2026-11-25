'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { reveal } from '@/lib/motion';

interface RevealProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  i?: number;
  className?: string;
}

export const Reveal: React.FC<RevealProps> = ({ children, i = 0, className, ...props }) => {
  return (
    <motion.div
      custom={i}
      variants={reveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};
