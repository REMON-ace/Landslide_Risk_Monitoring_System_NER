// Citizen Alerts Page — read-only view of active emergency alerts
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAlerts, getRiskZones } from '../../api/client';
import AlertDetailModal from '../../components/AlertDetailModal';
import {
  Bell, MapPin, Clock, Filter, AlertTriangle,
  CheckCircle2, Info, RefreshCw,
} from 'lucide-react';

const SEVERITY_CONFIG = {
  critical: {
    dot:   'bg-red-500 animate-pulse',
    card:  'border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/10',
    badge: 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
    label: 'text-red-600 dark:text-red-400',
  },
  high: {
    dot:   'bg-orange-500',
    card:  'border-orange-200 dark:border-orange-900/40 bg-orange-50/50 dark:bg-orange-950/10',
    badge: 'bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    label: 'text-orange-600 dark:text-orange-400',
  },
  medium: {
    dot:   'bg-yellow-500',
    card:  'border-yellow-200 dark:border-yellow-900/40',
    badge: 'bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    label: 'text-yellow-600 dark:text-yellow-400',
  },
  low: {
    dot:   'bg-green-500',
    card:  'border-[#D9E2DE] dark:border-[#27272A]',
    badge: 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
    label: 'text-green-600 dark:text-green-400',
  },
};

export default function CitizenAlertsPage() {
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [selectedAlertForModal, setSelectedAlertForModal] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { data: alerts = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['citizen_alerts'],
    queryFn:  getAlerts,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });

  const { data: zones = [] } = useQuery({
    queryKey: ['citizen_zones'],
    queryFn: getRiskZones,
    staleTime: 1000 * 60,
  });

  const filtered = alerts.filter(a =>
    filterSeverity === 'all' || a.severity === filterSeverity
  );

  const criticalAlerts = alerts.filter(a => a.severity === 'critical');

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Bell className="w-5 h-5 text-[#006B4F]" />
            <h1 className="text-base font-black text-slate-900 dark:text-white">Emergency Alerts</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Live landslide warnings and advisories issued by the district operations centre.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-[#006B4F] dark:text-emerald-400 border border-[#006B4F]/30 hover:bg-[#EAF5F0] dark:hover:bg-emerald-950/20 transition-all cursor-pointer disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Critical alert banner */}
      {criticalAlerts.length > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border-2 border-red-300 dark:border-red-800">
          <AlertTriangle className="w-5 h-5 text-[#E63946] shrink-0 animate-pulse" />
          <div>
            <p className="text-xs font-black text-[#E63946]">
              ⚠ {criticalAlerts.length} CRITICAL ALERT{criticalAlerts.length > 1 ? 'S' : ''} ACTIVE
            </p>
            <p className="text-[11px] text-red-600/80 dark:text-red-400/80 mt-0.5">
              Immediate action required. Follow official evacuation instructions.
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        {['all', 'critical', 'high', 'medium', 'low'].map(sev => (
          <button
            key={sev}
            onClick={() => setFilterSeverity(sev)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold capitalize transition-all cursor-pointer border ${
              filterSeverity === sev
                ? 'bg-[#006B4F] text-white border-[#006B4F]'
                : 'bg-white dark:bg-[#0D0E10] text-slate-600 dark:text-zinc-300 border-[#D9E2DE] dark:border-[#27272A] hover:border-[#006B4F]/50'
            }`}
          >
            {sev === 'all' ? `All (${alerts.length})` : `${sev} (${alerts.filter(a => a.severity === sev).length})`}
          </button>
        ))}
      </div>

      {/* Alert list */}
      {isLoading ? (
        <div className="flex justify-center py-14">
          <div className="w-8 h-8 border-3 border-[#006B4F] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-14 gap-3">
          <CheckCircle2 className="w-10 h-10 text-[#006B4F]" />
          <p className="font-bold text-sm text-slate-700 dark:text-zinc-200">
            {filterSeverity === 'all' ? 'No active alerts' : `No ${filterSeverity} alerts`}
          </p>
          <p className="text-xs text-slate-500 text-center max-w-xs">
            {filterSeverity === 'all'
              ? 'Your district is currently clear. Continue to check regularly during monsoon season.'
              : 'Try a different severity filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(alert => {
            const cfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.low;
            return (
              <div
                key={alert.alert_id}
                onClick={() => {
                  setSelectedAlertForModal(alert);
                  setIsDetailModalOpen(true);
                }}
                className={`rounded-xl border p-4 space-y-3 transition-all cursor-pointer hover:border-[#006B4F]/50 ${cfg.card}`}
              >
                {/* Header row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg.dot}`} />
                    <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-zinc-400">
                      {alert.alert_id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${cfg.badge}`}>
                      {alert.severity}
                    </span>
                  </div>
                </div>

                {/* Message */}
                <p className="text-sm font-semibold text-slate-800 dark:text-zinc-100 leading-relaxed">
                  {alert.message}
                </p>

                {/* Meta */}
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 pt-1 border-t border-black/5 dark:border-white/5">
                  <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-[#006B4F]" />
                    {alert.village || alert.zone_id}
                  </span>
                  <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                    Click for description & location map →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Emergency contacts */}
      <div className="rounded-xl bg-[#EAF5F0] dark:bg-emerald-950/20 border border-[#006B4F]/15 dark:border-emerald-900/30 p-4 space-y-2">
        <p className="text-[11px] font-black text-[#006B4F] dark:text-emerald-400 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5" /> Emergency Contacts
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-zinc-400">
          <div><span className="font-bold">SDRF Helpline:</span> 1077</div>
          <div><span className="font-bold">District Control Room:</span> 0364-2224003</div>
          <div><span className="font-bold">Police:</span> 100</div>
          <div><span className="font-bold">Ambulance:</span> 108</div>
        </div>
      </div>

      <AlertDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        alert={selectedAlertForModal}
        zones={zones}
      />
    </div>
  );
}
