// Mock Data Engine strictly matching API_CONTRACT (1).md
// Focused on East Khasi Hills and Meghalaya / NER Pilot District

export const INITIAL_RISK_ZONES = [
  {
    zone_id: "MEG-EKH-014",
    village_name: "Sohra (Cherrapunji)",
    lat: 25.2840,
    lng: 91.7325,
    risk_score: 0.82,
    severity: "high",
    last_updated: "2026-09-08T06:00:00Z",
  },
  {
    zone_id: "MEG-EKH-002",
    village_name: "Mawsynram Slopes",
    lat: 25.2971,
    lng: 91.5822,
    risk_score: 0.89,
    severity: "critical",
    last_updated: "2026-09-08T06:00:00Z",
  },
  {
    zone_id: "MEG-EKH-007",
    village_name: "Pynursla Ridge",
    lat: 25.3090,
    lng: 91.8988,
    risk_score: 0.74,
    severity: "high",
    last_updated: "2026-09-08T06:00:00Z",
  },
  {
    zone_id: "MEG-EKH-019",
    village_name: "Mawlynnong Escarpment",
    lat: 25.2017,
    lng: 91.9160,
    risk_score: 0.48,
    severity: "medium",
    last_updated: "2026-09-08T06:00:00Z",
  },
  {
    zone_id: "MEG-EKH-023",
    village_name: "Dawki River Canyon",
    lat: 25.1834,
    lng: 92.0195,
    risk_score: 0.32,
    severity: "low",
    last_updated: "2026-09-08T06:00:00Z",
  },
  {
    zone_id: "MEG-EKH-031",
    village_name: "Shillong Peak Bypass",
    lat: 25.5342,
    lng: 91.8510,
    risk_score: 0.62,
    severity: "medium",
    last_updated: "2026-09-08T06:00:00Z",
  },
  {
    zone_id: "MEG-EKH-045",
    village_name: "Nongstoin Junction",
    lat: 25.5210,
    lng: 91.2670,
    risk_score: 0.25,
    severity: "low",
    last_updated: "2026-09-08T06:00:00Z",
  },
];

export const INITIAL_ROADS = [
  {
    road_id: "RD-2291",
    name: "Shillong–Sohra Road (NH-206)",
    status: "blocked",
    coordinates: [
      [25.52, 91.84],
      [25.45, 91.81],
      [25.38, 91.77],
      [25.30, 91.75],
      [25.28, 91.73],
    ],
    last_updated: "2026-09-08T09:15:00Z",
  },
  {
    road_id: "RD-2292",
    name: "Sohra–Shella Sector Link",
    status: "partial",
    coordinates: [
      [25.28, 91.73],
      [25.22, 91.70],
      [25.18, 91.68],
    ],
    last_updated: "2026-09-08T08:30:00Z",
  },
  {
    road_id: "RD-2293",
    name: "Pynursla–Dawki Highway (NH-40)",
    status: "blocked",
    coordinates: [
      [25.31, 91.90],
      [25.25, 91.95],
      [25.20, 91.99],
      [25.18, 92.02],
    ],
    last_updated: "2026-09-08T07:45:00Z",
  },
  {
    road_id: "RD-2294",
    name: "Shillong Bypass Corridor",
    status: "clear",
    coordinates: [
      [25.58, 91.87],
      [25.62, 91.92],
      [25.67, 91.98],
    ],
    last_updated: "2026-09-08T10:00:00Z",
  },
  {
    road_id: "RD-2295",
    name: "Mawsynram Valley Arterial",
    status: "partial",
    coordinates: [
      [25.40, 91.65],
      [25.35, 91.62],
      [25.29, 91.58],
    ],
    last_updated: "2026-09-08T06:10:00Z",
  },
];

export const INITIAL_VILLAGES = [
  {
    village_id: "V-441",
    name: "Sohra",
    lat: 25.2840,
    lng: 91.7325,
    population: 15000,
    zone_id: "MEG-EKH-014",
  },
  {
    village_id: "V-442",
    name: "Mawsynram",
    lat: 25.2971,
    lng: 91.5822,
    population: 8200,
    zone_id: "MEG-EKH-002",
  },
  {
    village_id: "V-443",
    name: "Pynursla",
    lat: 25.3090,
    lng: 91.8988,
    population: 11400,
    zone_id: "MEG-EKH-007",
  },
  {
    village_id: "V-444",
    name: "Mawlynnong",
    lat: 25.2017,
    lng: 91.9160,
    population: 4300,
    zone_id: "MEG-EKH-019",
  },
  {
    village_id: "V-445",
    name: "Dawki",
    lat: 25.1834,
    lng: 92.0195,
    population: 6800,
    zone_id: "MEG-EKH-023",
  },
  {
    village_id: "V-446",
    name: "Shillong South",
    lat: 25.5342,
    lng: 91.8510,
    population: 42000,
    zone_id: "MEG-EKH-031",
  },
];

