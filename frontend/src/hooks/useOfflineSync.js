import { useState, useEffect, useCallback } from 'react';
import { getPendingReports, clearSyncedReports } from '../db/indexedDb';
import { syncFieldReports } from '../api/client';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState(null);

  const refreshPendingCount = useCallback(async () => {
    try {
      const reports = await getPendingReports();
      setPendingCount(reports.length);
    } catch {
      setPendingCount(0);
    }
  }, []);

  const triggerSync = useCallback(async () => {
    if (!navigator.onLine || isSyncing) return;

    try {
      setIsSyncing(true);
      const pending = await getPendingReports();
      if (pending.length === 0) {
        setIsSyncing(false);
        return;
      }

      // Format reports for sync endpoint matching API contract
      const payload = pending.map((r) => ({
        client_report_id: r.client_report_id,
        lat: r.lat,
        lng: r.lng,
        description: r.description,
        photo_preview: r.photo_preview,
        reporter_type: r.reporter_type,
        timestamp: r.timestamp,
      }));

      const res = await syncFieldReports(payload);

      if (res && res.synced && res.synced.length > 0) {
        await clearSyncedReports(res.synced);
        await refreshPendingCount();
        setLastSyncResult({
          time: new Date().toLocaleTimeString(),
          syncedCount: res.synced.length,
          status: 'success',
        });
      }
    } catch (err) {
      console.error('Offline sync failed:', err);
      setLastSyncResult({
        time: new Date().toLocaleTimeString(),
        status: 'error',
        error: err.message,
      });
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, refreshPendingCount]);

  useEffect(() => {
    refreshPendingCount();

    const handleOnline = () => {
      setIsOnline(true);
      triggerSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Register ServiceWorker background sync if supported
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready
        .then((registration) => {
          return registration.sync.register('sync-field-reports');
        })
        .catch((err) => {
          // Background sync not allowed or rejected, browser event fallback remains active
          console.debug('Background Sync registration skipped:', err);
        });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [triggerSync, refreshPendingCount]);

  return {
    isOnline,
    pendingCount,
    isSyncing,
    lastSyncResult,
    triggerSync,
    refreshPendingCount,
  };
}
