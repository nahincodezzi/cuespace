'use client';

import React from 'react';

interface FooterProps {
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  return (
    <footer className="border-t border-[var(--border)] py-8 px-5 sm:px-8 max-w-[1240px] mx-auto text-xs text-[var(--muted)] flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Bug #3 Fix: Removed "Linear, Vercel" text. Exact format: © {year} CueSpace */}
      <div className="flex items-center gap-2">
        <span>&copy; 2026 CueSpace.</span>
        <span className="text-[var(--muted-2)]">All rights reserved.</span>
      </div>

      <div className="flex items-center gap-5 text-xs">
        <a href="#privacy" className="hover:text-[var(--fg)] transition-colors">
          Privacy
        </a>
        <a href="#status" className="hover:text-[var(--fg)] transition-colors">
          Status
        </a>
        <button
          onClick={onOpenAdmin}
          className="hover:text-[var(--accent-text)] transition-colors font-medium cursor-pointer"
        >
          Admin Console
        </button>
      </div>
    </footer>
  );
};
