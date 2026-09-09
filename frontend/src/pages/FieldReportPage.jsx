import React from 'react';
import { useTranslation } from 'react-i18next';
import ReportForm from '../components/ReportForm';
import { Shield } from 'lucide-react';

export default function FieldReportPage() {
  const { t } = useTranslation();

  return (
    <div className="py-2 pb-16 space-y-6">
      {/* Intro info card */}
      <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-orange-500/5 dark:bg-orange-950/20 border border-orange-500/20 text-xs text-slate-700 dark:text-zinc-300">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              {t('field_report_page.info_title')}
            </h3>
            <p className="mt-1 text-slate-600 dark:text-zinc-400 leading-relaxed">
              {t('field_report_page.info_desc')}
            </p>
          </div>
        </div>
      </div>

      {/* Main reporting form */}
      <ReportForm />
    </div>
  );
}
