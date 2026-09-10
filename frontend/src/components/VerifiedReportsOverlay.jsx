import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useTranslation } from 'react-i18next';
import RiskBadge from './admin/RiskBadge';
import {
  Camera,
  CheckCircle2,
  MapPin,
  Clock,
  User,
  ShieldAlert,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';

const SEVERITY_COLORS = {
  critical: {
    bg: '#E63946',
    border: '#B71C1C',
    text: '#ffffff',
    glow: 'rgba(230, 57, 70, 0.45)',
  },
  high: {
    bg: '#EA580C',
    border: '#C2410C',
    text: '#ffffff',
    glow: 'rgba(234, 88, 12, 0.45)',
  },
  medium: {
    bg: '#D97706',
    border: '#B45309',
    text: '#ffffff',
    glow: 'rgba(217, 119, 6, 0.45)',
  },
  low: {
    bg: '#008060',
    border: '#00523C',
    text: '#ffffff',
    glow: 'rgba(0, 128, 96, 0.45)',
  },
};

function createReportIcon(severity, hasPhoto) {
  const sevKey = (severity || 'medium').toLowerCase();
  const conf = SEVERITY_COLORS[sevKey] || SEVERITY_COLORS.medium;
  const isHighSeverity = sevKey === 'critical' || sevKey === 'high';

  const pulseRing = isHighSeverity
    ? `<span style="
        position: absolute;
        inset: -4px;
        border-radius: 9999px;
        background-color: ${conf.glow};
        animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
        opacity: 0.75;
      "></span>`
    : '';

  const html = `
    <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
      ${pulseRing}
      <div style="
        position: relative;
        width: 32px;
        height: 32px;
        background: ${conf.bg};
        border: 2px solid #ffffff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(0,0,0,0.35), 0 0 12px ${conf.glow};
        color: #ffffff;
        font-size: 13px;
        transition: transform 0.2s ease;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
          <circle cx="12" cy="13" r="4"></circle>
        </svg>
      </div>
      <div style="
        position: absolute;
        bottom: -2px;
        right: -2px;
        width: 13px;
        height: 13px;
        background: #10B981;
        border: 2px solid #ffffff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-verified-report-marker',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
}

export default function VerifiedReportsOverlay({ reports = [] }) {
  const { t } = useTranslation();

  // Filter only verified reports that have valid lat & lng
  const verifiedList = (reports || []).filter(
    (r) =>
      (r.status === 'verified' || !r.status) &&
      typeof r.lat === 'number' &&
      typeof r.lng === 'number' &&
      !isNaN(r.lat) &&
      !isNaN(r.lng)
  );

  if (verifiedList.length === 0) return null;

  return (
    <>
      {verifiedList.map((r) => {
        const icon = createReportIcon(r.severity, !!r.photo_url);
        const formattedDate = r.timestamp
          ? new Date(r.timestamp).toLocaleString([], {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '—';

        return (
          <Marker
            key={`verified-report-${r.report_id}`}
            position={[r.lat, r.lng]}
            icon={icon}
          >
            <Popup className="verified-report-popup" maxWidth={320} minWidth={260}>
              <div className="p-1 space-y-2 text-slate-800 dark:text-zinc-100 font-sans">
                {/* Header with badge */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-[#006B4F] dark:text-emerald-400">
                      {r.report_id}
                    </span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-[#008060] dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      <span>{t('reports_feed.status_verified', 'Verified')}</span>
                    </span>
                  </div>
                  <RiskBadge severity={r.severity || 'medium'} size="xs" />
                </div>

                {/* Photo if present */}
                {r.photo_url && (
                  <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-zinc-800 max-h-36 bg-slate-900">
                    <img
                      src={r.photo_url}
                      alt={`Hazard report ${r.report_id}`}
                      className="w-full h-32 object-cover"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Description */}
                <p className="text-xs text-slate-700 dark:text-zinc-200 leading-relaxed font-medium">
                  {r.description || t('field_reports.no_desc', 'Verified ground hazard incident.')}
                </p>

                {/* Meta details */}
                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 space-y-1 text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{r.lat.toFixed(4)}, {r.lng.toFixed(4)}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{formattedDate}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-0.5 text-[10px]">
                    <span className="text-slate-400">
                      {t('field_reports.source', 'Source:')} {r.reporter_type || 'citizen'}
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      GIS Ground Truth
                    </span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}
