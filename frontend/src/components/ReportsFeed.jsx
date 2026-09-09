import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import {
  FileText, CheckCircle2, XCircle, Clock, MapPin,
  ExternalLink, User, Image as ImageIcon,
} from 'lucide-react';

export default function ReportsFeed({ reports = [], onUpdateStatus }) {
  const { t } = useTranslation();
  const { isOfficial } = useAuth();
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const statusStyles = {
    received:  'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200',
    verified:  'bg-[#EAF5F0] text-[#006B4F] dark:bg-emerald-950/40 dark:text-emerald-400 border-[#006B4F]/20',
    dismissed: 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 border-slate-200',
  };

  return (
    <div className="bg-white dark:bg-zinc-950 border border-[#D9E2DE] dark:border-zinc-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-[#D9E2DE] dark:border-zinc-800 mb-4">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-[#006B4F] dark:text-emerald-400 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#006B4F] dark:text-emerald-400" />
            <span>{t('reports_feed.title')}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {t('reports_feed.subtitle')}
          </p>
        </div>
        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#EAF5F0] text-[#006B4F] dark:bg-zinc-900 dark:text-emerald-400 border border-[#006B4F]/20">
          {reports.length} {t('reports_feed.total_label')}
        </span>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
        {reports.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500">
            {t('reports_feed.empty')}
          </div>
        ) : (
          reports.map((report) => (
            <div
              key={report.report_id}
              className="p-3.5 rounded-xl bg-[#F5F7F6]/70 dark:bg-zinc-900/70 border border-[#D9E2DE] dark:border-zinc-800 hover:border-[#006B4F]/40 transition-all flex flex-col sm:flex-row items-start gap-3"
            >
              {report.photo_url ? (
                <div
                  onClick={() => setSelectedPhoto(report.photo_url)}
                  className="relative w-full sm:w-24 h-24 sm:h-20 rounded-lg overflow-hidden bg-zinc-800 shrink-0 cursor-pointer group/img border border-[#D9E2DE] dark:border-zinc-700"
                >
                  <img
                    src={report.photo_url}
                    alt="Landslide incident evidence"
                    className="w-full h-full object-cover group-hover/img:scale-105 transition-transform"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                    <ExternalLink className="w-4 h-4 text-white" />
                  </div>
                </div>
              ) : (
                <div className="w-full sm:w-20 h-20 rounded-lg bg-[#EAF5F0]/60 dark:bg-zinc-800/50 flex items-center justify-center text-[#006B4F] dark:text-zinc-400 shrink-0 border border-[#D9E2DE] dark:border-zinc-700">
                  <ImageIcon className="w-6 h-6 opacity-60" />
                </div>
              )}

              <div className="flex-1 min-w-0 space-y-1.5 w-full">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#1F2937] dark:text-zinc-200">
                      {report.report_id}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusStyles[report.status] || statusStyles.received}`}>
                      {t(`reports_feed.status_${report.status}`, { defaultValue: report.status })}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {report.reporter_type}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-xs text-[#1F2937] dark:text-zinc-300 leading-relaxed">
                  {report.description}
                </p>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#006B4F] dark:text-emerald-400" />
                    {report.lat?.toFixed(4)}, {report.lng?.toFixed(4)}
                  </span>

                  {isOfficial && report.status === 'received' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onUpdateStatus(report.report_id, 'verified')}
                        className="px-2.5 py-1 rounded-lg bg-[#006B4F] hover:bg-[#00523c] text-white font-medium text-[10px] flex items-center gap-1 shadow-sm transition-all"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        {t('reports_feed.verify')}
                      </button>
                      <button
                        onClick={() => onUpdateStatus(report.report_id, 'dismissed')}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 hover:bg-[#E63946] hover:text-white text-slate-700 dark:text-zinc-300 border border-[#D9E2DE] dark:border-zinc-700 font-medium text-[10px] flex items-center gap-1 transition-all"
                      >
                        <XCircle className="w-3 h-3" />
                        {t('reports_feed.dismiss')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-3xl max-h-[85vh] rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">
            <img src={selectedPhoto} alt="Expanded incident photograph" className="w-full h-full object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
