'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OdometerProps {
  value: string;
  className?: string;
}

export const Odometer: React.FC<OdometerProps> = ({ value, className }) => {
  return (
    <div className={`inline-flex items-center font-mono overflow-hidden ${className || ''}`}>
      {value.split('').map((char, index) => {
        const isDigit = /[0-9]/.test(char);
        if (!isDigit) {
          return (
            <span key={index} className="inline-block">
              {char}
            </span>
          );
        }

        return (
          <div key={index} className="relative inline-block w-[0.62em] h-[1.2em] overflow-hidden leading-none">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={`${index}-${char}`}
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                exit={{ y: '-100%', opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 flex items-center justify-center font-mono"
              >
                {char}
              </motion.span>
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};
