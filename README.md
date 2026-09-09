# NER Landslide Early Warning & Community Monitoring Platform (PWA)

An AI-based landslide early warning and community monitoring platform engineered for pilot districts in the North Eastern Region (NER) of India (East Khasi Hills, Meghalaya). 

Built as a single responsive **Progressive Web App (PWA)** usable by district authorities (GIS & dashboard heavy) and citizens/field officials (offline-resilient hazard reporting).

---

## 🚀 Key Features

1. **Light & Pure-Black Dark Theme**:
   - Class-based theme system supporting both clean light mode and **true-black dark mode** (`#000000`, `#0a0a0a`, `#121212`) with **strictly zero blue/navy/indigo cast**, as specified.
   - Dark theme uses high-contrast neutral zinc borders and glowing status accents (emerald, amber, orange, red).

2. **Strict API Contract Conformance**:
   - 100% compliant with `API_CONTRACT (1).md` across all 14 endpoints and payload shapes.
   - Unified `src/api/client.js` module wrapping each endpoint with clean named functions.
   - Environment variable toggle `VITE_USE_MOCKS` enables switching between rich realistic mock data and the live backend server.

3. **District Authority GIS Dashboard**:
   - Interactive GIS map powered by Leaflet & CartoDB Dark Matter / OSM tiles.
   - Live spatial risk heatmap color-coded by severity (Critical `#ef4444`, High `#ea580c`, Medium `#eab308`, Low `#10b981`).
   - Real-time road connectivity overlay with authority status override (`clear`, `partial`, `blocked`).
   - Village markers with population and sector metadata.
   - Click-to-inspect detail drawer with **Recharts 7-day risk trend trajectory**, IMD weather precipitation telemetry (24h, 72h, 7d, ARI index), and soil moisture sensor logs.
   - Incoming field reports stream with official **Verify** and **Dismiss** triage actions (`PATCH /field-reports/{id}`).
   - Manual emergency alert broadcast modal dispatching via SMS gateway, App sirens, and DEOC networks.

4. **Offline-Resilient Field Reporting (PWA)**:
   - Mobile-first report submission with auto-GPS coordinates detection (`navigator.geolocation`).
   - Photo capture with instant preview and camera support.
   - Pre-configured landslide hazard observation tags (cracks, debris flow, boulder blockages, culvert siltation).
   - **IndexedDB Queueing**: When offline or in low-network mountainous terrain, submissions are safely stored in IndexedDB (`pending_reports`) with client UUIDs.
   - **Automatic Synchronization**: Background Sync API & `online` event listener automatically flush queued batches via `POST /sync/field-reports` when network connectivity returns.
   - "My Reports" tab tracking local device submission history and pending queue states.

5. **Public Community Bulletins**:
   - Fast, accessible emergency public alerts view requiring no login.
   - Filtering by Village and Alert Severity.
   - Local emergency disaster helpline directory (DEOC 1077, SDRF Meghalaya, State Police).
   - Landslide safety directives and evacuation guidelines.
   - Cached offline availability for emergency access even when disconnected.

6. **Interactive AI Risk Predictor Sandbox**:
   - Interactive ML test bench running `POST /predict-risk`.
   - Sliders for all 12 geological, topographical, and rainfall features (slope, aspect, elevation, 24h/72h/7d rain, ARI, soil moisture, curvature, drainage distance).
   - Instant visual gauge calculation and risk classification.

7. **Multilingual Support (i18n)**:
   - Powered by `react-i18next` with language persistence.
   - Supports **English**, **Khasi (Ka Ktien Khasi - Meghalaya)**, and **Assamese (অসমীয়া)**.

---

## 🛠️ Tech Stack

- **Framework**: React 18 + Vite 6
- **Styling**: Tailwind CSS (class-based dark mode, custom true-black palette)
- **Maps / GIS**: Leaflet.js & `react-leaflet` (CartoDB Dark Matter / Voyager tiles)
- **Charts**: Recharts (Responsive SVG area and trend charts)
- **State & Caching**: `@tanstack/react-query`
- **PWA & Service Worker**: `vite-plugin-pwa` (Workbox runtime tile & API caching)
- **Offline Storage**: IndexedDB via `idb`
- **i18n**: `i18next` & `react-i18next`
- **Icons**: Lucide React

---

## 📦 Setup & Installation

### Prerequisites
- Node.js (v18+ or v24)
- npm (v9+)

### Installation
```bash
# Clone or navigate to the repository
cd frontend

# Install dependencies
npm install
```

### Running Locally
```bash
# Start development server
npm run dev

# Or run from workspace root:
npm run dev
```
Open your browser and visit: `http://localhost:3000` (or the port indicated in the terminal).

### Building for Production
```bash
npm run build
npm run preview
```

---

## ⚙️ Environment Variables & API Toggle

Create or edit `.env` inside the `frontend/` directory:

```env
# Backend Base URL
VITE_API_URL=http://localhost:8000/api

# Mock Mode Toggle:
# Set to true to run against the built-in realistic mock data engine
# Set to false to transmit requests directly to the live backend server
VITE_USE_MOCKS=true
```

---

## 🔐 Official Authority Credentials (Demo)

Click **Official Login** in the top navigation bar to authenticate as a district official:
- **District Admin**: `official_shillong` / `meghalaya2026`
- **SDRF Commander**: `sdrf_lead_sohra` / `rescue2026`
*(Quick-fill buttons are provided on the login page for demo convenience)*
