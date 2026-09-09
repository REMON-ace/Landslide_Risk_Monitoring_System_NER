import React from 'react';
import { useTranslation } from 'react-i18next';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { WifiOff, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export default function OfflineNotice() {
  const { t } = useTranslation();
  const { isOnline, pendingCount, isSyncing, triggerSync, lastSyncResult } = useOfflineSync();

  if (isOnline && pendingCount === 0 && !lastSyncResult) {
    return null;
  }

  return (
    <div className="w-full">
      {!isOnline && (
        <div className="bg-red-50 dark:bg-red-950/40 border-b border-red-200 px-4 py-2 text-xs text-[#E63946]">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-[#E63946] shrink-0" />
              <span>
                <strong>{t('offline_notice.offline_title')}:</strong> {t('offline_notice.offline_desc')}
              </span>
            </div>
            {pendingCount > 0 && (
              <span className="shrink-0 px-2 py-0.5 rounded bg-[#E63946] text-white font-mono text-[11px] font-bold">
                {pendingCount} {t('offline_notice.queued_label')}
              </span>
            )}
          </div>
        </div>
      )}

      {isOnline && pendingCount > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-300 px-4 py-2 text-xs text-amber-800 dark:text-amber-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span
                dangerouslySetInnerHTML={{
                  __html: t('offline_notice.online_desc', { count: `<strong>${pendingCount}</strong>` }),
                }}
              />
            </div>
            <button
              onClick={triggerSync}
              disabled={isSyncing}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#006B4F] hover:bg-[#00523c] text-white font-medium text-xs shadow-sm transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? t('offline_notice.syncing') : t('offline_notice.sync_now')}
            </button>
          </div>
        </div>
      )}

      {lastSyncResult && lastSyncResult.status === 'success' && pendingCount === 0 && (
        <div className="bg-[#EAF5F0] dark:bg-emerald-950/40 border-b border-[#006B4F]/20 px-4 py-2 text-xs text-[#006B4F] dark:text-emerald-300">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#008060] shrink-0" />
            <span>{t('offline_notice.synced_msg', { time: lastSyncResult.time })}</span>
          </div>
        </div>
      )}
    </div>
  );
}
