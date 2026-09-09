import { openDB } from 'idb';

const DB_NAME = 'ner_landslide_offline_db';
const DB_VERSION = 1;
const PENDING_STORE = 'pending_reports';
const CACHE_STORE = 'offline_cache';

let dbPromise = null;

export async function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(PENDING_STORE)) {
          const store = db.createObjectStore(PENDING_STORE, { keyPath: 'client_report_id' });
          store.createIndex('timestamp', 'timestamp');
        }
        if (!db.objectStoreNames.contains(CACHE_STORE)) {
          db.createObjectStore(CACHE_STORE, { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
}

/**
 * Save a report queued while offline into IndexedDB
 */
export async function savePendingReport(report) {
  try {
    const db = await getDb();
    await db.put(PENDING_STORE, report);
    return report;
  } catch (error) {
    console.error('Error saving pending report to IndexedDB:', error);
    // Fallback to localStorage if IndexedDB is blocked
    const existing = JSON.parse(localStorage.getItem('fallback_pending_reports') || '[]');
    existing.push(report);
    localStorage.setItem('fallback_pending_reports', JSON.stringify(existing));
    return report;
  }
}

/**
 * Retrieve all pending field reports awaiting network sync
 */
export async function getPendingReports() {
  try {
    const db = await getDb();
    const reports = await db.getAll(PENDING_STORE);
    return reports || [];
  } catch (error) {
    console.error('Error fetching pending reports from IndexedDB:', error);
    return JSON.parse(localStorage.getItem('fallback_pending_reports') || '[]');
  }
}

/**
 * Delete a specific report from IndexedDB by client_report_id
 */
export async function deletePendingReport(client_report_id) {
  try {
    const db = await getDb();
    await db.delete(PENDING_STORE, client_report_id);
  } catch (error) {
    console.error('Error deleting pending report from IndexedDB:', error);
    const existing = JSON.parse(localStorage.getItem('fallback_pending_reports') || '[]');
    const filtered = existing.filter((r) => r.client_report_id !== client_report_id);
    localStorage.setItem('fallback_pending_reports', JSON.stringify(filtered));
  }
}

/**
 * Clear synced reports from IndexedDB batch
 */
export async function clearSyncedReports(client_report_ids = []) {
  try {
    const db = await getDb();
    const tx = db.transaction(PENDING_STORE, 'readwrite');
    for (const id of client_report_ids) {
      await tx.store.delete(id);
    }
    await tx.done;
  } catch (error) {
    console.error('Error clearing synced reports:', error);
    const existing = JSON.parse(localStorage.getItem('fallback_pending_reports') || '[]');
    const filtered = existing.filter((r) => !client_report_ids.includes(r.client_report_id));
    localStorage.setItem('fallback_pending_reports', JSON.stringify(filtered));
  }
}

/**
 * Cache arbitrary JSON data for offline availability
 */
export async function cacheData(key, data) {
  try {
    const db = await getDb();
    await db.put(CACHE_STORE, { key, data, cached_at: Date.now() });
  } catch (err) {
    console.warn('Unable to cache data in IndexedDB:', err);
  }
}

/**
 * Get cached JSON data
 */
export async function getCachedData(key) {
  try {
    const db = await getDb();
    const result = await db.get(CACHE_STORE, key);
    return result ? result.data : null;
  } catch {
    return null;
  }
}
