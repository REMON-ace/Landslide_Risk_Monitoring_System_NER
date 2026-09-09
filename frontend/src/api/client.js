// API Client Module — strictly adheres to API_CONTRACT (1).md
import {
  INITIAL_RISK_ZONES,
  INITIAL_ROADS,
  INITIAL_VILLAGES,
  INITIAL_FIELD_REPORTS,
  INITIAL_ALERTS,
  INITIAL_ZONE_HISTORIES,
  INITIAL_WEATHER,
  INITIAL_SOIL_MOISTURE,
  INITIAL_DASHBOARD_SUMMARY,
} from '../mocks/mockData';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

// Helper for local mock state persistence so official edits & citizen submissions remain interactive
const getStoredState = (key, fallback) => {
  try {
    const saved = localStorage.getItem(`ner_mock_${key}`);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

const setStoredState = (key, data) => {
  try {
    localStorage.setItem(`ner_mock_${key}`, JSON.stringify(data));
  } catch (e) {
    console.warn('Storage quota exceeded or unavailable', e);
  }
};

// Generic fetch wrapper with Bearer token injection
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('auth_token');
  const headers = {
    ...options.headers,
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If payload is not FormData, ensure Content-Type is JSON
  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const url = `${BASE_URL.replace(/\/$/, '')}${endpoint}`;
  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const error = new Error(errorBody.detail || errorBody.message || `API Error: ${response.status} ${response.statusText}`);
    error.status = response.status;
    error.data = errorBody;
    throw error;
  }

  return response.status === 204 ? null : response.json();
}

/* =========================================================================
   1. RISK & PREDICTION
   ========================================================================= */

/**
 * GET /risk-zones
 * Query params: district, min_severity
 */
export async function getRiskZones(params = {}) {
  if (USE_MOCKS) {
    let zones = getStoredState('risk_zones', INITIAL_RISK_ZONES);
    if (params.min_severity) {
      const severityWeights = { low: 1, medium: 2, high: 3, critical: 4 };
      const minWeight = severityWeights[params.min_severity] || 0;
      zones = zones.filter((z) => (severityWeights[z.severity] || 0) >= minWeight);
    }
    return zones;
  }

  const query = new URLSearchParams(params).toString();
  return request(`/risk-zones${query ? `?${query}` : ''}`);
}

/**
 * POST /predict-risk
 * Request: 12 model features
 */
export async function predictRisk(features) {
  if (USE_MOCKS) {
    // Realistic heuristic simulation based on rainfall, slope and antecedent index
    const rainfall = (features.rainfall_24h || 0) * 0.3 + (features.rainfall_72h || 0) * 0.2;
    const slope = (features.slope || 20) * 0.8;
    const moisture = (features.soil_moisture || 0.4) * 40;
    const rawScore = Math.min(0.98, Math.max(0.12, (rainfall + slope + moisture) / 120));
    const risk_score = Number(rawScore.toFixed(2));

    let severity = 'low';
    if (risk_score >= 0.85) severity = 'critical';
    else if (risk_score >= 0.70) severity = 'high';
    else if (risk_score >= 0.45) severity = 'medium';

    return { risk_score, severity };
  }

  return request('/predict-risk', {
    method: 'POST',
    body: JSON.stringify(features),
  });
}

/**
 * GET /risk-zones/{zone_id}/history
 */
export async function getRiskZoneHistory(zone_id) {
  if (USE_MOCKS) {
    const historyMap = getStoredState('zone_histories', INITIAL_ZONE_HISTORIES);
    const history = historyMap[zone_id] || [
      { date: "2026-09-01", risk_score: 0.35 },
      { date: "2026-09-02", risk_score: 0.39 },
      { date: "2026-09-03", risk_score: 0.44 },
      { date: "2026-09-04", risk_score: 0.51 },
      { date: "2026-09-05", risk_score: 0.58 },
      { date: "2026-09-06", risk_score: 0.65 },
      { date: "2026-09-07", risk_score: 0.72 },
      { date: "2026-09-08", risk_score: 0.79 },
    ];
    return { zone_id, history };
  }

  return request(`/risk-zones/${encodeURIComponent(zone_id)}/history`);
}

/* =========================================================================
   2. WEATHER & SENSOR DATA
   ========================================================================= */

/**
 * GET /weather/current
 * Query params: lat, lng (required)
 */
export async function getCurrentWeather(lat, lng) {
  if (USE_MOCKS) {
    return {
      ...INITIAL_WEATHER,
      lat: lat || INITIAL_WEATHER.lat,
      lng: lng || INITIAL_WEATHER.lng,
    };
  }

  const query = new URLSearchParams({ lat, lng }).toString();
  return request(`/weather/current?${query}`);
}

/**
 * GET /sensors/soil-moisture
 * Query params: zone_id (optional)
 */
export async function getSoilMoisture(zone_id) {
  if (USE_MOCKS) {
    const sensors = INITIAL_SOIL_MOISTURE;
    if (zone_id) {
      return sensors.filter((s) => s.zone_id === zone_id);
    }
    return sensors;
  }

  const query = zone_id ? `?zone_id=${encodeURIComponent(zone_id)}` : '';
  return request(`/sensors/soil-moisture${query}`);
}

/* =========================================================================
   3. GIS / INFRASTRUCTURE
   ========================================================================= */

/**
 * GET /roads
 * Query params: district, status
 */
export async function getRoads(params = {}) {
  if (USE_MOCKS) {
    let roads = getStoredState('roads', INITIAL_ROADS);
    if (params.status) {
      roads = roads.filter((r) => r.status === params.status);
    }
    return roads;
  }

  const query = new URLSearchParams(params).toString();
  return request(`/roads${query ? `?${query}` : ''}`);
}

/**
 * PATCH /roads/{road_id}
 * Request: { status: "clear" | "partial" | "blocked" }
 * Protected endpoint (Authorization header sent automatically)
 */
export async function updateRoadStatus(road_id, status) {
  if (USE_MOCKS) {
    const roads = getStoredState('roads', INITIAL_ROADS);
    const updated = roads.map((r) =>
      r.road_id === road_id
        ? { ...r, status, last_updated: new Date().toISOString() }
        : r
    );
    setStoredState('roads', updated);
    return updated.find((r) => r.road_id === road_id) || { road_id, status };
  }

  return request(`/roads/${encodeURIComponent(road_id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

/**
 * GET /villages
 */
export async function getVillages() {
  if (USE_MOCKS) {
    return getStoredState('villages', INITIAL_VILLAGES);
  }

  return request('/villages');
}

/* =========================================================================
   4. FIELD REPORTING
   ========================================================================= */

/**
 * POST /field-reports
 * Request: multipart/form-data or Object
 */
export async function submitFieldReport(reportData) {
  if (USE_MOCKS) {
    const reports = getStoredState('field_reports', INITIAL_FIELD_REPORTS);
    const newId = `FR-${1045 + Math.floor(Math.random() * 900)}`;

    let description = '';
    let lat = 25.284;
    let lng = 91.7325;
    let reporter_type = 'citizen';
    let photo_url = 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80';

    if (reportData instanceof FormData) {
      description = reportData.get('description') || '';
      lat = parseFloat(reportData.get('lat')) || 25.284;
      lng = parseFloat(reportData.get('lng')) || 91.7325;
      reporter_type = reportData.get('reporter_type') || 'citizen';
      const photo = reportData.get('photo');
      if (photo && typeof photo === 'object' && photo.size > 0) {
        photo_url = URL.createObjectURL(photo);
      }
    } else {
      description = reportData.description || '';
      lat = parseFloat(reportData.lat) || 25.284;
      lng = parseFloat(reportData.lng) || 91.7325;
      reporter_type = reportData.reporter_type || 'citizen';
      if (reportData.photo_preview) {
        photo_url = reportData.photo_preview;
      }
    }

    const newReport = {
      report_id: newId,
      lat,
      lng,
      description,
      photo_url,
      status: 'received',
      reporter_type,
      timestamp: new Date().toISOString(),
    };

    reports.unshift(newReport);
    setStoredState('field_reports', reports);

    // Also push a matching alert item into alerts mock state
    const alerts = getStoredState('alerts', INITIAL_ALERTS);
    const mockSev = reportData instanceof FormData ? (reportData.get('severity') || 'medium') : (reportData.severity || 'medium');
    const newAlert = {
      alert_id: `AL-${newId.replace('FR-', '')}`,
      village: 'Sohra',
      district: 'East Khasi Hills',
      zone_id: 'RZ-SHILLONG-001',
      severity: mockSev,
      message: description || 'Hazard incident report submitted by field responder.',
      details: description,
      photo_url,
      sent_via: ['field_report', 'app'],
      channels: ['field_report', 'app'],
      timestamp: new Date().toISOString(),
      sent_at: new Date().toISOString(),
      lat,
      lng,
    };
    alerts.unshift(newAlert);
    setStoredState('alerts', alerts);

    return {
      report_id: newId,
      status: 'received',
      photo_url,
    };
  }

  let body = reportData;
  let headers = {};
  if (!(reportData instanceof FormData)) {
    body = JSON.stringify(reportData);
    headers['Content-Type'] = 'application/json';
  }

  return request('/field-reports', {
    method: 'POST',
    headers,
    body,
  });
}

/**
 * GET /field-reports
 * Query params: status, zone_id, since
 */
export async function getFieldReports(params = {}) {
  if (USE_MOCKS) {
    let reports = getStoredState('field_reports', INITIAL_FIELD_REPORTS);
    // By default, hide archived (soft-deleted) reports from the review queue
    if (!params.include_archived) {
      reports = reports.filter((r) => r.status !== 'archived');
    }
    if (params.status) {
      reports = reports.filter((r) => r.status === params.status);
    }
    return reports;
  }

  const query = new URLSearchParams(params).toString();
  return request(`/field-reports${query ? `?${query}` : ''}`);
}

/**
 * PATCH /field-reports/{report_id}
 * Request: { status?: "received" | "verified" | "dismissed", severity?: "low" | "medium" | "high" | "critical" }
 * Protected endpoint
 */
export async function updateFieldReportStatus(report_id, status = null, severity = null) {
  if (USE_MOCKS) {
    const reports = getStoredState('field_reports', INITIAL_FIELD_REPORTS);
    const updated = reports.map((r) =>
      r.report_id === report_id
        ? {
            ...r,
            ...(status ? { status } : {}),
            ...(severity ? { severity } : {}),
          }
        : r
    );
    setStoredState('field_reports', updated);
    return updated.find((r) => r.report_id === report_id);
  }

  const payload = {};
  if (status) payload.status = status;
  if (severity) payload.severity = severity;

  return request(`/field-reports/${encodeURIComponent(report_id)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

/**
 * DELETE /field-reports/{report_id}
 */
export async function deleteFieldReport(report_id) {
  if (USE_MOCKS) {
    // Soft delete: set status to 'archived' instead of removing from storage
    const reports = getStoredState('field_reports', INITIAL_FIELD_REPORTS);
    const updatedReports = reports.map((r) =>
      r.report_id === report_id ? { ...r, status: 'archived' } : r
    );
    setStoredState('field_reports', updatedReports);
    return { success: true, status: 'archived' };
  }

  return request(`/field-reports/${encodeURIComponent(report_id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'archived' }),
  });
}

/* =========================================================================
   5. ALERTS & NOTIFICATIONS
   ========================================================================= */

/**
 * GET /alerts
 * Query params: village_id, severity
 */
export async function getAlerts(params = {}) {
  if (USE_MOCKS) {
    let alerts = getStoredState('alerts', INITIAL_ALERTS);
    if (params.village_id) {
      alerts = alerts.filter((a) => a.village === params.village_id || a.zone_id === params.village_id);
    }
    if (params.severity) {
      alerts = alerts.filter((a) => a.severity === params.severity);
    }
    return alerts;
  }

  const query = new URLSearchParams(params).toString();
  return request(`/alerts${query ? `?${query}` : ''}`);
}

/**
 * POST /alerts
 * Request: { zone_id, severity, message_key, languages, channels }
 * Protected endpoint
 */
export async function createAlert(payload) {
  if (USE_MOCKS) {
    const alerts = getStoredState('alerts', INITIAL_ALERTS);
    const alert_id = `AL-${340 + Math.floor(Math.random() * 500)}`;

    const newAlert = {
      alert_id,
      village: payload.village || 'Sohra',
      zone_id: payload.zone_id,
      severity: payload.severity,
      message: payload.custom_message || `Landslide hazard warning issued for zone ${payload.zone_id}. Take precautionary measures immediately.`,
      language: payload.languages?.[0] || 'en',
      sent_via: payload.channels || ['sms', 'app'],
      timestamp: new Date().toISOString(),
    };

    alerts.unshift(newAlert);
    setStoredState('alerts', alerts);

    return {
      alert_id,
      status: 'sent',
      recipients_count: 842 + Math.floor(Math.random() * 200),
    };
  }

  return request('/alerts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/* =========================================================================
   6. DASHBOARD AGGREGATES
   ========================================================================= */

/**
 * GET /dashboard/summary
 * Query params: district
 */
export async function getDashboardSummary(params = {}) {
  if (USE_MOCKS) {
    const roads = getStoredState('roads', INITIAL_ROADS);
    const alerts = getStoredState('alerts', INITIAL_ALERTS);
    const reports = getStoredState('field_reports', INITIAL_FIELD_REPORTS);
    const zones = getStoredState('risk_zones', INITIAL_RISK_ZONES);

    const high_risk_zones = zones.filter((z) => z.severity === 'high' || z.severity === 'critical').length;
    const roads_blocked = roads.filter((r) => r.status === 'blocked').length;

    return {
      total_zones_monitored: zones.length > 0 ? zones.length : INITIAL_DASHBOARD_SUMMARY.total_zones_monitored,
      high_risk_zones,
      roads_blocked,
      active_alerts: alerts.length,
      reports_last_24h: reports.length,
      top_priority_zones: zones
        .slice()
        .sort((a, b) => b.risk_score - a.risk_score)
        .slice(0, 3)
        .map((z) => ({
          zone_id: z.zone_id,
          village_name: z.village_name,
          risk_score: z.risk_score,
        })),
    };
  }

  const query = new URLSearchParams(params).toString();
  return request(`/dashboard/summary${query ? `?${query}` : ''}`);
}

/* =========================================================================
   7. OFFLINE SYNC (FIELD APP)
   ========================================================================= */

/**
 * POST /sync/field-reports
 * Request: { reports: [ { client_report_id, lat, lng, description, timestamp } ] }
 */
export async function syncFieldReports(reportsList) {
  if (USE_MOCKS) {
    const existingReports = getStoredState('field_reports', INITIAL_FIELD_REPORTS);
    const syncedIds = [];

    reportsList.forEach((item) => {
      syncedIds.push(item.client_report_id);
      existingReports.unshift({
        report_id: `FR-${Math.floor(1100 + Math.random() * 8000)}`,
        lat: item.lat,
        lng: item.lng,
        description: item.description,
        photo_url: item.photo_preview || 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80',
        status: 'received',
        reporter_type: item.reporter_type || 'citizen',
        timestamp: item.timestamp || new Date().toISOString(),
      });
    });

    setStoredState('field_reports', existingReports);

    return {
      synced: syncedIds,
      failed: [],
    };
  }

  return request('/sync/field-reports', {
    method: 'POST',
    body: JSON.stringify({ reports: reportsList }),
  });
}

/* =========================================================================
   8. AUTH
   ========================================================================= */

/**
 * POST /auth/login
 * Request: { username, password }
 */
export async function login(username, password) {
  if (USE_MOCKS) {
    const isAdmin = username === 'admin_shillong' || username === 'official_shillong' || username === 'admin';
    const mockAuth = {
      token: `mock-jwt-token-ner-${Date.now()}`,
      role: isAdmin ? 'district_admin' : 'citizen',
      district: 'East Khasi Hills',
      username,
    };
    localStorage.setItem('auth_token', mockAuth.token);
    localStorage.setItem('user_profile', JSON.stringify(mockAuth));
    return mockAuth;
  }

  const result = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

  if (result.token) {
    localStorage.setItem('auth_token', result.token);
    localStorage.setItem('user_profile', JSON.stringify(result));
  }

  return result;
}

export async function register(formData) {
  if (USE_MOCKS) {
    try {
      const result = await request('/auth/register', {
        method: 'POST',
        body: formData,
      });
      return result;
    } catch (e) {
      const username = formData.get('username') || 'new_resident';
      const district = formData.get('district') || 'East Khasi Hills';
      const fileObj = formData.get('proof');
      let proofDataUrl = null;
      if (fileObj && fileObj instanceof File && fileObj.type.startsWith('image/')) {
        try {
          proofDataUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(fileObj);
          });
        } catch (e) {}
      }

      const newUser = {
        id: Date.now(),
        username,
        district,
        proof_path: `/uploads/residency_proofs/${filename}`,
        proof_type: fileObj ? `${fileObj.name} (${fileObj.type || 'Document'})` : 'Residency Proof Document',
        proof_data_url: proofDataUrl,
        is_verified: false,
        created_at: new Date().toISOString(),
      };
      pending.unshift(newUser);
      setStoredState('pending_users', pending);
      return { user_id: newUser.id, is_verified: false };
    }
  }

  return request('/auth/register', {
    method: 'POST',
    body: formData,
  });
}

export async function getPendingUsers() {
  if (USE_MOCKS) {
    try {
      const data = await request('/auth/pending-users');
      if (Array.isArray(data)) return data;
    } catch (e) {}
    return getStoredState('pending_users', []);
  }
  return request('/auth/pending-users');
}

export async function verifyUser(userId) {
  if (USE_MOCKS) {
    try {
      return await request(`/auth/verify-user/${userId}`, { method: 'POST' });
    } catch (e) {}
    const pending = getStoredState('pending_users', []);
    const updated = pending.filter((u) => u.id !== userId);
    setStoredState('pending_users', updated);
    return { status: 'success' };
  }
  return request(`/auth/verify-user/${userId}`, {
    method: 'POST',
  });
}

export function logout() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_profile');
}

