import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getDashboardSummary,
  getRiskZones,
  getRoads,
  getVillages,
  getFieldReports,
  getAlerts,
  updateRoadStatus,
  updateFieldReportStatus,
} from '../api/client';
import SummaryCards from '../components/SummaryCards';
import MapView from '../components/MapView';
import ZoneDetailDrawer from '../components/ZoneDetailDrawer';
import ReportsFeed from '../components/ReportsFeed';
import AlertsList from '../components/AlertsList';
import CreateAlertModal from '../components/CreateAlertModal';
import AlertHistoryModal from '../components/AlertHistoryModal';
import CardDetailModal from '../components/CardDetailModal';
import { RefreshCw, Activity, History } from 'lucide-react';

export default function DashboardPage() {
  const { t } = useTranslation();
  const [summary, setSummary] = useState(null);
  const [zones, setZones] = useState([]);
  const [roads, setRoads] = useState([]);
  const [villages, setVillages] = useState([]);
  const [reports, setReports] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [activeCardDetail, setActiveCardDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [sumData, zonesData, roadsData, villData, repData, alertData] = await Promise.all([
        getDashboardSummary(),
        getRiskZones(),
        getRoads(),
        getVillages(),
        getFieldReports(),
        getAlerts(),
      ]);
      setSummary(sumData);
      setZones(zonesData || []);
      setRoads(roadsData || []);
      setVillages(villData || []);
      setReports(repData || []);
      setAlerts(alertData || []);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleUpdateRoadStatus = async (roadId, status) => {
    try {
      await updateRoadStatus(roadId, status);
      const updatedRoads = await getRoads();
      setRoads(updatedRoads);
      const updatedSum = await getDashboardSummary();
      setSummary(updatedSum);
    } catch (err) {
      console.error('Failed to update road status:', err);
    }
  };

  const handleUpdateReportStatus = async (reportId, status) => {
    try {
      await updateFieldReportStatus(reportId, status);
      const updatedReports = await getFieldReports();
      setReports(updatedReports);
    } catch (err) {
      console.error('Failed to update report status:', err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#006B4F] dark:text-emerald-400">
              {t('dashboard.title')}
            </h1>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF5F0] text-[#006B4F] dark:bg-emerald-950/50 dark:text-emerald-400 border border-[#006B4F]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006B4F] animate-ping"></span>
              {t('dashboard.pilot_district')}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            {t('dashboard.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500 dark:text-zinc-500 font-mono">
            {t('common.updated')}: {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>

          <button
            onClick={() => setIsHistoryModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 border border-[#D9E2DE] dark:border-zinc-800 transition-colors shadow-sm text-xs font-semibold"
            title="View Emergency Alert History Log"
          >
            <History className="w-3.5 h-3.5 text-red-500" />
            <span className="hidden sm:inline">Alert History</span>
          </button>

          <button
            onClick={fetchAllData}
            disabled={isLoading}
            className="p-2 rounded-xl bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:text-[#006B4F] dark:hover:text-emerald-400 border border-[#D9E2DE] dark:border-zinc-800 transition-colors shadow-sm disabled:opacity-50"
            title={t('common.refresh')}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <SummaryCards
        summary={summary}
        isLoading={isLoading}
        onCardClick={(cardId, cardTitle, cardValue) => setActiveCardDetail({ cardId, cardTitle, cardValue })}
      />

      {/* GIS Map Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className={`transition-all duration-300 ${selectedZone ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-[#006B4F] dark:text-emerald-400 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#006B4F] dark:text-emerald-400" />
              <span>{t('dashboard.map_section_title')}</span>
            </h2>
            <span className="text-[11px] text-slate-500 dark:text-zinc-500 font-mono">
              {t('dashboard.map_section_badge')}
            </span>
          </div>

          <MapView
            zones={zones}
            roads={roads}
            villages={villages}
            selectedZoneId={selectedZone?.zone_id}
            onSelectZone={(zone) => setSelectedZone(zone)}
            onUpdateRoadStatus={handleUpdateRoadStatus}
            height="520px"
          />
        </div>

        {selectedZone && (
          <div className="lg:col-span-1 h-[520px]">
            <ZoneDetailDrawer
              zone={selectedZone}
              onClose={() => setSelectedZone(null)}
              onOpenAlertModal={() => setIsAlertModalOpen(true)}
            />
          </div>
        )}
      </div>

      {/* Reports & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ReportsFeed reports={reports} onUpdateStatus={handleUpdateReportStatus} />
        <AlertsList alerts={alerts} onOpenCreateModal={() => setIsAlertModalOpen(true)} />
      </div>

      <CreateAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        zones={zones}
        defaultZone={selectedZone}
        onAlertCreated={fetchAllData}
      />

      <AlertHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
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
    </div>
  );
}
