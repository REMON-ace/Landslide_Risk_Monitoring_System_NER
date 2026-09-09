import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getAlerts, getVillages, getRiskZones, getFieldReports } from '../api/client';
import { cacheData, getCachedData } from '../db/indexedDb';
import AlertHistoryModal from '../components/AlertHistoryModal';
import CreateAlertModal from '../components/CreateAlertModal';
import AlertDetailModal from '../components/AlertDetailModal';
import PageHeader from '../components/admin/PageHeader';
import SectionCard from '../components/admin/SectionCard';
import RiskBadge from '../components/admin/RiskBadge';
import {
  Bell,
  Radio,
  History,
  PhoneCall,
  ShieldAlert,
  Clock,
  Filter,
  RefreshCw,
  PlusCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  MapPin,
  Map,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

export default function PublicAlertsPage() {
  const { t } = useTranslation();
  const { isOfficial } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [villages, setVillages] = useState([]);
  const [zones, setZones] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedVillage, setSelectedVillage] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [isCached, setIsCached] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedAlertForModal, setSelectedAlertForModal] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const loadAlerts = async () => {
    setIsLoading(true);
    try {
      const [alertsData, villagesData, zonesData, reportsData] = await Promise.all([
        getAlerts().catch(async () => {
          const cached = await getCachedData('offline_alerts');
          if (cached) {
            setIsCached(true);
            return cached;
          }
          return [];
        }),
        getVillages().catch(() => []),
        getRiskZones().catch(() => []),
        getFieldReports().catch(() => []),
      ]);

      const combined = [...(alertsData || [])];
      const existingIds = new Set(combined.map((a) => a.alert_id));

      (reportsData || []).forEach((r) => {
        const altId = `AL-${(r.report_id || '').replace('FR-', '')}`;
        if (!existingIds.has(r.report_id) && !existingIds.has(altId)) {
          combined.push({
            alert_id: r.report_id,
            village: r.village || 'Sohra',
            district: r.district || 'East Khasi Hills',
            zone_id: r.zone_id || 'RZ-FIELD-REPORT',
            severity: r.severity || 'medium',
            message: r.description || 'Ground hazard report submitted by field responder.',
            description: r.description,
            details: r.description,
            sent_via: ['field_report', 'app'],
            channels: ['field_report', 'app'],
            timestamp: r.timestamp || r.submitted_at || new Date().toISOString(),
            sent_at: r.timestamp || r.submitted_at || new Date().toISOString(),
            lat: r.lat,
            lng: r.lng,
            photo_url: r.photo_url,
          });
        }
      });

      combined.sort(
        (a, b) =>
          new Date(b.timestamp || b.sent_at || Date.now()) -
          new Date(a.timestamp || a.sent_at || Date.now())
      );

      setAlerts(combined);
      setVillages(villagesData || []);
      setZones(zonesData || []);
      if (Array.isArray(combined) && combined.length > 0) {
        cacheData('offline_alerts', combined);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const districtList = Array.from(
    new Set([
      'East Khasi Hills',
      'West Khasi Hills',
      'South West Khasi Hills',
      'Ri-Bhoi',
      'East Jaintia Hills',
      'West Jaintia Hills',
      'East Garo Hills',
      'West Garo Hills',
      'South Garo Hills',
      'North Garo Hills',
      'South West Garo Hills',
      ...alerts.map((a) => a.district).filter(Boolean),
      ...villages.map((v) => v.district).filter(Boolean),
    ])
  );

  const filteredAlerts = alerts.filter((a) => {
    const matchesDistrict =
      selectedDistrict === 'all' || (a.district || '').toLowerCase() === selectedDistrict.toLowerCase();
    const matchesVillage =
      selectedVillage === 'all' ||
      a.village === selectedVillage ||
      a.zone_id === selectedVillage;
    const matchesSeverity =
      selectedSeverity === 'all' || (a.severity || '').toLowerCase() === selectedSeverity;
    return matchesDistrict && matchesVillage && matchesSeverity;
  });

  const emergencyContacts = [
    { name: 'DEOC Shillong (Emergency Control)', number: '1077', desc: 'Toll-free 24/7 District EOC' },
    { name: 'Meghalaya SDMA Control Room', number: '0364-2503022', desc: 'State Disaster Management Authority' },
    { name: 'SDRF Quick Response Team', number: '112', desc: 'Unified Emergency Response Support' },
    { name: 'Police Control Room (Sohra/Shillong)', number: '0364-2222214', desc: 'Law & Order & Evacuation Escort' },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <PageHeader
        kicker="Emergency Directives & Early Warning"
        title="Public Directives & Hazard Warning Bulletins"
        description="Official early warning advisory bulletins dispatched to communities, local Dorbar Shnongs, emergency services, and ground response coordinators."
        badge={`${filteredAlerts.length} Directives Issued`}
        actions={
          <>
            {isOfficial && (
              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-3.5 py-2 rounded-lg bg-[#E63946] hover:bg-[#C92A37] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Broadcast Directive</span>
              </button>
            )}

            <button
              onClick={() => setIsHistoryOpen(true)}
              className="px-3 py-2 rounded-lg bg-white dark:bg-[#141418] border border-[#D9E2DE] dark:border-[#27272A] text-slate-700 dark:text-zinc-300 hover:text-[#006B4F] text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5"
            >
              <History className="w-3.5 h-3.5 text-slate-500" />
              <span>Full Archive Log</span>
            </button>

            <button
              onClick={loadAlerts}
              disabled={isLoading}
              className="p-2 rounded-lg bg-white dark:bg-[#141418] border border-[#D9E2DE] dark:border-[#27272A] text-slate-700 dark:text-zinc-300 hover:text-[#006B4F] text-xs transition-all shadow-xs"
              title="Refresh alerts"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </>
        }
      />

      {isCached && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Displaying cached emergency bulletins from local encrypted storage due to offline connectivity.</span>
        </div>
      )}

      {/* ── Filter Bar ─────────────────────────────────────────── */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#0D0E10] border border-[#D9E2DE] dark:border-[#27272A] flex flex-wrap items-center gap-4 text-xs shadow-sm">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700 dark:text-zinc-300">District:</span>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#F5F7F6] dark:bg-[#141418] border border-[#D9E2DE] dark:border-[#27272A] text-slate-800 dark:text-zinc-200 font-medium focus:outline-none focus:border-[#006B4F]"
          >
            <option value="all">All Districts ({districtList.length})</option>
            {districtList.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700 dark:text-zinc-300">Sector / Village:</span>
          <select
            value={selectedVillage}
            onChange={(e) => setSelectedVillage(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#F5F7F6] dark:bg-[#141418] border border-[#D9E2DE] dark:border-[#27272A] text-slate-800 dark:text-zinc-200 font-medium focus:outline-none focus:border-[#006B4F]"
          >
            <option value="all">All Villages & Sectors ({villages.length})</option>
            {villages.map((v) => (
              <option key={v.village_id} value={v.name}>
                {v.name} ({v.district || 'East Khasi Hills'})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700 dark:text-zinc-300">Severity:</span>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#F5F7F6] dark:bg-[#141418] border border-[#D9E2DE] dark:border-[#27272A] text-slate-800 dark:text-zinc-200 font-medium focus:outline-none focus:border-[#006B4F]"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* ── Main Layout: Alerts Feed + Emergency Helplines ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Active Directives Stream */}
        <div className="lg:col-span-8 space-y-4">
          <SectionCard
            kicker="Active Hazard Directives"
            title="Emergency Bulletins Feed"
            subtitle="Advisories prioritized by geomorphological severity index and community vulnerability."
            badge={`${filteredAlerts.length} Directives`}
          >
            <div className="space-y-3.5">
              {filteredAlerts.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400 dark:text-zinc-500">
                  No active emergency directives matching the selected criteria.
                </div>
              ) : (
                filteredAlerts.map((alert) => {
                  const imageUrl = alert.photo_url || alert.image_url || alert.image;
                  const hasImage = Boolean(imageUrl);

                  return (
                    <div
                      key={alert.alert_id}
                      onClick={() => {
                        setSelectedAlertForModal(alert);
                        setIsDetailModalOpen(true);
                      }}
                      className="p-5 rounded-xl border border-[#D9E2DE] dark:border-[#27272A] bg-white dark:bg-[#0D0E10] shadow-xs hover:border-[#006B4F]/50 transition-all space-y-3 cursor-pointer group"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-xs font-bold text-slate-800 dark:text-white">
                            {alert.alert_id}
                          </span>
                          <RiskBadge severity={alert.severity} />
                          <span className="font-bold text-xs text-slate-800 dark:text-zinc-200">
                            {alert.village || 'Sohra'} Sector ({alert.district || 'East Khasi Hills'})
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(alert.timestamp || alert.sent_at || Date.now()).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Main Message Headline */}
                      <p className="text-sm font-black text-slate-900 dark:text-zinc-100 leading-snug group-hover:text-[#006B4F] dark:group-hover:text-emerald-400 transition-colors">
                        {alert.message}
                      </p>

                      {/* Detailed Description of the Problem */}
                      {(alert.description || alert.details) && (
                        <div className="p-3 rounded-lg bg-[#F5F7F6]/80 dark:bg-[#141418] border border-[#D9E2DE]/80 dark:border-zinc-800/80 text-xs text-slate-700 dark:text-zinc-300 leading-relaxed font-medium">
                          <strong className="block text-[10px] uppercase font-bold text-[#006B4F] dark:text-emerald-400 mb-1">
                            Detailed Hazard Situation & Advisory:
                          </strong>
                          <p>{alert.description || alert.details}</p>
                        </div>
                      )}

                      {/* Image display if available */}
                      {hasImage && (
                        <div className="relative rounded-xl overflow-hidden border border-[#D9E2DE] dark:border-zinc-800 max-h-56 bg-black/10">
                          <img
                            src={imageUrl}
                            alt="Hazard situation proof"
                            className="w-full h-48 object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPhoto(imageUrl);
                            }}
                          />
                          <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 text-white text-[10px] font-bold">
                            Click to Enlarge
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2.5 border-t border-[#D9E2DE]/70 dark:border-[#27272A]/70 text-[11px] text-slate-500 font-mono flex-wrap gap-2">
                        <span>Configured Channels: {(alert.sent_via || alert.channels)?.join(' • ')?.toUpperCase() || 'APP • SMS'}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAlertForModal(alert);
                              setIsDetailModalOpen(true);
                            }}
                            className="px-3 py-1 rounded-lg bg-[#006B4F]/10 dark:bg-emerald-950/40 text-[#006B4F] dark:text-emerald-400 border border-[#006B4F]/20 font-bold text-xs hover:bg-[#006B4F] hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white transition-all flex items-center gap-1.5 shadow-xs"
                          >
                            <MapPin className="w-3.5 h-3.5" />
                            <span>View Location on Map</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </SectionCard>
        </div>

        {/* Right: Emergency Helplines & Safety Protocols */}
        <div className="lg:col-span-4 space-y-5">
          {/* Helplines Card */}
          <SectionCard
            kicker="Emergency Contacts"
            title="Helplines & Disaster Desk"
            subtitle="Immediate response assistance"
          >
            <div className="space-y-2.5 text-xs">
              {emergencyContacts.map((c, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-[#F5F7F6] dark:bg-[#141418] border border-[#D9E2DE] dark:border-[#27272A] flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <span className="font-bold text-slate-800 dark:text-white block truncate">
                      {c.name}
                    </span>
                    <span className="text-[10px] text-slate-500 truncate block">{c.desc}</span>
                  </div>
                  <a
                    href={`tel:${c.number}`}
                    className="px-2.5 py-1 rounded-md bg-[#E63946] hover:bg-[#C92A37] text-white font-mono font-bold text-xs shrink-0 transition-colors"
                  >
                    {c.number}
                  </a>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Safety Protocols Card */}
          <SectionCard
            kicker="Protocols"
            title="Landslide Safety Guidelines"
            subtitle="Advisories for local residents"
          >
            <ul className="space-y-2.5 text-xs text-slate-700 dark:text-zinc-300">
              <li className="flex items-start gap-2">
                <span className="text-[#008060] font-bold">✓</span>
                <span>Stay alert during continuous heavy rain (&gt;50mm/24h) and watch for hillside water pooling.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#008060] font-bold">✓</span>
                <span>Evacuate immediately if tensile cracks or bulging ground are observed near foundations.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#E63946] font-bold">✗</span>
                <span>Do NOT cross inundated hillside roads or bridges during flash floods or debris runs.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#E63946] font-bold">✗</span>
                <span>Do NOT stay in buildings located directly below steep, excavated road cuttings.</span>
              </li>
            </ul>
          </SectionCard>
        </div>
      </div>

      {/* Modals */}
      <CreateAlertModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        zones={zones}
        onAlertCreated={loadAlerts}
      />

      <AlertHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      <AlertDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        alert={selectedAlertForModal}
        zones={zones}
      />
    </div>
  );
}
