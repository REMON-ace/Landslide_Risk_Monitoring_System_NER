import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  Activity,
  AlertTriangle,
  Route,
  Bell,
  FileText,
  MapPin,
  Clock,
  Shield,
  ArrowLeft,
  ChevronRight,
  Gauge,
  Radio,
  Navigation,
  User,
  Eye,
} from 'lucide-react';

/* ─── severity / status helpers ───────────────────────────── */
const severityBadge = (s) => {
  const map = {
    critical: 'bg-red-600 text-white',
    high:     'bg-amber-600 text-white',
    medium:   'bg-yellow-500 text-white',
    low:      'bg-emerald-600 text-white',
  };
  return map[s] || 'bg-slate-500 text-white';
};

const statusBadge = (s) => {
  const map = {
    blocked:   'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800',
    partial:   'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800',
    clear:     'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800',
    verified:  'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800',
    received:  'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-800',
    dismissed: 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-300 dark:border-zinc-700',
    active:    'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800',
  };
  return map[s] || 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400';
};

const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString([], {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

/* ─── meta config per card type ───────────────────────────── */
const CARD_META = {
  total_zones: {
    icon: Activity,
    color: 'text-[#006B4F] dark:text-emerald-400',
    iconBg: 'bg-[#EAF5F0] dark:bg-emerald-950/50 border-[#006B4F]/20',
  },
  high_risk: {
    icon: AlertTriangle,
    color: 'text-orange-600 dark:text-orange-400',
    iconBg: 'bg-orange-50 dark:bg-orange-950/50 border-orange-200',
  },
  roads_blocked: {
    icon: Route,
    color: 'text-[#E63946] dark:text-red-400',
    iconBg: 'bg-red-50 dark:bg-red-950/50 border-red-200',
  },
  active_alerts: {
    icon: Bell,
    color: 'text-[#006B4F] dark:text-emerald-400',
    iconBg: 'bg-[#EAF5F0] dark:bg-emerald-950/50 border-[#006B4F]/20',
  },
  reports_24h: {
    icon: FileText,
    color: 'text-[#006B4F] dark:text-emerald-400',
    iconBg: 'bg-[#EAF5F0] dark:bg-emerald-950/50 border-[#006B4F]/20',
  },
};

/* ═══════════════════════════════════════════════════════════
   1. Monitored Risk Zones
   ═══════════════════════════════════════════════════════════ */
function ZonesDetail({ zones }) {
  return (
    <div className="space-y-3">
      {zones.map((z) => (
        <div
          key={z.zone_id}
          className="p-4 rounded-xl border border-[#D9E2DE] dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span className="font-bold text-sm text-[#1F2937] dark:text-white">
                {z.village_name}
              </span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-500">
                {z.zone_id}
              </span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide ${severityBadge(z.severity)}`}>
              {z.severity}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 dark:text-zinc-500 block mb-0.5">Risk Score</span>
              <div className="flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-bold text-[#1F2937] dark:text-white">{(z.risk_score * 100).toFixed(0)}%</span>
              </div>
            </div>
            <div>
              <span className="text-slate-400 dark:text-zinc-500 block mb-0.5">Status</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Monitoring</span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-zinc-500 block mb-0.5">Coordinates</span>
              <span className="font-mono text-[11px] text-slate-600 dark:text-zinc-300">{z.lat.toFixed(4)}, {z.lng.toFixed(4)}</span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-zinc-500 block mb-0.5">Last Updated</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span className="font-mono text-[11px] text-slate-600 dark:text-zinc-300">{fmtDate(z.last_updated)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}

      {zones.length === 0 && (
        <div className="py-12 text-center text-slate-400 dark:text-zinc-600">
          <Activity className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-semibold">No zones data available</p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   2. High / Critical Zones
   ═══════════════════════════════════════════════════════════ */
function HighRiskDetail({ zones }) {
  const filtered = zones.filter((z) => z.severity === 'high' || z.severity === 'critical');

  return (
    <div className="space-y-3">
      {filtered.map((z) => (
        <div
          key={z.zone_id}
          className={`p-4 rounded-xl border transition-shadow hover:shadow-md ${
            z.severity === 'critical'
              ? 'bg-red-50/70 dark:bg-red-950/20 border-red-300 dark:border-red-900/60'
              : 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900/60'
          }`}
        >
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Shield className={`w-4 h-4 ${z.severity === 'critical' ? 'text-red-500' : 'text-amber-500'}`} />
              <span className="font-bold text-sm text-[#1F2937] dark:text-white">
                {z.village_name}
              </span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide ${severityBadge(z.severity)}`}>
              {z.severity}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 dark:text-zinc-500 block mb-0.5">Risk Score</span>
              <div className="flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-bold text-[#1F2937] dark:text-white">{(z.risk_score * 100).toFixed(0)}%</span>
                <div className="flex-1 h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden ml-1">
                  <div
                    className={`h-full rounded-full ${z.severity === 'critical' ? 'bg-red-500' : 'bg-amber-500'}`}
                    style={{ width: `${z.risk_score * 100}%` }}
                  />
                </div>
              </div>
            </div>
            <div>
              <span className="text-slate-400 dark:text-zinc-500 block mb-0.5">Zone ID</span>
              <span className="font-mono text-[11px] text-slate-600 dark:text-zinc-300">{z.zone_id}</span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-zinc-500 block mb-0.5">Warning</span>
              <span className={`font-semibold ${z.severity === 'critical' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {z.severity === 'critical' ? 'Evacuate Immediately' : 'High Alert Active'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-zinc-500 block mb-0.5">Last Updated</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span className="font-mono text-[11px] text-slate-600 dark:text-zinc-300">{fmtDate(z.last_updated)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="py-12 text-center text-slate-400 dark:text-zinc-600">
          <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-semibold">No high/critical zones at this time</p>
          <p className="text-xs text-slate-400 mt-1">All monitored zones are within safe thresholds</p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   3. Blocked Road Corridors
   ═══════════════════════════════════════════════════════════ */
function RoadsDetail({ roads }) {
  const blocked = roads.filter((r) => r.status === 'blocked');

  return (
    <div className="space-y-3">
      {blocked.map((r) => (
        <div
          key={r.road_id}
          className="p-4 rounded-xl border border-red-300 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-red-500" />
              <span className="font-bold text-sm text-[#1F2937] dark:text-white">
                {r.name}
              </span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusBadge(r.status)}`}>
              {r.status.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 dark:text-zinc-500 block mb-0.5">Road ID</span>
              <span className="font-mono text-[11px] text-slate-600 dark:text-zinc-300">{r.road_id}</span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-zinc-500 block mb-0.5">Affected Section</span>
              <span className="font-semibold text-slate-700 dark:text-zinc-200">
                {r.coordinates?.length || 0} waypoints
              </span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-zinc-500 block mb-0.5">Reason</span>
              <span className="font-semibold text-red-600 dark:text-red-400">Landslide Debris</span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-zinc-500 block mb-0.5">Last Updated</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span className="font-mono text-[11px] text-slate-600 dark:text-zinc-300">{fmtDate(r.last_updated)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Also show partial roads as contextual info */}
      {roads.filter((r) => r.status === 'partial').length > 0 && (
        <>
          <div className="flex items-center gap-2 pt-2">
            <div className="h-px flex-1 bg-slate-200 dark:bg-zinc-800" />
            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Partially Blocked</span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-zinc-800" />
          </div>
          {roads.filter((r) => r.status === 'partial').map((r) => (
            <div
              key={r.road_id}
              className="p-4 rounded-xl border border-amber-300 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-amber-500" />
                  <span className="font-bold text-sm text-[#1F2937] dark:text-white">
                    {r.name}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusBadge(r.status)}`}>
                  {r.status.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 dark:text-zinc-500 block mb-0.5">Road ID</span>
                  <span className="font-mono text-[11px] text-slate-600 dark:text-zinc-300">{r.road_id}</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-zinc-500 block mb-0.5">Affected Section</span>
                  <span className="font-semibold text-slate-700 dark:text-zinc-200">{r.coordinates?.length || 0} waypoints</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-zinc-500 block mb-0.5">Reason</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">Partial Debris / Erosion</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-zinc-500 block mb-0.5">Last Updated</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span className="font-mono text-[11px] text-slate-600 dark:text-zinc-300">{fmtDate(r.last_updated)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {blocked.length === 0 && roads.filter(r => r.status === 'partial').length === 0 && (
        <div className="py-12 text-center text-slate-400 dark:text-zinc-600">
          <Route className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-semibold">All road corridors are clear</p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   4. Active Community Alerts
   ═══════════════════════════════════════════════════════════ */
function AlertsDetail({ alerts }) {
  return (
    <div className="space-y-3">
      {alerts.map((a) => (
        <div
          key={a.alert_id}
          className={`p-4 rounded-xl border transition-shadow hover:shadow-md ${
            a.severity === 'critical'
              ? 'bg-red-50/70 dark:bg-red-950/20 border-red-300 dark:border-red-900/60'
              : a.severity === 'high'
              ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900/60'
              : 'bg-white dark:bg-zinc-900/50 border-[#D9E2DE] dark:border-zinc-800'
          }`}
        >
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Radio className={`w-4 h-4 ${a.severity === 'critical' ? 'text-red-500 animate-pulse' : a.severity === 'high' ? 'text-amber-500' : 'text-emerald-500'}`} />
              <span className="font-bold text-sm text-[#1F2937] dark:text-white">
                {a.village}
              </span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-500">
                {a.alert_id}
              </span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide ${severityBadge(a.severity)}`}>
              {a.severity}
            </span>
          </div>

          <p className="text-xs text-slate-700 dark:text-zinc-200 font-medium mb-3 leading-relaxed">
            {a.message}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 dark:text-zinc-500 block mb-0.5">Zone</span>
              <span className="font-mono text-[11px] text-slate-600 dark:text-zinc-300">{a.zone_id}</span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-zinc-500 block mb-0.5">Channels</span>
              <div className="flex items-center gap-1">
                {a.sent_via?.map((ch) => (
                  <span key={ch} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-[10px] font-semibold text-slate-600 dark:text-zinc-400 uppercase">
                    {ch}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-slate-400 dark:text-zinc-500 block mb-0.5">Status</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Active</span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-zinc-500 block mb-0.5">Issued</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span className="font-mono text-[11px] text-slate-600 dark:text-zinc-300">{fmtDate(a.timestamp)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}

      {alerts.length === 0 && (
        <div className="py-12 text-center text-slate-400 dark:text-zinc-600">
          <Bell className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-semibold">No active community alerts</p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   5. Field Reports
   ═══════════════════════════════════════════════════════════ */
function ReportsDetail({ reports }) {
  return (
    <div className="space-y-3">
      {reports.map((r) => (
        <div
          key={r.report_id}
          className="p-4 rounded-xl border border-[#D9E2DE] dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              <span className="font-bold text-sm text-[#1F2937] dark:text-white">
                {r.report_id}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusBadge(r.status)}`}>
                {r.status.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <User className="w-3 h-3 text-slate-400" />
              <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 capitalize">{r.reporter_type}</span>
            </div>
          </div>

          <p className="text-xs text-slate-700 dark:text-zinc-200 font-medium mb-3 leading-relaxed">
            {r.description}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 dark:text-zinc-500 block mb-0.5">Location</span>
              <span className="font-mono text-[11px] text-slate-600 dark:text-zinc-300">{r.lat?.toFixed(4)}, {r.lng?.toFixed(4)}</span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-zinc-500 block mb-0.5">Type</span>
              <span className="font-semibold text-slate-700 dark:text-zinc-200">Landslide Observation</span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-zinc-500 block mb-0.5">Source</span>
              <span className="font-semibold capitalize text-slate-700 dark:text-zinc-200">{r.reporter_type}</span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-zinc-500 block mb-0.5">Submitted</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span className="font-mono text-[11px] text-slate-600 dark:text-zinc-300">{fmtDate(r.timestamp)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}

      {reports.length === 0 && (
        <div className="py-12 text-center text-slate-400 dark:text-zinc-600">
          <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-semibold">No recent field reports</p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN MODAL COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function CardDetailModal({
  isOpen,
  onClose,
  cardId,
  cardTitle,
  cardValue,
  zones = [],
  roads = [],
  alerts = [],
  reports = [],
}) {
  if (!isOpen || !cardId) return null;

  const meta = CARD_META[cardId] || CARD_META.total_zones;
  const Icon = meta.icon;

  const renderContent = () => {
    switch (cardId) {
      case 'total_zones':
        return <ZonesDetail zones={zones} />;
      case 'high_risk':
        return <HighRiskDetail zones={zones} />;
      case 'roads_blocked':
        return <RoadsDetail roads={roads} />;
      case 'active_alerts':
        return <AlertsDetail alerts={alerts} />;
      case 'reports_24h':
        return <ReportsDetail reports={reports} />;
      default:
        return null;
    }
  };

  const subtitles = {
    total_zones: t('card_modal.sub_total_zones', { defaultValue: 'All monitored zones with location, risk level, status, coordinates, and latest readings' }),
    high_risk: t('card_modal.sub_high_risk', { defaultValue: 'Zones classified as High or Critical risk requiring immediate attention' }),
    roads_blocked: t('card_modal.sub_roads_blocked', { defaultValue: 'Road corridors currently blocked or partially obstructed by landslide events' }),
    active_alerts: t('card_modal.sub_active_alerts', { defaultValue: 'Community alerts currently active across monitored areas' }),
    reports_24h: t('card_modal.sub_reports_24h', { defaultValue: 'Recent field reports submitted by officials and citizens in the last 24 hours' }),
  };

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ animation: 'fadeIn 200ms ease-out' }}
    >
      <div
        className="relative w-full max-w-3xl bg-white dark:bg-zinc-950 border border-[#D9E2DE] dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        style={{ animation: 'slideUp 250ms ease-out' }}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#D9E2DE] dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${meta.iconBg}`}>
              <Icon className={`w-5 h-5 ${meta.color}`} />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-[#1F2937] dark:text-white flex items-center gap-2">
                <span>{cardTitle}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                  {cardValue} {t('common.items', { defaultValue: 'Items' })}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {subtitles[cardId]}
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

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {renderContent()}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#D9E2DE] dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-900/60">
          <div className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            <span>{t('card_modal.synced_dashboard', { defaultValue: 'Synced with dashboard data' })}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-[#D9E2DE] dark:border-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {t('common.back_dashboard', { defaultValue: 'Back to Dashboard' })}
          </button>
        </div>
      </div>

      {/* Inline keyframe animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
