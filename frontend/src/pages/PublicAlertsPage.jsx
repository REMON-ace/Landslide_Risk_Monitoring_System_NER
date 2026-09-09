import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getAlerts, getVillages } from '../api/client';
import { cacheData, getCachedData } from '../db/indexedDb';
import AlertHistoryModal from '../components/AlertHistoryModal';
import {
  Bell,
  AlertOctagon,
  AlertTriangle,
  PhoneCall,
  ShieldAlert,
  Info,
  Clock,
  Radio,
  History,
} from 'lucide-react';

export default function PublicAlertsPage() {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState([]);
  const [villages, setVillages] = useState([]);
  const [selectedVillage, setSelectedVillage] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [isCached, setIsCached] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    getAlerts()
      .then((data) => {
        setAlerts(data || []);
        cacheData('offline_alerts', data || []);
      })
      .catch(async () => {
        const cached = await getCachedData('offline_alerts');
        if (cached) {
          setAlerts(cached);
          setIsCached(true);
        }
      });

    getVillages()
      .then((v) => setVillages(v || []))
      .catch(() => {});
  }, []);

  const filteredAlerts = alerts.filter((a) => {
    const matchesVillage =
      selectedVillage === 'all' ||
      a.village === selectedVillage ||
      a.zone_id === selectedVillage;
    const matchesSeverity =
      selectedSeverity === 'all' || a.severity === selectedSeverity;
    return matchesVillage && matchesSeverity;
  });

  const severityStyles = {
    critical: { border: 'border-[#E63946]/40', badge: 'bg-[#E63946] text-white', bg: 'bg-red-50/60 dark:bg-red-950/20', icon: AlertOctagon },
    high:     { border: 'border-orange-500/40', badge: 'bg-orange-600 text-white', bg: 'bg-orange-50/60 dark:bg-orange-950/20', icon: AlertTriangle },
    medium:   { border: 'border-amber-500/40', badge: 'bg-amber-600 text-white', bg: 'bg-amber-50/60 dark:bg-amber-950/20', icon: Info },
    low:      { border: 'border-[#008060]/40', badge: 'bg-[#008060] text-white', bg: 'bg-[#EAF5F0]/60 dark:bg-emerald-950/20', icon: Info },
  };

  const emergencyContacts = [
    { nameKey: 'emergency_contacts.deoc_name', number: '1077', descKey: 'emergency_contacts.deoc_desc' },
    { nameKey: 'emergency_contacts.sdma_name', number: '0364-2503022', descKey: 'emergency_contacts.sdma_desc' },
    { nameKey: 'emergency_contacts.sdrf_name', number: '112', descKey: 'emergency_contacts.sdrf_desc' },
    { nameKey: 'emergency_contacts.police_name', number: '0364-2222214', descKey: 'emergency_contacts.police_desc' },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <div className="pt-2">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-red-50 text-[#E63946] border border-red-200">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#006B4F] dark:text-emerald-400">
                {t('alerts_view.title')}
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {t('alerts_view.subtitle')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#D9E2DE] dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 hover:text-red-600 dark:hover:text-red-400 font-bold text-xs shadow-sm transition-all"
            title="View Emergency Alert History Log"
          >
            <History className="w-4 h-4 text-red-500" />
            <span>Alert History</span>
          </button>
        </div>
      </div>

      {isCached && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-800 flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{t('alerts_view.cached_notice')}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-[#D9E2DE] dark:border-zinc-800 flex flex-wrap items-center gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#1F2937] dark:text-zinc-300">
            {t('alerts_view.filter_village_label')}:
          </span>
          <select
            value={selectedVillage}
            onChange={(e) => setSelectedVillage(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-[#D9E2DE] dark:border-zinc-800 text-[#1F2937] dark:text-zinc-200 font-medium focus:outline-none focus:border-[#006B4F]"
          >
            <option value="all">{t('alerts_view.filter_all_village')}</option>
            {villages.map((v) => (
              <option key={v.village_id} value={v.name}>{v.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-[#1F2937] dark:text-zinc-300">
            {t('alerts_view.filter_severity_label')}:
          </span>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-[#D9E2DE] dark:border-zinc-800 text-[#1F2937] dark:text-zinc-200 font-medium focus:outline-none focus:border-[#006B4F]"
          >
            <option value="all">{t('alerts_view.filter_all_severity')}</option>
            <option value="critical">{t('alerts_view.filter_critical')}</option>
            <option value="high">{t('alerts_view.filter_high')}</option>
            <option value="medium">{t('alerts_view.filter_medium')}</option>
            <option value="low">{t('alerts_view.filter_low')}</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts Feed */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-[#006B4F] dark:text-emerald-400 flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#006B4F] dark:text-emerald-400" />
            <span>{t('alerts_view.active_directives')} ({filteredAlerts.length})</span>
          </h2>

          <div className="space-y-3">
            {filteredAlerts.length === 0 ? (
              <div className="p-12 text-center rounded-xl bg-white dark:bg-zinc-950 border border-[#D9E2DE] dark:border-zinc-800 text-xs text-slate-400">
                {t('alerts_view.empty')}
              </div>
            ) : (
              filteredAlerts.map((alert) => {
                const style = severityStyles[alert.severity] || severityStyles.medium;
                return (
                  <div
                    key={alert.alert_id}
                    className={`p-5 rounded-xl border ${style.border} ${style.bg} transition-all space-y-3 shadow-sm`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#1F2937] dark:text-white">
                          {alert.alert_id}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${style.badge}`}>
                          {t(`severity.${alert.severity}_short`)}
                        </span>
                        <span className="font-bold text-xs text-slate-800 dark:text-zinc-200">
                          {alert.village} Sector
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(alert.timestamp).toLocaleString([], {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-[#1F2937] dark:text-zinc-100 leading-relaxed">
                      {alert.message}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-[#D9E2DE] dark:border-zinc-800/80 text-[11px] text-slate-500 font-mono">
                      <span>{t('alerts_view.broadcast_via')}: {alert.sent_via?.join(' • ')?.toUpperCase()}</span>
                      <span>{t('alerts_view.target_zone')}: {alert.zone_id}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Emergency contacts */}
          <div className="p-5 rounded-xl bg-white dark:bg-zinc-950 border border-[#D9E2DE] dark:border-zinc-800 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-[#006B4F] dark:text-emerald-400 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-[#E63946]" />
              <span>{t('alerts_view.helpline_title')}</span>
            </h3>
            <div className="space-y-2.5 text-xs">
              {emergencyContacts.map((contact, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-[#F5F7F6] dark:bg-zinc-900 border border-[#D9E2DE] dark:border-zinc-800 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-[#1F2937] dark:text-zinc-200 block">
                      {t(contact.nameKey)}
                    </span>
                    <span className="text-[10px] text-slate-500">{t(contact.descKey)}</span>
                  </div>
                  <a
                    href={`tel:${contact.number}`}
                    className="px-2.5 py-1 rounded-lg bg-[#E63946] hover:bg-[#c92a37] text-white font-mono font-bold text-xs flex items-center gap-1 shadow-sm transition-colors"
                  >
                    <span>{contact.number}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Safety Rules */}
          <div className="p-5 rounded-xl bg-white dark:bg-zinc-950 border border-[#D9E2DE] dark:border-zinc-800 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-[#006B4F] dark:text-emerald-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#006B4F]" />
              <span>{t('alerts_view.safety_guidelines')}</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-zinc-300">
              <li className="flex items-start gap-2">
                <span className="text-[#008060] font-bold">✓</span>
                <span>{t('safety.do1')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#008060] font-bold">✓</span>
                <span>{t('safety.do2')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#E63946] font-bold">✗</span>
                <span>{t('safety.dont1')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#E63946] font-bold">✗</span>
                <span>{t('safety.dont2')}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <AlertHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </div>
  );
}
