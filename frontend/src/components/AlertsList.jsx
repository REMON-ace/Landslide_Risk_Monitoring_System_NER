import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import AlertHistoryModal from './AlertHistoryModal';
import {
  Bell,
  Radio,
  Clock,
  MapPin,
  History,
} from 'lucide-react';
import { translateMessage } from '../utils/translateMessage';

export default function AlertsList({ alerts = [], onOpenCreateModal }) {
  const { t } = useTranslation();
  const { isOfficial } = useAuth();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const severityStyles = {
    critical: {
      border: 'border-[#E63946]/40',
      badge: 'bg-[#E63946] text-white',
      bg: 'bg-red-50 dark:bg-red-950/20',
      icon: 'text-[#E63946]',
    },
    high: {
      border: 'border-orange-500/40',
      badge: 'bg-orange-600 text-white',
      bg: 'bg-orange-50 dark:bg-orange-950/20',
      icon: 'text-orange-500',
    },
    medium: {
      border: 'border-amber-500/40',
      badge: 'bg-amber-600 text-white',
      bg: 'bg-amber-50 dark:bg-amber-950/20',
      icon: 'text-amber-500',
    },
    low: {
      border: 'border-[#008060]/40',
      badge: 'bg-[#008060] text-white',
      bg: 'bg-[#EAF5F0] dark:bg-emerald-950/20',
      icon: 'text-[#008060]',
    },
  };

  return (
    <div className="bg-white dark:bg-zinc-950 border border-[#D9E2DE] dark:border-zinc-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-[#D9E2DE] dark:border-zinc-800 mb-4">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-[#006B4F] dark:text-emerald-400 flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#006B4F] dark:text-emerald-400" />
            <span>{t('alerts_list.title')}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {t('alerts_list.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#D9E2DE] dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 font-semibold text-xs shadow-sm transition-all"
            title="View Emergency Alert History Log"
          >
            <History className="w-3.5 h-3.5 text-red-500" />
            <span className="hidden sm:inline">Alert History</span>
          </button>

          {isOfficial && (
            <button
              onClick={onOpenCreateModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E63946] hover:bg-[#c92a37] text-white font-semibold text-xs shadow transition-all"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>{t('alerts_list.trigger_btn')}</span>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500">
            {t('alerts_list.empty')}
          </div>
        ) : (
          alerts.map((alert) => {
            const style = severityStyles[alert.severity] || severityStyles.medium;

            return (
              <div
                key={alert.alert_id}
                className={`p-3.5 rounded-xl border ${style.border} ${style.bg} transition-all space-y-2`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800 dark:text-zinc-200">
                      {alert.alert_id}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${style.badge}`}>
                      {t(`severity.${alert.severity}_short`, { defaultValue: alert.severity })}
                    </span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#006B4F] dark:text-emerald-400" />
                      {alert.village} ({alert.zone_id})
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-xs font-medium text-slate-800 dark:text-zinc-200 leading-relaxed">
                  {translateMessage(alert.message, t)}
                </p>

                <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500 dark:text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span>{t('alerts_list.dispatched_via')}:</span>
                    {alert.sent_via?.map((ch) => (
                      <span
                        key={ch}
                        className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-[#D9E2DE] dark:border-zinc-700 text-slate-700 dark:text-zinc-300 uppercase font-mono font-medium"
                      >
                        {ch}
                      </span>
                    ))}
                  </div>

                  <span className="uppercase font-mono font-semibold text-slate-500 dark:text-zinc-400">
                    {t('alerts_list.lang_label')}: {alert.language}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <AlertHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </div>
  );
}
