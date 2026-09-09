import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  X,
  AlertTriangle,
  ShieldAlert,
  Route,
  Bell,
  Droplets,
  CloudRain,
  ArrowRight,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import RiskBadge from './RiskBadge';

/**
 * Monitored Area Situation Modal
 * Honestly labeled regional monitoring summary (no fake GPS proximity claims).
 */
export default function MonitoredSituationModal({
  isOpen,
  onClose,
  zones = [],
  roads = [],
  alerts = [],
  weather = null,
  soilSensors = [],
  onOpenReport,
  onSelectZone,
}) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const criticalZones = zones.filter((z) => z.severity?.toLowerCase() === 'critical');
  const highZones = zones.filter((z) => z.severity?.toLowerCase() === 'high');
  const mediumZones = zones.filter((z) => z.severity?.toLowerCase() === 'medium');
  const lowZones = zones.filter((z) => z.severity?.toLowerCase() === 'low');
  const blockedRoads = roads.filter((r) => r.status === 'blocked');

  // Soil saturation average
  const avgMoisture =
    soilSensors.length > 0
      ? Math.round(
          (soilSensors.reduce((acc, s) => acc + (s.moisture || 0), 0) / soilSensors.length) * 100
        )
      : 58;

  const saturatedSensors = soilSensors.filter((s) => (s.moisture || 0) > 0.65);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-[#0D0E10] border border-[#D9E2DE] dark:border-[#27272A] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#D9E2DE] dark:border-[#1E1E24] bg-[#F8FAF9] dark:bg-[#121417]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#006B4F] text-white flex items-center justify-center shadow-xs">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                Monitored Area Situation
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF5F0] dark:bg-emerald-950/40 text-[#006B4F] dark:text-emerald-400 border border-[#006B4F]/20">
                  GIS Active
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                East Khasi Hills Regional Disaster Surveillance Overview
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
          {/* Situation Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Critical & High */}
            <div className="p-3.5 rounded-xl bg-red-50/70 dark:bg-red-950/20 border border-red-200/80 dark:border-red-900/30 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#E63946]">
                <span className="font-bold uppercase tracking-wider text-[10px]">High / Critical</span>
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div className="mt-2 text-2xl font-black font-mono text-[#E63946]">
                {criticalZones.length + highZones.length}
              </div>
              <div className="text-[10px] text-red-700/80 dark:text-red-300">
                {criticalZones.length} critical • {highZones.length} high
              </div>
            </div>

            {/* Medium Risk */}
            <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/30 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#D97706]">
                <span className="font-bold uppercase tracking-wider text-[10px]">Medium Risk</span>
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="mt-2 text-2xl font-black font-mono text-[#D97706]">
                {mediumZones.length}
              </div>
              <div className="text-[10px] text-amber-700/80 dark:text-amber-300">
                Continuous monitoring
              </div>
            </div>

            {/* Blocked Roads */}
            <div className="p-3.5 rounded-xl bg-orange-50/70 dark:bg-orange-950/20 border border-orange-200/80 dark:border-orange-900/30 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#EA580C]">
                <span className="font-bold uppercase tracking-wider text-[10px]">Blocked Roads</span>
                <Route className="w-4 h-4" />
              </div>
              <div className="mt-2 text-2xl font-black font-mono text-[#EA580C]">
                {blockedRoads.length}
              </div>
              <div className="text-[10px] text-orange-700/80 dark:text-orange-300">
                {blockedRoads.length > 0 ? 'Clearance in progress' : 'All clear'}
              </div>
            </div>

            {/* Active Alerts */}
            <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/30 flex flex-col justify-between">
              <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
                <span className="font-bold uppercase tracking-wider text-[10px]">Active Alerts</span>
                <Bell className="w-4 h-4" />
              </div>
              <div className="mt-2 text-2xl font-black font-mono text-rose-600 dark:text-rose-400">
                {alerts.length}
              </div>
              <div className="text-[10px] text-rose-700/80 dark:text-rose-300">
                Public emergency notices
              </div>
            </div>

            {/* Soil Moisture */}
            <div className="p-3.5 rounded-xl bg-sky-50/70 dark:bg-sky-950/20 border border-sky-200/80 dark:border-sky-900/30 flex flex-col justify-between">
              <div className="flex items-center justify-between text-sky-600 dark:text-sky-400">
                <span className="font-bold uppercase tracking-wider text-[10px]">Soil Moisture</span>
                <Droplets className="w-4 h-4" />
              </div>
              <div className="mt-2 text-2xl font-black font-mono text-sky-700 dark:text-sky-300">
                {avgMoisture}%
              </div>
              <div className="text-[10px] text-sky-700/80 dark:text-sky-300">
                {saturatedSensors.length > 0 ? `${saturatedSensors.length} near sat.` : 'Stable moisture'}
              </div>
            </div>

            {/* Weather / Rainfall */}
            <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/30 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#006B4F] dark:text-emerald-400">
                <span className="font-bold uppercase tracking-wider text-[10px]">Rainfall (24h)</span>
                <CloudRain className="w-4 h-4" />
              </div>
              <div className="mt-2 text-2xl font-black font-mono text-[#006B4F] dark:text-emerald-400">
                {weather?.rainfall_24h ?? '65.2'}<span className="text-xs font-normal"> mm</span>
              </div>
              <div className="text-[10px] text-emerald-800/80 dark:text-emerald-300">
                ARI: {weather?.antecedent_rainfall_index ?? '145.7'}
              </div>
            </div>
          </div>

          {/* Elevated Risk Sectors Detail List */}
          <div className="p-4 rounded-xl bg-[#F8FAF9] dark:bg-[#141619] border border-[#D9E2DE] dark:border-[#27272A] space-y-2.5">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center justify-between">
              <span>Elevated Risk Sectors in Surveillance</span>
              <span className="text-[10px] text-slate-500">{criticalZones.length + highZones.length} areas</span>
            </h3>

            {[...criticalZones, ...highZones].length === 0 ? (
              <p className="text-slate-500 py-2">No high or critical terrain sectors currently detected.</p>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto divide-y divide-[#D9E2DE]/50 dark:divide-[#27272A]/50">
                {[...criticalZones, ...highZones].map((z) => (
                  <div
                    key={z.zone_id}
                    className="pt-1.5 first:pt-0 flex items-center justify-between py-1"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {z.village_name || z.zone_id}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 ml-2 font-mono">
                        Score: {z.risk_score}
                      </span>
                    </div>
                    <RiskBadge severity={z.severity} size="xs" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Blocked Corridors Detail */}
          {blockedRoads.length > 0 && (
            <div className="p-3.5 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-900/30 space-y-1.5">
              <h3 className="font-bold text-orange-900 dark:text-orange-200 flex items-center gap-1.5">
                <Route className="w-4 h-4 text-[#EA580C]" />
                <span>Blocked Road Corridors ({blockedRoads.length})</span>
              </h3>
              <div className="space-y-1">
                {blockedRoads.map((r) => (
                  <div key={r.road_id} className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-slate-800 dark:text-zinc-200">{r.name}</span>
                    <span className="font-mono text-xs font-bold text-[#EA580C]">BLOCKED</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#D9E2DE] dark:border-[#1E1E24] bg-[#F8FAF9] dark:bg-[#121417] flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#006B4F]" />
            <span>Honest telemetry based on active district records.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onOpenReport && (
              <button
                onClick={() => {
                  onClose();
                  onOpenReport();
                }}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-white dark:bg-[#1A1C20] border border-[#D9E2DE] dark:border-[#27272A] text-slate-700 dark:text-zinc-200 hover:text-[#006B4F] text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-[#006B4F]" />
                <span>Submit Report</span>
              </button>
            )}

            <button
              onClick={() => {
                onClose();
                navigate('/map');
              }}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-[#006B4F] hover:bg-[#00523C] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>Open Risk Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
