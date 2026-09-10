import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  FileText,
  MapPin,
  Clock,
  User,
  Shield,
  Camera,
  ArrowLeft,
  Eye,
  Gauge,
  Radio,
  Hash,
  Globe,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

const statusConfig = {
  received:     { label: 'Received',     cls: 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-800', icon: Radio },
  verified:     { label: 'Verified',     cls: 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800', icon: CheckCircle2 },
  dismissed:    { label: 'Dismissed',    cls: 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-300 dark:border-zinc-700', icon: X },
  pending_sync: { label: 'Pending Sync', cls: 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800', icon: Clock },
};

const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export default function ReportDetailModal({ isOpen, onClose, report }) {
  const { t } = useTranslation();

  if (!isOpen || !report) return null;

  const reportId = report.report_id || report.client_report_id?.slice(0, 16) || '—';
  const status = report.is_pending ? 'pending_sync' : (report.status || 'received');
  const statusCfg = statusConfig[status] || statusConfig.received;
  const StatusIcon = statusCfg.icon;

  // Derive severity from description keywords (heuristic since mock data doesn't have explicit severity on reports)
  const deriveSeverity = () => {
    const desc = (report.description || '').toLowerCase();
    if (desc.includes('evacuat') || desc.includes('critical') || desc.includes('immediate')) return 'critical';
    if (desc.includes('large') || desc.includes('severe') || desc.includes('active') || desc.includes('boulder') || desc.includes('overflow')) return 'high';
    if (desc.includes('minor') || desc.includes('cleared') || desc.includes('safe')) return 'low';
    return 'medium';
  };
  const severity = report.severity || deriveSeverity();

  const severityBadge = {
    critical: 'bg-red-600 text-white',
    high:     'bg-amber-600 text-white',
    medium:   'bg-yellow-500 text-white',
    low:      'bg-emerald-600 text-white',
  };

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ animation: 'rptFadeIn 200ms ease-out' }}
    >
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-zinc-950 border border-[#D9E2DE] dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
        style={{ animation: 'rptSlideUp 250ms ease-out' }}
      >
        {/* ─── Header ──────────────────────────── */}
        <div className="px-5 py-4 border-b border-[#D9E2DE] dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#EAF5F0] dark:bg-emerald-950/50 text-[#006B4F] dark:text-emerald-400 border border-[#006B4F]/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-[#1F2937] dark:text-white flex items-center gap-2">
                <span>{t('sidebar.field_reports', { defaultValue: 'Field Report' })}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                  {reportId}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {t('report_modal.subtitle', { defaultValue: 'Complete report details and submitted information' })}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ─── Body ────────────────────────────── */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">

          {/* Status + Severity Row */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${statusCfg.cls}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              <span>{t(`reports_feed.status_${status}`, { defaultValue: statusCfg.label })}</span>
            </div>
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-black uppercase tracking-wide ${severityBadge[severity]}`}>
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{t(`severity.${severity}_short`, { defaultValue: severity })} {t('report_modal.severity_suffix', { defaultValue: 'Severity' })}</span>
            </div>
          </div>

          {/* Photo / Attachment */}
          {(report.photo_url || report.photo_data) && (
            <div className="rounded-xl overflow-hidden border border-[#D9E2DE] dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
              <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 dark:bg-zinc-900/60 border-b border-[#D9E2DE] dark:border-zinc-800">
                <Camera className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                  {t('alert_modal.field_photo', { defaultValue: 'Evidence Photo' })}
                </span>
              </div>
              <img
                src={report.photo_url || report.photo_data}
                alt="Report evidence"
                className="w-full max-h-64 object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          )}

          {/* Report Type */}
          <div className="p-4 rounded-xl border border-[#D9E2DE] dark:border-zinc-800 bg-[#F5F7F6]/50 dark:bg-zinc-900/50 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">{t('report_modal.report_type', { defaultValue: 'Report Type' })}</span>
            <p className="text-sm font-bold text-[#1F2937] dark:text-white">
              {t('report_modal.landslide_observation', { defaultValue: 'Landslide / Slope Hazard Observation' })}
            </p>
          </div>

          {/* Full Description */}
          <div className="p-4 rounded-xl border border-[#D9E2DE] dark:border-zinc-800 bg-white dark:bg-zinc-900/50 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">{t('report_modal.full_description', { defaultValue: 'Full Description' })}</span>
            <p className="text-sm text-[#1F2937] dark:text-zinc-200 leading-relaxed">
              {report.description || t('report_modal.no_description', { defaultValue: 'No description provided' })}
            </p>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* GPS Coordinates */}
            <div className="p-3.5 rounded-xl border border-[#D9E2DE] dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
              <div className="flex items-center gap-1.5 mb-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#006B4F] dark:text-emerald-400" />
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">{t('common.coordinates', { defaultValue: 'GPS Coordinates' })}</span>
              </div>
              <p className="font-mono text-sm font-bold text-[#1F2937] dark:text-white">
                {report.lat != null ? Number(report.lat).toFixed(4) : '—'}, {report.lng != null ? Number(report.lng).toFixed(4) : '—'}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">
                East Khasi Hills, Meghalaya
              </p>
            </div>

            {/* Date & Time */}
            <div className="p-3.5 rounded-xl border border-[#D9E2DE] dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Clock className="w-3.5 h-3.5 text-[#006B4F] dark:text-emerald-400" />
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">{t('report_modal.submission_time', { defaultValue: 'Submission Time' })}</span>
              </div>
              <p className="text-sm font-bold text-[#1F2937] dark:text-white">
                {fmtDate(report.timestamp)}
              </p>
            </div>

            {/* Reporter / Source */}
            <div className="p-3.5 rounded-xl border border-[#D9E2DE] dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
              <div className="flex items-center gap-1.5 mb-1.5">
                {report.reporter_type === 'official' ? (
                  <Shield className="w-3.5 h-3.5 text-[#006B4F] dark:text-emerald-400" />
                ) : (
                  <User className="w-3.5 h-3.5 text-[#006B4F] dark:text-emerald-400" />
                )}
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">{t('reports_feed.reporter_label', { defaultValue: 'Reporter / Source' })}</span>
              </div>
              <p className="text-sm font-bold text-[#1F2937] dark:text-white capitalize">
                {report.reporter_type ? t(`report_form.${report.reporter_type}`, { defaultValue: report.reporter_type }) : t('report_form.citizen', { defaultValue: 'Citizen' })}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">
                {report.reporter_type === 'official' ? t('report_form.official', { defaultValue: 'Government Official / Field Officer' }) : t('report_form.citizen', { defaultValue: 'Community Member / Citizen Reporter' })}
              </p>
            </div>

            {/* Report ID */}
            <div className="p-3.5 rounded-xl border border-[#D9E2DE] dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Hash className="w-3.5 h-3.5 text-[#006B4F] dark:text-emerald-400" />
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Report ID</span>
              </div>
              <p className="text-sm font-bold font-mono text-[#1F2937] dark:text-white">
                {reportId}
              </p>
              {report.client_report_id && report.report_id && (
                <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5 font-mono">
                  Client: {report.client_report_id.slice(0, 20)}
                </p>
              )}
            </div>
          </div>

          {/* Additional Field Data (language, sync status, etc.) */}
          <div className="p-4 rounded-xl border border-[#D9E2DE] dark:border-zinc-800 bg-[#F5F7F6]/50 dark:bg-zinc-900/50">
            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block mb-2.5">
              {t('report_modal.additional_data', { defaultValue: 'Additional Field Data' })}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 dark:text-zinc-500 block mb-0.5">{t('alerts_list.lang_label', { defaultValue: 'Language' })}</span>
                <div className="flex items-center gap-1">
                  <Globe className="w-3 h-3 text-slate-400" />
                  <span className="font-semibold text-[#1F2937] dark:text-zinc-200 uppercase">{report.language || 'EN'}</span>
                </div>
              </div>
              <div>
                <span className="text-slate-400 dark:text-zinc-500 block mb-0.5">{t('report_modal.sync_status', { defaultValue: 'Sync Status' })}</span>
                <span className={`font-semibold ${report.is_pending ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {report.is_pending ? t('report_form.pending_sync_label', { defaultValue: 'Pending Sync' }) : t('report_modal.synced', { defaultValue: 'Synced' })}
                </span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-zinc-500 block mb-0.5">{t('report_modal.has_attachment', { defaultValue: 'Has Attachment' })}</span>
                <span className="font-semibold text-[#1F2937] dark:text-zinc-200">
                  {(report.photo_url || report.photo_data) ? t('report_modal.yes_photo', { defaultValue: 'Yes — Photo' }) : t('report_modal.no', { defaultValue: 'No' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Footer ──────────────────────────── */}
        <div className="px-5 py-3 border-t border-[#D9E2DE] dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-900/60">
          <div className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            <span>{t('report_modal.readonly_view', { defaultValue: 'Read-only view' })}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-[#D9E2DE] dark:border-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {t('common.back', { defaultValue: 'Back' })}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes rptFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes rptSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
