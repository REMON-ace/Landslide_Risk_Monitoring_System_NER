// Citizen Dashboard — overview for verified residents
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { getAlerts, getRiskZones } from '../../api/client';
import { Link } from 'react-router-dom';
import {
  Bell, MapPin, AlertTriangle, ShieldCheck, ChevronRight,
  Info, Clock, CheckCircle2,
} from 'lucide-react';
import { translateMessage } from '../../utils/translateMessage';

const SEVERITY_CONFIG = {
  critical: { dot: 'bg-red-500',    badge: 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' },
  high:     { dot: 'bg-orange-500', badge: 'bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800' },
  medium:   { dot: 'bg-yellow-500', badge: 'bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800' },
  low:      { dot: 'bg-green-500',  badge: 'bg-green-100  dark:bg-green-950/50  text-green-700  dark:text-green-400  border-green-200  dark:border-green-800'  },
};

export default function CitizenDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ['citizen_alerts'],
    queryFn: getAlerts,
    staleTime: 1000 * 30,
  });

  const { data: zones = [], isLoading: zonesLoading } = useQuery({
    queryKey: ['citizen_zones'],
    queryFn: getRiskZones,
    staleTime: 1000 * 60,
  });

  const criticalCount = zones.filter(z => {
    const s = z.severity || z.current_severity;
    return s === 'critical' || s === 'high';
  }).length;

  const recentAlerts = alerts.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#006B4F] to-[#004f3a] p-5 sm:p-6 text-white shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 opacity-80" />
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">{t('citizen.verified_badge', 'Verified Resident')}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-black">
              {t('citizen.welcome_back', 'Welcome back, {{name}}', { name: user?.username || t('citizen.default_user', 'Citizen') })}
            </h1>
            <p className="text-[11px] opacity-70 max-w-sm">
              {t('citizen.monitoring_sub', 'Real-time landslide monitoring for {{district}}. Stay informed and help your community by reporting hazards.', { district: user?.district || 'East Khasi Hills' })}
            </p>
          </div>
          <div className="shrink-0 hidden sm:flex flex-col items-center gap-1.5">
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
              <Bell className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold opacity-80">{t('summary.subtext_alerts_count', '{{count}} Active', { count: alerts.length })}</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: t('summary.active_alerts', 'Active Alerts'), value: alerts.length, icon: Bell, color: 'text-[#E63946]', bg: 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30', to: '/citizen/alerts' },
          { label: t('summary.high_risk', 'High Risk Zones'), value: criticalCount, icon: AlertTriangle, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900/30', to: '/citizen/map' },
          { label: t('summary.monitored_zones', 'Monitored Zones'), value: zones.length, icon: MapPin, color: 'text-[#006B4F] dark:text-emerald-400', bg: 'bg-[#EAF5F0] dark:bg-emerald-950/20 border-[#006B4F]/15 dark:border-emerald-900/30', to: '/citizen/map' },
        ].map(({ label, value, icon: Icon, color, bg, to }) => (
          <Link key={label} to={to}
            className={`rounded-xl border p-3.5 flex flex-col gap-1.5 ${bg} hover:shadow-md transition-shadow`}
          >
            <Icon className={`w-4 h-4 ${color}`} />
            <p className={`text-xl font-black ${color}`}>{value}</p>
            <p className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 leading-tight">{label}</p>
          </Link>
        ))}
      </div>

      {/* Recent Alerts */}
      <div className="rounded-xl bg-white dark:bg-[#0D0E10] border border-[#D9E2DE] dark:border-[#27272A] overflow-hidden shadow-xs">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#D9E2DE] dark:border-[#27272A] bg-[#F8FAF9] dark:bg-[#121215]">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#006B4F]" />
            <h2 className="text-xs font-black text-slate-800 dark:text-zinc-100">{t('top_header.active_directives', 'Recent Alerts')}</h2>
          </div>
          <Link to="/citizen/alerts" className="text-[11px] font-bold text-[#006B4F] dark:text-emerald-400 hover:underline flex items-center gap-1">
            {t('top_header.view_all', 'View all')} <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {alertsLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-[#006B4F] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : recentAlerts.length === 0 ? (
          <div className="flex flex-col items-center py-8 gap-2">
            <CheckCircle2 className="w-8 h-8 text-[#006B4F]" />
            <p className="text-xs font-semibold text-slate-600 dark:text-zinc-300">{t('alerts_list.empty', 'No active alerts')}</p>
            <p className="text-[11px] text-slate-400">{t('citizen.safe_district', 'Your district is currently safe.')}</p>
          </div>
        ) : (
          <div className="divide-y divide-[#D9E2DE]/60 dark:divide-[#27272A]/60">
            {recentAlerts.map((alert) => {
              const cfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.medium;
              return (
                <div key={alert.alert_id} className="p-4 hover:bg-[#F8FAF9] dark:hover:bg-[#121215] transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${cfg.dot} animate-pulse`} />
                      <span className="font-mono text-[10px] text-slate-400">{alert.alert_id}</span>
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${cfg.badge}`}>
                      {t(`severity.${alert.severity}_short`, alert.severity?.toUpperCase())}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed line-clamp-2">
                    {translateMessage(alert.message, t)}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{alert.village || alert.zone_id}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(alert.timestamp || alert.sent_at).toLocaleTimeString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link to="/citizen/reports"
          className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-[#0D0E10] border border-[#D9E2DE] dark:border-[#27272A] hover:border-[#006B4F]/40 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#EAF5F0] dark:bg-emerald-950/30 flex items-center justify-center">
              <Bell className="w-4 h-4 text-[#006B4F]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-zinc-100">{t('landing.cta.btn_report', 'Report a Hazard')}</p>
              <p className="text-[10px] text-slate-500">{t('report_form.subtitle', 'Submit your field observation')}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#006B4F] transition-colors" />
        </Link>

        <Link to="/citizen/map"
          className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-[#0D0E10] border border-[#D9E2DE] dark:border-[#27272A] hover:border-[#006B4F]/40 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#EAF5F0] dark:bg-emerald-950/30 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-[#006B4F]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-zinc-100">{t('landing.features.card1_title', 'Risk Zone Map')}</p>
              <p className="text-[10px] text-slate-500">{t('landing.features.card1_desc', 'View active risk zones near you')}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#006B4F] transition-colors" />
        </Link>
      </div>

      {/* Safety Tips */}
      <div className="rounded-xl bg-[#EAF5F0] dark:bg-emerald-950/20 border border-[#006B4F]/15 dark:border-emerald-900/30 p-4 space-y-3">
        <p className="text-[11px] font-black text-[#006B4F] dark:text-emerald-400 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5" /> {t('alerts_page.safety_title', 'Safety Guidance — Monsoon Season')}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            t('safety.do1', 'Avoid slopes and hillside areas during heavy rainfall.'),
            t('safety.do2', 'Watch for cracks, water seepage or unusual sounds — evacuate immediately.'),
            t('citizen.emergency_sdrf', 'Keep emergency number handy: District SDRF — 1077.'),
            t('landing.cta.subtitle', 'Report any hazards you observe. Every report matters.'),
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-2">
              <ChevronRight className="w-3 h-3 text-[#006B4F] shrink-0 mt-0.5" />
              <span className="text-[11px] text-slate-600 dark:text-zinc-400">{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