export const INITIAL_FIELD_REPORTS = [
  {
    report_id: "FR-1042",
    lat: 25.2840,
    lng: 91.7325,
    description: "Large 15m tensile crack forming on hillside above NH-206 kilometer marker 42. Active water seepage observed.",
    photo_url: "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80",
    status: "verified",
    reporter_type: "official",
    timestamp: "2026-09-08T09:00:00Z",
  },
  {
    report_id: "FR-1043",
    lat: 25.2971,
    lng: 91.5822,
    description: "Boulder dislodged near Mawsynram market road. Retaining wall showing 10-degree outward tilt.",
    photo_url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
    status: "received",
    reporter_type: "citizen",
    timestamp: "2026-09-08T09:45:00Z",
  },
  {
    report_id: "FR-1044",
    lat: 25.3090,
    lng: 91.8988,
    description: "Culvert overflow causing severe gullying and toe erosion along Pynursla road cut.",
    photo_url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    status: "received",
    reporter_type: "citizen",
    timestamp: "2026-09-08T10:15:00Z",
  },
  {
    report_id: "FR-1041",
    lat: 25.5342,
    lng: 91.8510,
    description: "Minor gravel slide cleared by local community patrol. Safe for pedestrian transit.",
    photo_url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    status: "dismissed",
    reporter_type: "citizen",
    timestamp: "2026-09-08T07:15:00Z",
  },
];

export const INITIAL_ALERTS = [
  {
    alert_id: "AL-330",
    village: "Sohra",
    zone_id: "MEG-EKH-014",
    severity: "high",
    message: "Heavy rainfall detected (>65mm/24h). High risk of slope failure along NH-206. Avoid non-essential travel.",
    language: "en",
    sent_via: ["sms", "app"],
    timestamp: "2026-09-08T10:00:00Z",
  },
  {
    alert_id: "AL-331",
    village: "Mawsynram",
    zone_id: "MEG-EKH-002",
    severity: "critical",
    message: "IMMEDIATE EVACUATION NOTICE: Critical slope instability near Mawsynram west ridge. Move to relief shelter V-442.",
    language: "en",
    sent_via: ["sms", "app", "siren"],
    timestamp: "2026-09-08T10:30:00Z",
  },
  {
    alert_id: "AL-329",
    village: "Pynursla",
    zone_id: "MEG-EKH-007",
    severity: "medium",
    message: "Intermittent rockfall reported. Commuters on NH-40 advised to maintain caution and monitor road status.",
    language: "en",
    sent_via: ["app"],
    timestamp: "2026-09-08T08:15:00Z",
  },
];

export const INITIAL_ZONE_HISTORIES = {
  "MEG-EKH-014": [
    { date: "2026-09-01", risk_score: 0.41 },
    { date: "2026-09-02", risk_score: 0.45 },
    { date: "2026-09-03", risk_score: 0.52 },
    { date: "2026-09-04", risk_score: 0.61 },
    { date: "2026-09-05", risk_score: 0.69 },
    { date: "2026-09-06", risk_score: 0.74 },
    { date: "2026-09-07", risk_score: 0.79 },
    { date: "2026-09-08", risk_score: 0.82 },
  ],
  "MEG-EKH-002": [
    { date: "2026-09-01", risk_score: 0.55 },
    { date: "2026-09-02", risk_score: 0.62 },
    { date: "2026-09-03", risk_score: 0.70 },
    { date: "2026-09-04", risk_score: 0.75 },
    { date: "2026-09-05", risk_score: 0.81 },
    { date: "2026-09-06", risk_score: 0.85 },
    { date: "2026-09-07", risk_score: 0.87 },
    { date: "2026-09-08", risk_score: 0.89 },
  ],
};

export const INITIAL_WEATHER = {
  lat: 25.2840,
  lng: 91.7325,
  rainfall_24h: 65.2,
  rainfall_72h: 210.0,
  rainfall_7d: 380.5,
  rainfall_intensity_peak: 28.4,
  antecedent_rainfall_index: 145.7,
  forecast_next_24h: 40.0,
  source: "IMD (India Meteorological Department - Cherrapunji Station)",
};

export const INITIAL_SOIL_MOISTURE = [
  { sensor_id: "SM-014", zone_id: "MEG-EKH-014", moisture: 0.61, timestamp: "2026-09-08T06:00:00Z" },
  { sensor_id: "SM-002", zone_id: "MEG-EKH-002", moisture: 0.78, timestamp: "2026-09-08T06:00:00Z" },
  { sensor_id: "SM-007", zone_id: "MEG-EKH-007", moisture: 0.54, timestamp: "2026-09-08T06:00:00Z" },
  { sensor_id: "SM-019", zone_id: "MEG-EKH-019", moisture: 0.42, timestamp: "2026-09-08T06:00:00Z" },
  { sensor_id: "SM-023", zone_id: "MEG-EKH-023", moisture: 0.31, timestamp: "2026-09-08T06:00:00Z" },
];

export const INITIAL_DASHBOARD_SUMMARY = {
  total_zones_monitored: 46,
  high_risk_zones: 5,
  roads_blocked: 2,
  active_alerts: 3,
  reports_last_24h: 11,
  top_priority_zones: [
    { zone_id: "MEG-EKH-002", village_name: "Mawsynram Slopes", risk_score: 0.89 },
    { zone_id: "MEG-EKH-014", village_name: "Sohra (Cherrapunji)", risk_score: 0.82 },
    { zone_id: "MEG-EKH-007", village_name: "Pynursla Ridge", risk_score: 0.74 },
  ],
};
