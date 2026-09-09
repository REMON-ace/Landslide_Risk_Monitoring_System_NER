import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { emergencyNotifier } from '../utils/emergencyNotifier';
import {
  History,
  X,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Trash2,
  ShieldAlert,
  ArrowDownCircle,
  FileCheck,
} from 'lucide-react';

export default function AlertHistoryModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const [history, setHistory] = useState([]);

  const loadHistory = () => {
    setHistory(emergencyNotifier.getAlertHistory());
  };

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const handleClearHistory = () => {
    if (window.confirm('Clear all stored emergency alert history records?')) {
      emergencyNotifier.clearAlertHistory();
      setHistory([]);
    }
  };

  const handleMarkCleared = (alertId) => {
    emergencyNotifier.recordAlertCleared(alertId);
    loadHistory();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-950 border border-[#D9E2DE] dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#D9E2DE] dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-[#1F2937] dark:text-white flex items-center gap-2">
                <span>{t('emergency_alerts.history_title', { defaultValue: 'Emergency Warning Log & History' })}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                  {history.length} Event(s)
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {t('emergency_alerts.history_subtitle', { defaultValue: 'Audit trail of generated, acknowledged, and cleared landslide emergency alerts' })}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: History Table / List */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {history.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-zinc-600 space-y-2">
              <FileCheck className="w-10 h-10 mx-auto opacity-40 text-[#006B4F]" />
              <p className="text-sm font-semibold text-slate-600 dark:text-zinc-400">
                {t('emergency_alerts.no_history', { defaultValue: 'No Emergency Warnings Recorded Yet' })}
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                When a HIGH or CRITICAL landslide event is detected by the telemetry engine, its generation, acknowledgment, and clearance times will be logged here.
              </p>
            </div>
          ) : (
            history.map((record) => {
              const isCritical = record.severity === 'critical';
              return (
                <div
                  key={record.alert_id}
                  className={`p-4 rounded-xl border transition-all ${
                    record.status === 'active'
                      ? isCritical
                        ? 'bg-red-50/70 dark:bg-red-950/20 border-red-300 dark:border-red-900/60 shadow-sm'
                        : 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900/60 shadow-sm'
                      : 'bg-white dark:bg-zinc-900/50 border-[#D9E2DE] dark:border-zinc-800 opacity-90'
                  }`}
                >
                  {/* Top line of record */}
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide ${
                          isCritical
                            ? 'bg-red-600 text-white'
                            : 'bg-amber-600 text-white'
                        }`}
                      >
                        {record.severity}
                      </span>
                      <span className="font-bold text-xs text-[#1F2937] dark:text-white flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{record.location}</span>
                        {record.zone_id && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            ({record.zone_id})
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          record.status === 'cleared'
                            ? 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                            : record.status === 'acknowledged'
                            ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                            : 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800 animate-pulse'
                        }`}
                      >
                        {record.status.toUpperCase()}
                      </span>

                      {record.status !== 'cleared' && (
                        <button
                          type="button"
                          onClick={() => handleMarkCleared(record.alert_id)}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 transition-colors"
                          title="Mark alert condition as cleared/resolved"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Message & Action */}
                  <p className="text-xs text-slate-700 dark:text-zinc-200 font-medium mb-2 leading-relaxed">
                    {record.message}
                  </p>
                  {record.recommended_action && (
                    <div className="text-[11px] text-slate-600 dark:text-zinc-400 bg-slate-100/60 dark:bg-zinc-900 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 mb-2.5">
                      <strong className="text-slate-800 dark:text-zinc-200">Action: </strong>
                      <span>{record.recommended_action}</span>
                    </div>
                  )}

                  {/* Audit Timestamps row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800/80 text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-red-500" />
                      <span>Gen: {new Date(record.generated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      <span>Ack: {record.acknowledged_at ? new Date(record.acknowledged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Pending'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ArrowDownCircle className="w-3 h-3 text-sky-500" />
                      <span>Clr: {record.cleared_at ? new Date(record.cleared_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Active'}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#D9E2DE] dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-900/60">
          {history.length > 0 ? (
            <button
              type="button"
              onClick={handleClearHistory}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#E63946] hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t('emergency_alerts.clear_log', { defaultValue: 'Clear History Log' })}</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-[#D9E2DE] dark:border-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 transition-colors shadow-sm"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
