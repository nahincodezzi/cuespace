'use client';

import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Sparkles, 
  FileText, 
  Eye, 
  Code,
  ShieldCheck
} from 'lucide-react';
import { 
  EmailTemplate, 
  DEFAULT_EMAIL_TEMPLATES, 
  getStoredTemplates, 
  saveStoredTemplates, 
  renderEmailTemplate 
} from '@/types/template';

interface EmailTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onSelectTemplate?: (template: EmailTemplate) => void;
  showToast: (msg: string) => void;
}

export const EmailTemplatesModal: React.FC<EmailTemplatesModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  onSelectTemplate,
  showToast,
}) => {
  const [templates, setTemplates] = useState<EmailTemplate[]>(DEFAULT_EMAIL_TEMPLATES);
  const [activeTemplate, setActiveTemplate] = useState<EmailTemplate>(DEFAULT_EMAIL_TEMPLATES[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<EmailTemplate>(DEFAULT_EMAIL_TEMPLATES[0]);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const loaded = getStoredTemplates();
      setTemplates(loaded);
      setActiveTemplate(loaded[0] || DEFAULT_EMAIL_TEMPLATES[0]);
      setIsEditing(false);
      setIsCreatingNew(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartCreate = () => {
    const blank: EmailTemplate = {
      id: 'custom-' + Date.now(),
      name: 'My Custom Formal Template',
      category: 'custom',
      subject: 'Formal Notice: {{event_title}} on {{event_date}}',
      body: 'Dear {{recipient_name}},\n\nWe are pleased to send this notification regarding {{event_title}} scheduled for {{event_date}} at {{event_time}}.\n\nPlease let us know if any further assistance is required.\n\nWarm regards,\nCueSpace Notifications',
      isCustom: true
    };
    setEditForm(blank);
    setIsCreatingNew(true);
    setIsEditing(true);
  };

  const handleStartEdit = (tmpl: EmailTemplate) => {
    setEditForm({ ...tmpl });
    setIsCreatingNew(false);
    setIsEditing(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    let updatedList: EmailTemplate[];
    if (isCreatingNew) {
      updatedList = [...templates, { ...editForm, isCustom: true }];
      showToast(`Custom template "${editForm.name}" created!`);
    } else {
      updatedList = templates.map(t => t.id === editForm.id ? editForm : t);
      showToast(`Template "${editForm.name}" updated!`);
    }
    setTemplates(updatedList);
    saveStoredTemplates(updatedList);
    setActiveTemplate(editForm);
    setIsEditing(false);
    setIsCreatingNew(false);
  };

  const handleDeleteTemplate = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete template "${name}"?`)) return;
    const updated = templates.filter(t => t.id !== id);
    setTemplates(updated);
    saveStoredTemplates(updated);
    setActiveTemplate(updated[0] || DEFAULT_EMAIL_TEMPLATES[0]);
    showToast(`Template "${name}" removed.`);
  };

  const preview = renderEmailTemplate(activeTemplate, {
    recipient_name: 'Tamanna Rahman',
    event_title: "Tamanna's 28th Birthday",
    event_date: 'November 20, 2026',
    event_time: '09:00 AM',
    timezone: 'Asia/Dhaka (GMT+6)'
  });

  const modalBg = isDarkMode 
    ? 'bg-[#0d0e15] border-white/[0.1] text-white' 
    : 'bg-white border-zinc-200 text-zinc-900 shadow-2xl';
  const borderSubtle = isDarkMode ? 'border-white/[0.08]' : 'border-zinc-200';
  const sidebarBg = isDarkMode ? 'bg-white/[0.01]' : 'bg-zinc-50/70';
  const inputClass = isDarkMode 
    ? 'bg-white/[0.04] border-white/[0.08] text-white focus:border-purple-500/40' 
    : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-purple-500 focus:bg-white';
  const previewBg = isDarkMode ? 'bg-[#090a10] border-white/[0.1]' : 'bg-zinc-50 border-zinc-200 text-zinc-900';
  const textMuted = isDarkMode ? 'text-zinc-400' : 'text-zinc-600 font-medium';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className={`w-full max-w-4xl max-h-[90vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 ${modalBg}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${borderSubtle}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h2 className={`text-sm font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-zinc-950'}`}>
                <span>Formal Email Templates Manager</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/20">
                  {templates.length} Templates
                </span>
              </h2>
              <p className={`text-[11px] ${textMuted}`}>Manage and preview professional automated emails sent to recipients</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleStartCreate}
              className="btn-press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 border border-purple-400/30 transition-all shadow-sm shadow-purple-600/30"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Template</span>
            </button>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-xl transition-all ${
                isDarkMode ? 'text-zinc-400 hover:text-white hover:bg-white/5' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Split View (List on left, Editor/Preview on right) */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          
          {/* LEFT: Template List */}
          <div className={`w-full md:w-72 border-r p-3 space-y-1.5 overflow-y-auto shrink-0 ${borderSubtle} ${sidebarBg}`}>
            <div className={`px-2 py-1 text-[10px] font-mono uppercase tracking-wider font-semibold ${isDarkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
              Available Templates
            </div>
            {templates.map((tmpl) => {
              const isSelected = activeTemplate.id === tmpl.id;
              return (
                <div
                  key={tmpl.id}
                  onClick={() => {
                    setActiveTemplate(tmpl);
                    setIsEditing(false);
                  }}
                  className={`btn-press p-3 rounded-2xl cursor-pointer text-left transition-all border group relative ${
                    isSelected 
                      ? isDarkMode 
                        ? 'bg-purple-500/10 border-purple-500/30 text-white' 
                        : 'bg-purple-50 border-purple-200 text-purple-900 font-medium'
                      : isDarkMode
                        ? 'bg-white/[0.02] border-white/[0.05] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                        : 'bg-white border-zinc-200/80 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className={`text-xs font-semibold truncate ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                      {tmpl.name}
                    </span>
                    {tmpl.isCustom && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-500 border border-amber-500/20">
                        Custom
                      </span>
                    )}
                  </div>
                  <p className={`text-[11px] truncate ${isDarkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>{tmpl.subject}</p>
                </div>
              );
            })}
          </div>

          {/* RIGHT: Editor or Preview Pane */}
          <div className="flex-1 p-5 overflow-y-auto flex flex-col">
            
            {/* If user is editing/creating */}
            {isEditing ? (
              <form onSubmit={handleSaveForm} className="space-y-4">
                <div className={`flex items-center justify-between pb-3 border-b ${borderSubtle}`}>
                  <h3 className={`text-xs font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                    <Edit3 className="w-4 h-4 text-purple-400" />
                    <span>{isCreatingNew ? 'Create New Formal Template' : `Edit "${editForm.name}"`}</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    Cancel Editing
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-[11px] font-medium mb-1 ${textMuted}`}>Template Name</label>
                    <input
                      type="text"
                      required
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none ${inputClass}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-[11px] font-medium mb-1 ${textMuted}`}>Category</label>
                    <select
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value as any })}
                      className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none ${inputClass}`}
                    >
                      <option value="birthday">Birthday</option>
                      <option value="deadline">Deadline</option>
                      <option value="anniversary">Anniversary</option>
                      <option value="health">Health</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className={`block text-[11px] font-medium ${textMuted}`}>Email Subject Line</label>
                    <span className="text-[10px] font-mono text-zinc-500">Supports variables</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={editForm.subject}
                    onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                    className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none ${inputClass}`}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className={`block text-[11px] font-medium ${textMuted}`}>Formal Email Message Body</label>
                    <span className="text-[10px] font-mono text-purple-500 dark:text-purple-400">
                      {'{{recipient_name}}'}, {'{{event_title}}'}, {'{{event_date}}'}, {'{{event_time}}'}
                    </span>
                  </div>
                  <textarea
                    rows={8}
                    required
                    value={editForm.body}
                    onChange={(e) => setEditForm({ ...editForm, body: e.target.value })}
                    className={`w-full rounded-xl px-3 py-2.5 text-xs font-mono leading-relaxed border focus:outline-none ${inputClass}`}
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3.5 py-1.5 rounded-xl text-xs text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-press px-4 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 transition-all shadow-md shadow-purple-600/30"
                  >
                    Save Template
                  </button>
                </div>
              </form>
            ) : (
              /* VIEW / PREVIEW MODE */
              <div className="space-y-4">
                
                {/* Actions Bar */}
                <div className={`flex items-center justify-between pb-3 border-b ${borderSubtle}`}>
                  <div>
                    <h3 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-zinc-950'}`}>{activeTemplate.name}</h3>
                    <p className={`text-[11px] ${textMuted}`}>Category: <span className="capitalize text-purple-500 dark:text-purple-400 font-semibold">{activeTemplate.category}</span></p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStartEdit(activeTemplate)}
                      className={`btn-press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                        isDarkMode 
                          ? 'text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border-white/10' 
                          : 'text-zinc-700 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 border-zinc-200'
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5 text-purple-400" />
                      <span>Edit Template</span>
                    </button>
                    {activeTemplate.isCustom && (
                      <button
                        onClick={() => handleDeleteTemplate(activeTemplate.id, activeTemplate.name)}
                        className="btn-press p-1.5 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all"
                        title="Delete custom template"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    {onSelectTemplate && (
                      <button
                        onClick={() => {
                          onSelectTemplate(activeTemplate);
                          onClose();
                          showToast(`Selected "${activeTemplate.name}" for this event!`);
                        }}
                        className="btn-press inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 border border-purple-400/30 transition-all shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Use for Event</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Simulated Formal Email Preview */}
                <div className={`border rounded-2xl overflow-hidden shadow-xl ${previewBg}`}>
                  {/* Email Client Meta Header */}
                  <div className={`px-4 py-3 border-b text-xs space-y-1.5 ${
                    isDarkMode ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-white border-zinc-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500 w-16 text-right font-mono text-[11px]">From:</span>
                      <span className={`font-medium ${isDarkMode ? 'text-zinc-300' : 'text-zinc-800'}`}>CueSpace Automated Dispatcher &lt;notifications@cuespace.app&gt;</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500 w-16 text-right font-mono text-[11px]">To:</span>
                      <span className="text-purple-500 dark:text-purple-300 font-mono font-medium">tamanna@example.com (+8801633518042)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500 w-16 text-right font-mono text-[11px]">Subject:</span>
                      <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-zinc-950'}`}>{preview.subject}</span>
                    </div>
                  </div>

                  {/* Email Body */}
                  <div className={`p-6 text-xs space-y-4 ${isDarkMode ? 'text-zinc-300' : 'text-zinc-800'}`}>
                    <div className={`flex items-center gap-2 pb-3 border-b ${isDarkMode ? 'border-white/[0.06]' : 'border-zinc-200'}`}>
                      <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <span className={`text-sm font-semibold tracking-tight ${isDarkMode ? 'text-white' : 'text-zinc-950'}`}>CueSpace Notification</span>
                    </div>

                    <div className="whitespace-pre-line leading-relaxed">
                      {preview.body}
                    </div>

                    {/* Interactive 1-Click Snooze and Actions in Email */}
                    <div className={`pt-4 border-t flex items-center gap-3 ${isDarkMode ? 'border-white/[0.06]' : 'border-zinc-200'}`}>
                      <div className="px-3 py-1.5 rounded-lg bg-purple-600/20 text-purple-600 dark:text-purple-300 border border-purple-500/30 text-[11px] font-semibold">
                        ⏱️ Snooze 3 Hours (1-Click)
                      </div>
                      <div className={`px-3 py-1.5 rounded-lg text-[11px] border ${
                        isDarkMode ? 'bg-white/5 text-zinc-400 border-white/10' : 'bg-white text-zinc-600 border-zinc-200'
                      }`}>
                        Tomorrow Morning
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legend: Available Variables */}
                <div className={`p-3 rounded-xl border text-[11px] flex items-center gap-2 ${
                  isDarkMode ? 'bg-white/[0.02] border-white/[0.05] text-zinc-400' : 'bg-zinc-50 border-zinc-200 text-zinc-600'
                }`}>
                  <Code className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400 shrink-0" />
                  <span>
                    <strong>Available Dynamic Tags:</strong> <code className="text-purple-600 dark:text-purple-300">{'{{recipient_name}}'}</code>, <code className="text-purple-600 dark:text-purple-300">{'{{event_title}}'}</code>, <code className="text-purple-600 dark:text-purple-300">{'{{event_date}}'}</code>, <code className="text-purple-600 dark:text-purple-300">{'{{event_time}}'}</code>
                  </span>
                </div>

              </div>
            )}

          </div>

        </div>

        {/* Footer */}
        <div className={`px-6 py-3 border-t flex items-center justify-between text-xs ${borderSubtle} ${
          isDarkMode ? 'bg-white/[0.01] text-zinc-500' : 'bg-zinc-50 text-zinc-500'
        }`}>
          <span>CueSpace Enterprise Multi-Channel Template Engine</span>
          <button
            onClick={onClose}
            className={`text-xs ${isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'}`}
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
