import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getDashboardSummary, getRiskZones, getRoads, getVillages } from '../../api/client';
import MapView from '../MapView';
import { ArrowRight, ShieldAlert, AlertTriangle, Route, Bell, Radio, Clock } from 'lucide-react';

export default function LiveRiskSection() {
  const { t } = useTranslation();

  const [summary, setSummary] = useState(null);
  const [zones, setZones] = useState([]);
  const [roads, setRoads] = useState([]);
  const [villages, setVillages] = useState([]);
  const [lastUpdatedTime, setLastUpdatedTime] = useState('23:41:53');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Format current time or dynamic timestamp
    const now = new Date();
    setLastUpdatedTime(
      now.toTimeString().split(' ')[0]
    );

    const loadLiveData = async () => {
      setIsLoading(true);
      try {
        const [sumData, zonesData, roadsData, villData] = await Promise.all([
          getDashboardSummary().catch(() => null),
          getRiskZones().catch(() => []),
          getRoads().catch(() => []),
          getVillages().catch(() => []),
        ]);
        setSummary(sumData);
        setZones(zonesData || []);
        setRoads(roadsData || []);
        setVillages(villData || []);
      } catch (err) {
        console.error('Failed to load live risk data on landing page:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadLiveData();
  }, []);

  const monitoredZonesCount = summary?.total_zones_monitored ?? (zones.length > 0 ? zones.length : 7);
  const criticalZonesCount =
    summary?.high_risk_zones ??
    zones.filter((z) => z.severity === 'high' || z.severity === 'critical').length ??
    3;
  const blockedCorridorsCount =
    summary?.roads_blocked ?? roads.filter((r) => r.status === 'blocked').length ?? 2;
  const activeAlertsCount = summary?.active_alerts ?? 3;

  return (
    <section id="risk-view" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* ── LEFT COLUMN: Text, CTA & Monitoring Status Panel (5 cols) ── */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#006B4F]">
                {t('landing.live_risk.kicker', { defaultValue: 'LIVE RISK VIEW' })}
              </p>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                {t('landing.live_risk.heading', { defaultValue: 'Know the Risk Before It Happens' })}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {t('landing.live_risk.description', {
                  defaultValue:
                    'Explore real-time risk zones, monitoring stations, road networks and vulnerable communities across East Khasi Hills.',
                })}
              </p>
            </div>

            {/* Open Live Risk Map Button */}
            <div>
              <Link
                to="/map"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#006B4F] hover:bg-[#00523C] text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-[0.98] group"
              >
                <span>{t('landing.live_risk.btn_open_map', { defaultValue: 'Open Live Risk Map' })}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Current Monitoring Status Card */}
            <div className="bg-[#F8FAF9] border border-[#D9E2DE] rounded-2xl p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-[#D9E2DE] pb-3">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    {t('landing.live_risk.status_title', { defaultValue: 'CURRENT MONITORING STATUS' })}
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-[#006B4F] font-bold">
                  EAST KHASI HILLS
                </span>
              </div>

              {/* Status List */}
              <div className="divide-y divide-slate-200/70 text-xs">
                {/* Monitored Zones */}
                <div className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-700">
                    <ShieldAlert className="w-4 h-4 text-[#006B4F]" />
                    <span className="font-medium">
                      {t('landing.live_risk.monitored_zones', { defaultValue: 'Monitored Zones' })}
                    </span>
                  </div>
                  <span className="font-extrabold text-slate-900 font-mono text-sm">
                    {monitoredZonesCount}
                  </span>
                </div>

                {/* Critical Zones */}
                <div className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-700">
                    <AlertTriangle className="w-4 h-4 text-[#E63946]" />
                    <span className="font-medium">
                      {t('landing.live_risk.critical_zones', { defaultValue: 'Critical Zones' })}
                    </span>
                  </div>
                  <span className="font-extrabold text-[#E63946] font-mono text-sm">
                    {criticalZonesCount}
                  </span>
                </div>

                {/* Blocked Corridors */}
                <div className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Route className="w-4 h-4 text-amber-600" />
                    <span className="font-medium">
                      {t('landing.live_risk.blocked_corridors', { defaultValue: 'Blocked Corridors' })}
                    </span>
                  </div>
                  <span className="font-extrabold text-amber-700 font-mono text-sm">
                    {blockedCorridorsCount}
                  </span>
                </div>

                {/* Active Alerts */}
                <div className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Bell className="w-4 h-4 text-purple-600" />
                    <span className="font-medium">
                      {t('landing.live_risk.active_alerts', { defaultValue: 'Active Alerts' })}
                    </span>
                  </div>
                  <span className="font-extrabold text-purple-700 font-mono text-sm">
                    {activeAlertsCount}
                  </span>
                </div>
              </div>

              {/* Timestamp Footer */}
              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200/70">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t('landing.live_risk.last_updated', { defaultValue: 'Last updated:' })}</span>
                </div>
                <span className="font-mono font-semibold text-slate-700">{lastUpdatedTime}</span>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Actual Existing GIS Map Component (7 cols) ─ */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl overflow-hidden border border-[#D9E2DE] shadow-lg relative">
              <MapView
                zones={zones}
                roads={roads}
                villages={villages}
                height="480px"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
