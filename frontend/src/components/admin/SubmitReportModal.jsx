import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, FileText } from 'lucide-react';
import ReportForm from '../ReportForm';

/**
 * Submit Report Modal — Wraps existing ReportForm
 * Allows direct field report submissions from Quick Actions or the AI Assistant
 */
export default function SubmitReportModal({ isOpen, onClose, onReportSubmitted }) {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-3xl bg-white dark:bg-[#0D0E10] border border-[#D9E2DE] dark:border-[#27272A] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#D9E2DE] dark:border-[#1E1E24] bg-[#F8FAF9] dark:bg-[#121417]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#006B4F] text-white flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                {t('report_form.title', { defaultValue: 'Submit Ground Hazard Incident Report' })}
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {t('report_form.subtitle', { defaultValue: 'Log slope cracks, debris falls, or retaining wall displacements' })}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E1E24] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing ReportForm Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <ReportForm
            onSuccess={() => {
              if (onReportSubmitted) onReportSubmitted();
              setTimeout(() => {
                if (onClose) onClose();
              }, 1200);
            }}
          />
        </div>
      </div>
    </div>
  );
}
