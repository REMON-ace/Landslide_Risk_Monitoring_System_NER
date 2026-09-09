// Citizen Risk Map — full interactive map (same as admin) without admin controls
import React, { useState, useEffect } from 'react';
import { getRiskZones, getRoads, getVillages } from '../../api/client';
import MapView from '../../components/MapView';
import ZoneDetailDrawer from '../../components/ZoneDetailDrawer';
import RiskBadge from '../../components/admin/RiskBadge';
import { Map, Search, ChevronRight, Filter, RefreshCw, AlertTriangle, Info } from 'lucide-react';

export default function CitizenMapPage() {
  const [zones,         setZones]         = useState([]);
  const [roads,         setRoads]         = useState([]);
  const [villages,      setVillages]      = useState([]);
  const [selectedZone,  setSelectedZone]  = useState(null);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [searchQuery,   setSearchQuery]   = useState('');
  const [isLoading,     setIsLoading]     = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [zonesData, roadsData, villData] = await Promise.all([
        getRiskZones(),
        getRoads(),
        getVillages(),
      ]);
      setZones(zonesData   || []);
      setRoads(roadsData   || []);
      setVillages(villData || []);
    } catch (err) {
      console.error('Failed to load map data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filteredZones = zones.filter(z => {
    const matchesSeverity =
      filterSeverity === 'all' || (z.severity || z.current_severity || '').toLowerCase() === filterSeverity;
    const matchesSearch =
      (z.village_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (z.zone_id      || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  const criticalCount = zones.filter(z => (z.severity || z.current_severity) === 'critical').length;
  const highCount     = zones.filter(z => (z.severity || z.current_severity) === 'high').length;

  return (
    <div className="space-y-4 pb-6">

      {/* ── Page Header ───────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Map className="w-5 h-5 text-[#006B4F]" />
            <h1 className="text-base font-black text-slate-900 dark:text-white">
              East Khasi Hills Risk Map
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Live geospatial view of landslide risk zones, monitored settlements, and road conditions.
            Click any zone for full details.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-[#006B4F] dark:text-emerald-400 border border-[#006B4F]/30 hover:bg-[#EAF5F0] dark:hover:bg-emerald-950/20 transition-all cursor-pointer disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Risk level notice */}
      {criticalCount > 0 || highCount > 0 ? (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-xs">
          <AlertTriangle className="w-4 h-4 text-[#E63946] shrink-0 animate-pulse" />
          <span className="font-semibold text-[#E63946]">
            {criticalCount} critical + {highCount} high risk zones active. Avoid marked hillside areas.
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-[#EAF5F0] dark:bg-emerald-950/20 border border-[#006B4F]/20 text-xs">
          <Info className="w-4 h-4 text-[#006B4F] shrink-0" />
          <span className="text-[#006B4F] font-semibold">No critical zones at this time. Conditions are stable.</span>
        </div>
      )}

      {/* ── Filter Controls ────────────────────────────────────── */}
      <div className="p-3.5 rounded-xl bg-white dark:bg-[#0D0E10] border border-[#D9E2DE] dark:border-[#27272A] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Filter by village name or zone ID..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#F5F7F6] dark:bg-[#141418] border border-[#D9E2DE] dark:border-[#27272A] text-xs text-slate-800 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-[#006B4F] focus:ring-1 focus:ring-[#006B4F] transition-all"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-600 dark:text-zinc-400">Severity:</span>
          <select
            value={filterSeverity}
            onChange={e => setFilterSeverity(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#F5F7F6] dark:bg-[#141418] border border-[#D9E2DE] dark:border-[#27272A] text-xs text-slate-800 dark:text-zinc-200 font-medium focus:outline-none focus:border-[#006B4F] transition-all"
          >
            <option value="all">All ({zones.length})</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* ── Map + Side Panel Grid ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

        {/* Interactive Map */}
        <div className="lg:col-span-3">
          <MapView
            zones={filteredZones}
            roads={roads}
            villages={villages}
            selectedZoneId={selectedZone?.zone_id}
            onSelectZone={z => setSelectedZone(z)}
            onUpdateRoadStatus={null}   /* Citizens cannot change road status */
            height="620px"
          />
        </div>

        {/* Side Inspection Panel */}
        <div className="lg:col-span-1 h-[620px] flex flex-col">
          {selectedZone ? (
            /* ZoneDetailDrawer reads isOfficial from AuthContext — admin buttons hidden for citizens */
            <ZoneDetailDrawer
              zone={selectedZone}
              onClose={() => setSelectedZone(null)}
              onOpenAlertModal={null}   /* Citizens cannot create alerts */
            />
          ) : (
            <div className="bg-white dark:bg-[#0D0E10] border border-[#D9E2DE] dark:border-[#27272A] rounded-xl p-4 flex-1 overflow-y-auto space-y-3 shadow-xs flex flex-col">
              <div className="pb-3 border-b border-[#D9E2DE] dark:border-[#1E1E24] shrink-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs text-[#006B4F] dark:text-emerald-400 uppercase tracking-wider">
                    Monitored Zones ({filteredZones.length})
                  </h3>
                  <span className="text-[10px] text-slate-400">Click to focus</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                  Select any zone to view risk score, weather data, and historical trend.
                </p>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-[#006B4F] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {filteredZones.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">No matching zones found.</div>
                  ) : (
                    filteredZones.map(z => (
                      <div
                        key={z.zone_id}
                        onClick={() => setSelectedZone(z)}
                        className="p-3 rounded-lg bg-[#F5F7F6]/70 dark:bg-[#141418] border border-[#D9E2DE] dark:border-[#27272A] hover:border-[#006B4F] dark:hover:border-emerald-500/50 cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                              {z.village_name}
                            </span>
                            <RiskBadge severity={z.severity || z.current_severity} size="xs" />
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
                            {z.zone_id} • Score: {z.risk_score ?? z.current_risk_score}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#006B4F] dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
