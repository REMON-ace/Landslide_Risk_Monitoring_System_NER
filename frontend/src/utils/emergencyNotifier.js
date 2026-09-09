/**
 * Emergency Notification & Alert History Coordinator
 *
 * Coordinates Web/PWA notifications, device vibration, duplicate prevention,
 * and persistent emergency alert history tracking.
 *
 * Architecture designed for future integration with national public-alerting
 * architectures (e.g. Common Alerting Protocol CAP / Indian Emergency Alert / IPAWS).
 */

const HISTORY_KEY = 'ner_emergency_alert_history';
const PLAYED_SOUND_KEY = 'ner_played_sound_alerts';
const NOTIFIED_KEY = 'ner_dispatched_notifications';

class EmergencyNotifier {
  // ── Browser / PWA Notification Permission ──────────────────────────

  getNotificationPermission() {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  }

  async requestNotificationPermission() {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    try {
      const perm = await Notification.requestPermission();
      return perm;
    } catch (e) {
      return 'denied';
    }
  }

  // ── Vibration Support ──────────────────────────────────────────────

  triggerVibration() {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        // Civil emergency warning pattern: 300ms pulse, 100ms pause, 300ms pulse, 100ms pause, 600ms long pulse
        navigator.vibrate([300, 100, 300, 100, 600]);
        return true;
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  // ── Duplicate Alert Prevention ─────────────────────────────────────

  hasPlayedSound(alertId) {
    try {
      const stored = sessionStorage.getItem(PLAYED_SOUND_KEY);
      const ids = stored ? JSON.parse(stored) : [];
      return ids.includes(alertId);
    } catch {
      return false;
    }
  }

  markSoundPlayed(alertId) {
    try {
      const stored = sessionStorage.getItem(PLAYED_SOUND_KEY);
      const ids = stored ? JSON.parse(stored) : [];
      if (!ids.includes(alertId)) {
        ids.push(alertId);
        sessionStorage.setItem(PLAYED_SOUND_KEY, JSON.stringify(ids));
      }
    } catch (e) {}
  }

  hasNotified(alertId) {
    try {
      const stored = localStorage.getItem(NOTIFIED_KEY);
      const ids = stored ? JSON.parse(stored) : [];
      return ids.includes(alertId);
    } catch {
      return false;
    }
  }

  markNotified(alertId) {
    try {
      const stored = localStorage.getItem(NOTIFIED_KEY);
      const ids = stored ? JSON.parse(stored) : [];
      if (!ids.includes(alertId)) {
        ids.push(alertId);
        localStorage.setItem(NOTIFIED_KEY, JSON.stringify(ids));
      }
    } catch (e) {}
  }

  // ── Dispatch Notification ──────────────────────────────────────────

  async dispatchEmergencyNotification(alert) {
    if (!alert || !alert.alert_id) return false;
    if (this.hasNotified(alert.alert_id)) return false;

    // Trigger vibration where device supports it
    this.triggerVibration();

    // Browser / PWA Notification
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      const isCritical = alert.severity === 'critical';
      const title = isCritical
        ? `🚨 CRITICAL LANDSLIDE EMERGENCY: ${alert.village || alert.zone_id}`
        : `⚠️ HIGH RISK LANDSLIDE WARNING: ${alert.village || alert.zone_id}`;

      const options = {
        body: `${alert.message}\nRecommended Action: ${alert.recommended_action || 'Evacuate vulnerable slope corridors immediately.'}`,
        icon: '/logo.svg',
        badge: '/logo.svg',
        tag: `ner-alert-${alert.alert_id}`,
        requireInteraction: true,
        vibrate: [300, 100, 300, 100, 600],
        data: { alert_id: alert.alert_id, timestamp: new Date().toISOString() },
      };

      try {
        // Prefer service worker notification if PWA is active
        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.getRegistration();
          if (reg && reg.showNotification) {
            await reg.showNotification(title, options);
            this.markNotified(alert.alert_id);
            return true;
          }
        }
        // Fallback to standard window Notification
        new Notification(title, options);
        this.markNotified(alert.alert_id);
        return true;
      } catch (err) {
        console.warn('Notification dispatch error:', err);
      }
    }
    return false;
  }

  // ── Alert History Persistence ──────────────────────────────────────

  getAlertHistory() {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  saveAlertHistory(history) {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (e) {}
  }

  recordAlertGenerated(alert) {
    if (!alert || !alert.alert_id) return;
    const history = this.getAlertHistory();
    const existing = history.find((h) => h.alert_id === alert.alert_id);

    if (!existing) {
      const newRecord = {
        alert_id: alert.alert_id,
        event: 'Landslide Slope Hazard Warning',
        severity: alert.severity || 'high',
        location: alert.village || alert.zone_id || 'East Khasi Hills',
        zone_id: alert.zone_id || '',
        message: alert.message || '',
        recommended_action:
          alert.recommended_action ||
          (alert.severity === 'critical'
            ? 'Immediate evacuation to designated relief shelters. Suspend all hillside travel.'
            : 'Maintain high vigilance along highway cuts. Avoid low-lying river crossings.'),
        generated_at: alert.timestamp || new Date().toISOString(),
        acknowledged_at: null,
        cleared_at: null,
        status: 'active',
      };
      history.unshift(newRecord);
      this.saveAlertHistory(history);
    }
  }

  recordAlertAcknowledged(alertId) {
    const history = this.getAlertHistory();
    const item = history.find((h) => h.alert_id === alertId);
    if (item && !item.acknowledged_at) {
      item.acknowledged_at = new Date().toISOString();
      item.status = 'acknowledged';
      this.saveAlertHistory(history);
    }
  }

  recordAlertCleared(alertId) {
    const history = this.getAlertHistory();
    const item = history.find((h) => h.alert_id === alertId);
    if (item && !item.cleared_at) {
      item.cleared_at = new Date().toISOString();
      item.status = 'cleared';
      this.saveAlertHistory(history);
    }
  }

  clearAlertHistory() {
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch (e) {}
  }
}

export const emergencyNotifier = new EmergencyNotifier();
