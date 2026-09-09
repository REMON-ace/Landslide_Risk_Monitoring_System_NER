import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getRiskZones, getRoads, getVillages, updateRoadStatus } from '../api/client';
import MapView from '../components/MapView';
import ZoneDetailDrawer from '../components/ZoneDetailDrawer';
import CreateAlertModal from '../components/CreateAlertModal';
import { Map, Search, ChevronRight } from 'lucide-react';

export default function MapPage() {
  const { t } = useTranslation();
  const [zones, setZones] = useState([]);
  const [roads, setRoads] = useState([]);
  const [villages, setVillages] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    Promise.all([getRiskZones(), getRoads(), getVillages()]).then(
      ([zonesData, roadsData, villData]) => {
        setZones(zonesData || []);
        setRoads(roadsData || []);
        setVillages(villData || []);
      }
    );
  }, []);

  const handleUpdateRoadStatus = async (roadId, status) => {
    await updateRoadStatus(roadId, status);
    const updated = await getRoads();
    setRoads(updated);
  };

  const filteredZones = zones.filter((z) => {
    const matchesSeverity = filterSeverity === 'all' || z.severity === filterSeverity;
    const matchesSearch =
      z.village_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      z.zone_id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  return (
    <div className="space-y-4 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#006B4F] dark:text-emerald-400 flex items-center gap-2">
            <Map className="w-6 h-6 text-[#006B4F] dark:text-emerald-400" />
            <span>{t('map_page.title')}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {t('map_page.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('common.search')}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-[#D9E2DE] dark:border-zinc-800 text-xs text-[#1F2937] dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-[#006B4F] focus:ring-1 focus:ring-[#006B4F]"
            />
          </div>

          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-[#D9E2DE] dark:border-zinc-800 text-xs text-[#1F2937] dark:text-zinc-100 font-medium focus:outline-none focus:border-[#006B4F]"
          >
            <option value="all">{t('map_page.all_severities')}</option>
            <option value="critical">{t('severity.critical_short')}</option>
            <option value="high">{t('severity.high_short')}</option>
            <option value="medium">{t('severity.medium_short')}</option>
            <option value="low">{t('severity.low_short')}</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <MapView
            zones={filteredZones}
            roads={roads}
            villages={villages}
            selectedZoneId={selectedZone?.zone_id}
            onSelectZone={(z) => setSelectedZone(z)}
            onUpdateRoadStatus={handleUpdateRoadStatus}
            height="640px"
          />
        </div>

        <div className="lg:col-span-1 h-[640px] flex flex-col gap-4">
          {selectedZone ? (
            <ZoneDetailDrawer
              zone={selectedZone}
              onClose={() => setSelectedZone(null)}
              onOpenAlertModal={() => setIsAlertModalOpen(true)}
            />
          ) : (
            <div className="bg-white dark:bg-zinc-950 border border-[#D9E2DE] dark:border-zinc-800 rounded-xl p-4 flex-1 overflow-y-auto space-y-3 shadow-sm">
              <div className="pb-2 border-b border-[#D9E2DE] dark:border-zinc-800">
                <h3 className="font-bold text-xs text-[#006B4F] dark:text-emerald-400 uppercase tracking-wider">
                  {t('map_page.monitored_cells')} ({filteredZones.length})
                </h3>
                <p className="text-[11px] text-slate-500">{t('map_page.monitored_hint')}</p>
              </div>

              <div className="space-y-2">
                {filteredZones.map((z) => {
                  const severityBadge = {
                    critical: 'bg-[#E63946]',
                    high: 'bg-orange-600',
                    medium: 'bg-yellow-600',
                    low: 'bg-[#008060]',
                  }[z.severity];

                  return (
                    <div
                      key={z.zone_id}
                      onClick={() => setSelectedZone(z)}
                      className="p-2.5 rounded-xl bg-[#F5F7F6]/80 dark:bg-zinc-900 border border-[#D9E2DE] dark:border-zinc-800 hover:border-[#006B4F] cursor-pointer transition-all flex items-center justify-between group"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-[#1F2937] dark:text-zinc-100">
                            {z.village_name}
                          </span>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold text-white uppercase ${severityBadge}`}>
                            {t(`severity.${z.severity}_short`)}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">
                          {z.zone_id} • {t('map_page.score_label')}: {z.risk_score}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#006B4F] group-hover:translate-x-0.5 transition-all" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <CreateAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        zones={zones}
        defaultZone={selectedZone}
      />
    </div>
  );
}
