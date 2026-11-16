'use client';

import React, { useState, useEffect } from 'react';
import { X, UploadCloud, FileSpreadsheet, Check, Sparkles, AlertCircle } from 'lucide-react';
import { SmartEvent } from '@/types/event';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (events: SmartEvent[]) => void;
  isDarkMode: boolean;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
  isDarkMode,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleMockGoogleImport = () => {
    setIsUploading(true);
    setTimeout(() => {
      const mockImported: SmartEvent[] = [
        {
          id: 'imp-' + Date.now(),
          user_id: 'imported-user',
          title: "Farhan's Birthday (From Google Contacts)",
          category: 'birthday',
          original_date: '1995-12-14',
          reminder_time: '09:00:00',
          timezone: 'Asia/Dhaka',
          calendar_type: 'GREGORIAN',
          leap_year_handling: 'FEB_28',
          recurrence_type: 'YEARLY',
          recurrence_interval: 1,
          channels: { email: true, sms: false, whatsapp: true },
          alert_lead_days: [0, 3],
          recipient_name: 'Farhan Kabir',
          recipient_phone: '+8801999887766',
          is_active: true,
          created_at: '2026-11-17T00:00:00Z',
          updated_at: '2026-11-17T00:00:00Z',
        },
        {
          id: 'imp-' + (Date.now() + 1),
          user_id: 'imported-user',
          title: "Quarterly Tax Filing (From CSV)",
          category: 'finance',
          original_date: '2026-12-31',
          reminder_time: '10:00:00',
          timezone: 'Asia/Dhaka',
          calendar_type: 'GREGORIAN',
          leap_year_handling: 'FEB_28',
          recurrence_type: 'YEARLY',
          recurrence_interval: 1,
          channels: { email: true, sms: true, whatsapp: false },
          alert_lead_days: [0, 7],
          is_active: true,
          created_at: '2026-11-17T00:00:00Z',
          updated_at: '2026-11-17T00:00:00Z',
        }
      ];
      onImportComplete(mockImported);
      setIsUploading(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 800);
    }, 1200);
  };

  const bgModal = isDarkMode ? 'bg-[#111318] border-white/[0.1]' : 'bg-white border-zinc-200 shadow-2xl';
  const textPrimary = isDarkMode ? 'text-zinc-100' : 'text-zinc-900';
  const textMuted = isDarkMode ? 'text-zinc-400' : 'text-zinc-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className={`relative w-full max-w-md border rounded-2xl p-6 shadow-2xl transition-colors ${bgModal}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`text-sm font-semibold tracking-tight ${textPrimary}`}>Bulk Import Dates</h3>
              <p className={`text-xs ${textMuted}`}>CSV, Excel & Google Contacts Sync</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-1 rounded-lg ${textMuted} hover:${textPrimary}`}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dropzone */}
        <div 
          onClick={handleMockGoogleImport}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            isDarkMode 
              ? 'border-white/[0.1] hover:border-indigo-500/50 hover:bg-white/[0.02]' 
              : 'border-zinc-300 hover:border-indigo-500 hover:bg-zinc-50'
          }`}
        >
          <FileSpreadsheet className="w-10 h-10 mx-auto text-indigo-400 mb-2" />
          <div className={`text-xs font-semibold ${textPrimary}`}>
            Click to upload CSV or Excel spreadsheet
          </div>
          <div className={`text-[11px] mt-1 ${textMuted}`}>
            Supports columns: Title, Date, Category, Phone, Timezone
          </div>
        </div>

        <div className="my-4 flex items-center gap-3">
          <div className={`flex-1 h-[1px] ${isDarkMode ? 'bg-white/[0.08]' : 'bg-zinc-200'}`} />
          <span className={`text-[11px] uppercase tracking-wider font-semibold ${textMuted}`}>or connect</span>
          <div className={`flex-1 h-[1px] ${isDarkMode ? 'bg-white/[0.08]' : 'bg-zinc-200'}`} />
        </div>

        {/* 1-Click Google Contacts Sync */}
        <button
          onClick={handleMockGoogleImport}
          disabled={isUploading || success}
          className={`w-full py-3 px-4 rounded-xl border flex items-center justify-center gap-2.5 text-xs font-semibold transition-all ${
            isDarkMode 
              ? 'bg-white/[0.04] border-white/[0.08] text-zinc-100 hover:bg-white/[0.08]' 
              : 'bg-zinc-100 border-zinc-200 text-zinc-800 hover:bg-zinc-200'
          }`}
        >
          {isUploading ? (
            <span>Syncing Contacts Engine...</span>
          ) : success ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Imported Successfully!</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>1-Click Sync Google Contacts Birthdays</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
