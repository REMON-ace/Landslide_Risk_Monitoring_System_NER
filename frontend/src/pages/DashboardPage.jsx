import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getDashboardSummary,
  getRiskZones,
  getRoads,
  getVillages,
  getFieldReports,
  getAlerts,
  getCurrentWeather,
  getSoilMoisture,
  updateRoadStatus,
} from '../api/client';
import SummaryCards from '../components/SummaryCards';
import MapView from '../components/MapView';
import ZoneDetailDrawer from '../components/ZoneDetailDrawer';
import CreateAlertModal from '../components/CreateAlertModal';
import AlertHistoryModal from '../components/AlertHistoryModal';
import CardDetailModal from '../components/CardDetailModal';
import MonitoredSituationModal from '../components/admin/MonitoredSituationModal';
import SubmitReportModal from '../components/admin/SubmitReportModal';
import AiRiskAssistant from '../components/admin/AiRiskAssistant';
import RiskBadge from '../components/admin/RiskBadge';
import StatusBadge from '../components/admin/StatusBadge';
import {
  RefreshCw,
  LayoutDashboard,
  Radio,
  FileText,
  MapPin,
  Route,
  CloudRain,
  Droplets,
  Thermometer,
  Wind,
  ArrowUpRight,
  Bell,
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  History,
  Layers,
  ChevronRight,
  Activity,
  Cpu,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

/* ─── Premium Card Wrapper ───────────────────────────────────────────── */
function Card({ children, className = '' }) {
  return (
    <div
      className={`bg-white dark:bg-[#0D0E10] border border-[#D9E2DE] dark:border-[#27272A] rounded-2xl shadow-xs transition-all duration-300 hover:shadow-sm overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}

function CardHeader({ title, kicker, badge, action }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#D9E2DE] dark:border-[#1E1E24] bg-white dark:bg-[#0D0E10]">
      <div>
        {kicker && (
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#006B4F] dark:text-emerald-400 mb-0.5">
            {kicker}
          </p>
        )}
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{title}</h3>
          {badge && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF5F0] dark:bg-emerald-950/40 text-[#006B4F] dark:text-emerald-400 border border-[#006B4F]/20">
              {badge}
            </span>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

/* ─── Main Dashboard Page ────────────────────────────────────────────── */
export default function DashboardPage() {
  const navigate = useNavigate();
  const mapSectionRef = useRef(null);

  const [summary, setSummary] = useState(null);
  const [zones, setZones] = useState([]);
  const [roads, setRoads] = useState([]);
  const [villages, setVillages] = useState([]);
  const [reports, setReports] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [weather, setWeather] = useState(null);
  const [soilSensors, setSoilSensors] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);

  // Modals state
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeCardDetail, setActiveCardDetail] = useState(null);
  const [isSituationModalOpen, setIsSituationModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [sumData, zonesData, roadsData, villData, repData, alertData, weatherData, soilData] =
        await Promise.all([
          getDashboardSummary().catch(() => null),
          getRiskZones().catch(() => []),
          getRoads().catch(() => []),
          getVillages().catch(() => []),
          getFieldReports().catch(() => []),
          getAlerts().catch(() => []),
          getCurrentWeather(25.32, 91.75).catch(() => null),
          getSoilMoisture().catch(() => []),
        ]);
      setSummary(sumData);
      setZones(zonesData || []);
      setRoads(roadsData || []);
      setVillages(villData || []);
      setReports(repData || []);
      setAlerts(alertData || []);
      setWeather(weatherData);
      setSoilSensors(soilData || []);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleUpdateRoadStatus = async (roadId, status) => {
    try {
      await updateRoadStatus(roadId, status);
      const updated = await getRoads();
      setRoads(updated || []);
      const updatedSum = await getDashboardSummary();
      setSummary(updatedSum);
    } catch (err) {
      console.error('Road update error:', err);
    }
  };

  const handleSelectZone = (zone) => {
    setSelectedZone(zone);
    mapSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Severity counts computed directly from active zone dataset
  const severityCounts = {
    critical: zones.filter((z) => z.severity?.toLowerCase() === 'critical').length,
    high: zones.filter((z) => z.severity?.toLowerCase() === 'high').length,
    medium: zones.filter((z) => z.severity?.toLowerCase() === 'medium').length,
    low: zones.filter((z) => z.severity?.toLowerCase() === 'low').length,
  };

  const totalZonesCount = zones.length || 1;

  const chartData = [
    { name: 'Critical', value: severityCounts.critical, color: '#E63946' },
    { name: 'High', value: severityCounts.high, color: '#EA580C' },
    { name: 'Medium', value: severityCounts.medium, color: '#D97706' },
    { name: 'Low', value: severityCounts.low, color: '#008060' },
  ].filter((d) => d.value > 0);

  // Top priority zones sorted by risk_score desc
  const priorityZones = [...zones]
    .sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0))
    .slice(0, 6);

  // Unified activity timeline merging alerts and reports
  const activityTimeline = [
    ...alerts.map((a) => ({
      id: `alert-${a.alert_id}`,
      type: 'alert',
      title: a.village ? `${a.village} Warning Alert` : `Sector ${a.zone_id} Directive`,
      description: a.message,
      severity: a.severity,
      time: a.timestamp ? new Date(a.timestamp) : new Date(),
      icon: Bell,
      iconBg: 'bg-red-50 dark:bg-red-950/40 text-[#E63946] border border-red-200/50 dark:border-red-900/30',
    })),
    ...reports.map((r) => ({
      id: `report-${r.report_id}`,
      type: 'report',
      title: `Field Incident #${r.report_id}`,
      description: r.description || 'Ground hazard report logged',
      status: r.status,
      time: r.timestamp ? new Date(r.timestamp) : new Date(),
      icon: FileText,
      iconBg: 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border border-sky-200/50 dark:border-sky-900/30',
    })),
  ]
    .sort((a, b) => b.time - a.time)
    .slice(0, 4);

  const formatRelativeTime = (date) => {
    const diffMs = Date.now() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ── Dashboard Hero Section ───────────────────────────────────── */}
      <div className="relative rounded-2xl bg-gradient-to-br from-[#00523C] via-[#006B4F] to-[#003B2B] text-white p-6 sm:p-7 shadow-lg overflow-hidden">
        {/* Subtle terrain / grid pattern background */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/10 text-emerald-200 border border-white/15 text-[11px] font-bold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>GIS Monitoring Active • East Khasi Hills</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white">
              Landslide Risk Monitoring
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 font-medium leading-relaxed">
              Regional Disaster Intelligence Dashboard — Monitor terrain risk, field reports, road network, directives and environmental telemetry from one unified console.
            </p>
          </div>

          {/* Quick Header Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsAlertModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-[#E63946] hover:bg-[#C92A37] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Issue Alert</span>
            </button>

            <button
              onClick={() => setIsHistoryOpen(true)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors"
              title="Alert History"
            >
              <History className="w-4 h-4" />
            </button>

            <button
              onClick={fetchAll}
              disabled={isLoading}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors disabled:opacity-50"
              title={`Last updated: ${lastRefreshed.toLocaleTimeString()}`}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Quick Actions Bar ────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setIsReportModalOpen(true)}
          className="whitespace-nowrap flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-[#0D0E10] border border-[#D9E2DE] dark:border-[#27272A] hover:border-[#006B4F] text-xs font-bold text-slate-800 dark:text-zinc-200 shadow-2xs hover:shadow-xs transition-all duration-200 hover:-translate-y-0.5"
        >
          <div className="w-5 h-5 rounded-lg bg-[#EAF5F0] dark:bg-emerald-950/40 text-[#006B4F] dark:text-emerald-400 flex items-center justify-center">
            <FileText className="w-3 h-3" />
          </div>
          <span>+ Submit Field Report</span>
        </button>

        <button
          onClick={() => navigate('/map')}
          className="whitespace-nowrap flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-[#0D0E10] border border-[#D9E2DE] dark:border-[#27272A] hover:border-[#006B4F] text-xs font-bold text-slate-800 dark:text-zinc-200 shadow-2xs hover:shadow-xs transition-all duration-200 hover:-translate-y-0.5"
        >
          <div className="w-5 h-5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-[#008060] dark:text-emerald-400 flex items-center justify-center">
            <Layers className="w-3 h-3" />
          </div>
          <span>+ Open Risk Map</span>
        </button>

        <button
          onClick={() => navigate('/alerts')}
          className="whitespace-nowrap flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-[#0D0E10] border border-[#D9E2DE] dark:border-[#27272A] hover:border-[#E63946] text-xs font-bold text-slate-800 dark:text-zinc-200 shadow-2xs hover:shadow-xs transition-all duration-200 hover:-translate-y-0.5"
        >
          <div className="w-5 h-5 rounded-lg bg-red-50 dark:bg-red-950/40 text-[#E63946] flex items-center justify-center">
            <Bell className="w-3 h-3" />
          </div>
          <span>+ View Alerts</span>
        </button>

        <button
          onClick={() => navigate('/predict')}
          className="whitespace-nowrap flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-[#0D0E10] border border-[#D9E2DE] dark:border-[#27272A] hover:border-[#006B4F] text-xs font-bold text-slate-800 dark:text-zinc-200 shadow-2xs hover:shadow-xs transition-all duration-200 hover:-translate-y-0.5"
        >
          <div className="w-5 h-5 rounded-lg bg-[#EAF5F0] dark:bg-emerald-950/40 text-[#006B4F] dark:text-emerald-400 flex items-center justify-center">
            <Cpu className="w-3 h-3" />
          </div>
          <span>+ Risk Predictor</span>
        </button>

        <button
          onClick={() => setIsSituationModalOpen(true)}
          className="whitespace-nowrap flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#EAF5F0] dark:bg-emerald-950/30 border border-[#006B4F]/30 hover:border-[#006B4F] text-xs font-bold text-[#006B4F] dark:text-emerald-400 shadow-2xs hover:shadow-xs transition-all duration-200 hover:-translate-y-0.5"
        >
          <div className="w-5 h-5 rounded-lg bg-[#006B4F] text-white flex items-center justify-center">
            <MapPin className="w-3 h-3" />
          </div>
          <span>+ Monitored Situation</span>
        </button>
      </div>

      {/* ── Redesigned KPI Cards ─────────────────────────────────────── */}
      <SummaryCards
        summary={summary}
        zones={zones}
        isLoading={isLoading}
        onCardClick={(cardId, cardTitle, cardValue) =>
          setActiveCardDetail({ cardId, cardTitle, cardValue })
        }
      />

      {/* ── Impressive Risk Distribution & Activity ─────────────────── */}
      <div id="risk-distribution" className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Donut Chart + Severity Bars (7 cols) */}
        <div className="lg:col-span-7">
          <Card>
            <CardHeader
              kicker="Terrain Vulnerability"
              title="Risk Distribution Analysis"
              badge={`${zones.length} Monitored Zones`}
            />
            <div className="p-5 space-y-4">
              {zones.length === 0 ? (
                <div className="h-52 flex items-center justify-center text-xs text-slate-400">
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  Loading terrain zones…
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                  {/* Donut chart */}
                  <div className="sm:col-span-5 h-48 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={72}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {chartData.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: '#0D0E10',
                            border: '1px solid #27272A',
                            borderRadius: 10,
                            color: '#fff',
                            fontSize: 11,
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xl font-black font-mono text-slate-900 dark:text-white leading-none">
                        {zones.length}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                        Zones
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Severity Progress Bars */}
                  <div className="sm:col-span-7 space-y-2.5">
                    {[
                      {
                        label: 'Critical',
                        count: severityCounts.critical,
                        color: '#E63946',
                        bg: 'bg-red-500',
                      },
                      {
                        label: 'High',
                        count: severityCounts.high,
                        color: '#EA580C',
                        bg: 'bg-orange-500',
                      },
                      {
                        label: 'Medium',
                        count: severityCounts.medium,
                        color: '#D97706',
                        bg: 'bg-amber-500',
                      },
                      {
                        label: 'Low',
                        count: severityCounts.low,
                        color: '#008060',
                        bg: 'bg-emerald-600',
                      },
                    ].map(({ label, count, color, bg }) => {
                      const pct = Math.round((count / totalZonesCount) * 100);
                      return (
                        <div key={label} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                              <span className="text-slate-800 dark:text-zinc-200">{label}</span>
                            </div>
                            <div className="flex items-center gap-2 font-mono">
                              <span className="text-slate-500 dark:text-zinc-400 text-[11px]">{pct}%</span>
                              <span className="font-bold text-slate-900 dark:text-white">{count}</span>
                            </div>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${bg}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right: Live Activity & Alert Feed (5 cols) */}
        <div className="lg:col-span-5">
          <Card className="h-full flex flex-col justify-between">
            <div>
              <CardHeader
                kicker="Operational Feed"
                title="Recent Directives & Activity"
                action={
                  <Link
                    to="/alerts"
                    className="text-xs font-bold text-[#006B4F] dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                  >
                    All alerts <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                }
              />

              <div className="divide-y divide-[#D9E2DE] dark:divide-[#1E1E24]">
                {activityTimeline.length === 0 ? (
                  <p className="p-8 text-center text-xs text-slate-400">
                    No recent directives or field reports logged.
                  </p>
                ) : (
                  activityTimeline.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.id}
                        className="p-4 hover:bg-[#F5F7F6] dark:hover:bg-[#141418] transition-colors flex items-start gap-3"
                      >
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${item.iconBg}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {item.title}
                            </h4>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {formatRelativeTime(item.time)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-zinc-400 line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="p-3 border-t border-[#D9E2DE] dark:border-[#1E1E24] bg-[#F8FAF9] dark:bg-[#121417] text-center">
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="text-xs font-bold text-[#006B4F] dark:text-emerald-400 hover:underline"
              >
                + Log Ground Incident Verification
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* ── GIS Hazard Map Section ───────────────────────────────────── */}
      <div ref={mapSectionRef} id="map-section">
        <Card>
          <CardHeader
            kicker="Geospatial Terrain Intelligence"
            title="East Khasi Hills — GIS Hazard Map"
            badge="Interactive"
            action={
              <Link
                to="/map"
                className="text-xs font-bold text-[#006B4F] dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                Open Full Screen Map <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            }
          />
          <div className="p-0">
            <div className={`grid grid-cols-1 transition-all duration-300 ${selectedZone ? 'lg:grid-cols-3' : ''}`}>
              <div className={selectedZone ? 'lg:col-span-2' : ''}>
                <MapView
                  zones={zones}
                  roads={roads}
                  villages={villages}
                  selectedZoneId={selectedZone?.zone_id}
                  onSelectZone={setSelectedZone}
                  onUpdateRoadStatus={handleUpdateRoadStatus}
                  height="480px"
                />
              </div>
              {selectedZone && (
                <div className="lg:col-span-1 h-[480px] overflow-auto border-t lg:border-t-0 lg:border-l border-[#D9E2DE] dark:border-[#27272A]">
                  <ZoneDetailDrawer
                    zone={selectedZone}
                    onClose={() => setSelectedZone(null)}
                    onOpenAlertModal={() => setIsAlertModalOpen(true)}
                  />
                </div>
              )}
            </div>

            {/* Map Legend Footer */}
            <div className="p-3.5 border-t border-[#D9E2DE] dark:border-[#1E1E24] bg-[#F8FAF9] dark:bg-[#121417] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4">
                <span className="font-bold text-slate-700 dark:text-zinc-300 text-[11px] uppercase tracking-wider">
                  Hazard Legend:
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#008060]" />
                  <span className="text-[11px] text-slate-600 dark:text-zinc-400">Low</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
                  <span className="text-[11px] text-slate-600 dark:text-zinc-400">Medium</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C]" />
                  <span className="text-[11px] text-slate-600 dark:text-zinc-400">High</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E63946]" />
                  <span className="text-[11px] text-slate-600 dark:text-zinc-400">Critical</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                Click any zone marker to view telemetry & trigger directives
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Priority Risk Zones Table ────────────────────────────────── */}
      <div id="priority-zones">
        <Card>
          <CardHeader
            kicker="Surveillance Focus"
            title="High Priority Terrain Sectors"
            badge={`${priorityZones.length} Zones`}
            action={
              <Link
                to="/map"
                className="text-xs font-bold text-[#006B4F] dark:text-emerald-400 hover:underline flex items-center gap-0.5"
              >
                Inspect All on Map <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            }
          />
          {priorityZones.length === 0 ? (
            <p className="p-8 text-center text-xs text-slate-400">No risk zones loaded from GIS backend.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#006B4F] text-white">
                    <th className="px-4 py-3 text-left font-bold">Zone ID</th>
                    <th className="px-4 py-3 text-left font-bold">Village / Sector</th>
                    <th className="px-4 py-3 text-left font-bold">Risk Level</th>
                    <th className="px-4 py-3 text-left font-bold hidden md:table-cell">Score</th>
                    <th className="px-4 py-3 text-right font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E2DE] dark:divide-[#1E1E24]">
                  {priorityZones.map((z) => {
                    const isCritical = z.severity?.toLowerCase() === 'critical';
                    const pct = Math.min(100, Math.round((z.risk_score || 0) * 100));
                    return (
                      <tr
                        key={z.zone_id}
                        className={`transition-colors ${
                          isCritical
                            ? 'bg-red-50/40 dark:bg-red-950/15 hover:bg-red-50 dark:hover:bg-red-950/25'
                            : 'hover:bg-[#F5F7F6] dark:hover:bg-[#141418]'
                        }`}
                      >
                        <td className="px-4 py-3 font-mono font-bold text-[#006B4F] dark:text-emerald-400">
                          {z.zone_id}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                          {z.village_name || 'Unmapped Sector'}
                        </td>
                        <td className="px-4 py-3">
                          <RiskBadge severity={z.severity} />
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-slate-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-1.5 rounded-full ${
                                  z.severity === 'critical'
                                    ? 'bg-[#E63946]'
                                    : z.severity === 'high'
                                    ? 'bg-[#EA580C]'
                                    : z.severity === 'medium'
                                    ? 'bg-[#D97706]'
                                    : 'bg-[#008060]'
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="font-mono font-bold text-slate-700 dark:text-zinc-300">
                              {z.risk_score}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleSelectZone(z)}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#EAF5F0] dark:bg-emerald-950/40 text-[#006B4F] dark:text-emerald-400 hover:bg-[#006B4F] hover:text-white font-bold transition-colors text-[11px]"
                          >
                            <MapPin className="w-3 h-3" />
                            <span>View on Map</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* ── Road Network & Environmental Telemetry ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Road Corridors */}
        <div id="roads-section">
          <Card>
            <CardHeader
              kicker="Transport Logistics"
              title="Regional Road Corridors"
              badge={`${roads.length} Corridors`}
            />
            {roads.length === 0 ? (
              <p className="p-8 text-center text-xs text-slate-400">No road segments loaded.</p>
            ) : (
              <div className="divide-y divide-[#D9E2DE] dark:divide-[#1E1E24] max-h-96 overflow-y-auto">
                {roads.map((r) => (
                  <div
                    key={r.road_id}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-[#F5F7F6] dark:hover:bg-[#141418] transition-colors"
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        r.status === 'blocked'
                          ? 'bg-red-50 dark:bg-red-950/40 text-[#E63946]'
                          : 'bg-emerald-50 dark:bg-emerald-950/40 text-[#008060]'
                      }`}
                    >
                      <Route className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {r.name}
                      </p>
                      <p className="text-[10px] font-mono text-slate-400">ID: {r.road_id}</p>
                    </div>
                    <StatusBadge status={r.status} />
                    <div className="flex gap-1.5 shrink-0">
                      {r.status !== 'clear' && (
                        <button
                          onClick={() => handleUpdateRoadStatus(r.road_id, 'clear')}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-[#008060] dark:text-emerald-400 border border-emerald-200/60 hover:bg-emerald-100 transition-colors"
                        >
                          Mark Clear
                        </button>
                      )}
                      {r.status !== 'blocked' && (
                        <button
                          onClick={() => handleUpdateRoadStatus(r.road_id, 'blocked')}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-red-50 dark:bg-red-950/40 text-[#E63946] dark:text-red-400 border border-red-200/60 hover:bg-red-100 transition-colors"
                        >
                          Mark Blocked
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Weather & Soil Moisture Sensors */}
        <div id="weather-sensors">
          <Card>
            <CardHeader
              kicker="Environmental Telemetry"
              title="Hydrological & Soil Conditions"
              badge="Active"
            />
            <div className="p-5 space-y-4">
              {/* 4 Sensor tiles with meaningful visual accents */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: '24h Rainfall',
                    icon: CloudRain,
                    value: weather?.rainfall_24h ?? '65.2',
                    unit: 'mm',
                    iconBg: 'bg-sky-50 dark:bg-sky-950/40 text-sky-600',
                  },
                  {
                    label: '72h Cumulative',
                    icon: Droplets,
                    value: weather?.rainfall_72h ?? '210.0',
                    unit: 'mm',
                    iconBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600',
                  },
                  {
                    label: 'Peak Intensity',
                    icon: Thermometer,
                    value: weather?.rainfall_intensity_peak ?? '28.4',
                    unit: 'mm/h',
                    iconBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600',
                  },
                  {
                    label: 'Antecedent Index (ARI)',
                    icon: Wind,
                    value: weather?.antecedent_rainfall_index ?? '145.7',
                    unit: '',
                    iconBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-[#006B4F]',
                  },
                ].map(({ label, icon: I, value, unit, iconBg }) => (
                  <div
                    key={label}
                    className="p-3.5 rounded-xl bg-[#F5F7F6] dark:bg-[#141418] border border-[#D9E2DE] dark:border-[#27272A] space-y-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${iconBg}`}>
                        <I className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-zinc-400">
                        {label}
                      </span>
                    </div>
                    <div className="text-lg font-black font-mono text-slate-900 dark:text-white">
                      {value} <span className="text-xs font-normal text-slate-400">{unit}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Soil Sensors */}
              {soilSensors.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-[#D9E2DE] dark:border-[#1E1E24]">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-zinc-200">
                    <span>Soil Moisture IoT Sensors</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {soilSensors.length} active probes
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {soilSensors.slice(0, 4).map((s) => {
                      const pct = Math.round((s.moisture || 0) * 100);
                      const high = (s.moisture || 0) > 0.65;
                      return (
                        <div
                          key={s.sensor_id}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-[#D9E2DE] dark:border-[#27272A] bg-[#F5F7F6]/60 dark:bg-[#141418]"
                        >
                          <div>
                            <p className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                              {s.sensor_id}
                            </p>
                            <p className="text-[10px] text-slate-400">Zone {s.zone_id}</p>
                          </div>
                          <div className="text-right">
                            <span
                              className={`font-mono font-bold text-xs ${
                                high ? 'text-[#E63946]' : 'text-[#008060]'
                              }`}
                            >
                              {pct}%
                            </span>
                            <p className="text-[9px] text-slate-400">{high ? 'Near sat.' : 'Nominal'}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* ── Glowing AI Assistant (Floating Desktop & Mobile) ─────────── */}
      <AiRiskAssistant
        zones={zones}
        roads={roads}
        alerts={alerts}
        weather={weather}
        soilSensors={soilSensors}
        reports={reports}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenSituationModal={() => setIsSituationModalOpen(true)}
      />

      {/* ── Modals ───────────────────────────────────────────────────── */}
      <CreateAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        zones={zones}
        defaultZone={selectedZone}
        onAlertCreated={fetchAll}
      />

      <AlertHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      <CardDetailModal
        isOpen={!!activeCardDetail}
        onClose={() => setActiveCardDetail(null)}
        cardId={activeCardDetail?.cardId}
        cardTitle={activeCardDetail?.cardTitle}
        cardValue={activeCardDetail?.cardValue}
        zones={zones}
        roads={roads}
        alerts={alerts}
        reports={reports}
      />

      <MonitoredSituationModal
        isOpen={isSituationModalOpen}
        onClose={() => setIsSituationModalOpen(false)}
        zones={zones}
        roads={roads}
        alerts={alerts}
        weather={weather}
        soilSensors={soilSensors}
        onOpenReport={() => setIsReportModalOpen(true)}
        onSelectZone={handleSelectZone}
      />

      <SubmitReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onReportSubmitted={fetchAll}
      />
    </div>
  );
}
