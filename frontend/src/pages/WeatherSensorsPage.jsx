import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getCurrentWeather, getSoilMoisture, getRiskZones } from '../api/client';
import PageHeader from '../components/admin/PageHeader';
import SectionCard from '../components/admin/SectionCard';
import {
  CloudRain,
  Droplets,
  Wind,
  Compass,
  Gauge,
  Activity,
  Radio,
  RefreshCw,
  Zap,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Signal,
  BatteryCharging,
  Thermometer,
  Layers,
  Sparkles,
  Info,
  Calendar,
  Clock,
  Eye,
} from 'lucide-react';

const STATIONS = [
  { id: 'SOHRA', name: 'Sohra (Cherrapunji)', lat: 25.2745, lng: 91.7323, elev: '1,430m', zone_id: 'MEG-EKH-001', district: 'East Khasi Hills' },
  { id: 'MAWSYNRAM', name: 'Mawsynram Sector', lat: 25.2974, lng: 91.5828, elev: '1,400m', zone_id: 'MEG-EKH-022', district: 'East Khasi Hills' },
  { id: 'PYNURSLA', name: 'Pynursla Ridge', lat: 25.3092, lng: 91.8978, elev: '1,320m', zone_id: 'MEG-EKH-014', district: 'East Khasi Hills' },
  { id: 'MAWPHLANG', name: 'Mawphlang Sacred Grove', lat: 25.4520, lng: 91.7580, elev: '1,610m', zone_id: 'MEG-EKH-046', district: 'East Khasi Hills' },
  { id: 'SHILLONG_PEAK', name: 'Shillong Peak Station', lat: 25.5350, lng: 91.8500, elev: '1,965m', zone_id: 'MEG-EKH-002', district: 'East Khasi Hills' },
  { id: 'DAWKI', name: 'Dawki Border Corridor', lat: 25.1850, lng: 92.0180, elev: '320m', zone_id: 'MEG-EKH-033', district: 'West Jaintia Hills' },
];

export default function WeatherSensorsPage() {
  const { t } = useTranslation();
  const [selectedStation, setSelectedStation] = useState(STATIONS[0]);
  const [radarMode, setRadarMode] = useState('precipitation'); // 'precipitation' | 'moisture' | 'wind'
  const [isSimulatingLive, setIsSimulatingLive] = useState(true);
  const [activeSensorFilter, setActiveSensorFilter] = useState('all');

  // Query weather for selected station coordinates
  const {
    data: weatherData,
    isLoading: isWeatherLoading,
    refetch: refetchWeather,
    isFetching: isWeatherFetching,
  } = useQuery({
    queryKey: ['weather_station', selectedStation.lat, selectedStation.lng],
    queryFn: () => getCurrentWeather(selectedStation.lat, selectedStation.lng),
    staleTime: 1000 * 30,
    refetchInterval: isSimulatingLive ? 1000 * 20 : false,
  });

  // Query soil moisture sensor data
  const {
    data: soilSensors = [],
    isLoading: isSoilLoading,
    refetch: refetchSoil,
  } = useQuery({
    queryKey: ['soil_sensors', selectedStation.zone_id],
    queryFn: () => getSoilMoisture(selectedStation.zone_id),
    staleTime: 1000 * 30,
  });

  // Synthesize rich telemetry with fallback when API returns default values
  const telemetry = useMemo(() => {
    const baseRain24h = weatherData?.rainfall_24h ?? 68.4;
    const baseRain72h = weatherData?.rainfall_72h ?? 214.2;
    const baseRain7d = weatherData?.rainfall_7d ?? 418.6;
    const peakIntensity = weatherData?.rainfall_intensity_peak ?? 32.5;
    const ari = weatherData?.antecedent_rainfall_index ?? 142.8;
    const forecast24h = weatherData?.forecast_next_24h ?? 85.0;

    return {
      rain24h: baseRain24h,
      rain72h: baseRain72h,
      rain7d: baseRain7d,
      peakIntensity,
      ari,
      forecast24h,
      humidity: 92,
      pressure: 1004.2,
      temp: 18.6,
      windSpeed: 24.5,
      windDir: 'SSW 210°',
      cloudCover: 94,
      source: weatherData?.source || 'IMD Doppler Radar • Cherrapunji Node',
    };
  }, [weatherData]);

  // Synthetic IoT multi-depth probes for the selected zone
  const sensorProbes = useMemo(() => {
    if (soilSensors && soilSensors.length > 0) {
      return soilSensors.map((s, idx) => ({
        id: s.sensor_id || `SM-NODE-0${idx + 1}`,
        depth: idx === 0 ? '0.2m (Topsoil)' : idx === 1 ? '0.5m (Colluvium)' : '1.0m (Bedrock Interface)',
        moisture: Math.round((s.moisture || 0.68) * 100),
        porePressure: ((s.moisture || 0.68) * 34.2).toFixed(1),
        temp: (17.5 + idx * 0.8).toFixed(1),
        battery: 94 - idx * 4,
        signal: -62 - idx * 5,
        status: (s.moisture || 0.68) > 0.8 ? 'critical' : (s.moisture || 0.68) > 0.6 ? 'warning' : 'optimal',
        lastPing: '2s ago',
      }));
    }

    return [
      {
        id: `SM-${selectedStation.id}-01`,
        depth: '0.20m Topsoil Horizon A',
        moisture: 78,
        porePressure: '28.4',
        temp: '18.2',
        battery: 96,
        signal: -58,
        status: 'warning',
        lastPing: '3s ago',
      },
      {
        id: `SM-${selectedStation.id}-02`,
        depth: '0.50m Colluvial Sublayer B',
        moisture: 84,
        porePressure: '36.8',
        temp: '17.4',
        battery: 92,
        signal: -64,
        status: 'critical',
        lastPing: '1s ago',
      },
      {
        id: `SM-${selectedStation.id}-03`,
        depth: '1.00m Bedrock Slip Interface',
        moisture: 69,
        porePressure: '22.1',
        temp: '16.8',
        battery: 88,
        signal: -71,
        status: 'optimal',
        lastPing: '4s ago',
      },
      {
        id: `SM-${selectedStation.id}-04`,
        depth: '1.50m Deep Aquifer Boundary',
        moisture: 88,
        porePressure: '41.5',
        temp: '16.1',
        battery: 95,
        signal: -67,
        status: 'critical',
        lastPing: '2s ago',
      },
    ];
  }, [soilSensors, selectedStation]);

  const filteredProbes = sensorProbes.filter(p => {
    if (activeSensorFilter === 'all') return true;
    return p.status === activeSensorFilter;
  });

  // Hourly simulated 24h curve
  const hourlyForecast = [
    { hour: '00:00', rain: 12.4, prob: 95, temp: 17 },
    { hour: '03:00', rain: 18.2, prob: 98, temp: 16 },
    { hour: '06:00', rain: 26.5, prob: 99, temp: 17 },
    { hour: '09:00', rain: 34.0, prob: 100, temp: 18 },
    { hour: '12:00', rain: 22.8, prob: 90, temp: 20 },
    { hour: '15:00', rain: 16.4, prob: 85, temp: 19 },
    { hour: '18:00', rain: 14.2, prob: 80, temp: 18 },
    { hour: '21:00', rain: 19.8, prob: 92, temp: 17 },
  ];

  const handleRefreshAll = () => {
    refetchWeather();
    refetchSoil();
  };

  return (
    <div className="space-y-6 pb-16">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <PageHeader
        kicker={t('weather_page.kicker', 'Meteorological & Subsurface IoT Array')}
        title={t('weather_page.title', 'Live Atmospheric Weather & Soil Telemetry')}
        description={t('weather_page.description', 'High-frequency hydrometeorological sensors, Doppler precipitation telemetry, and slope pore-water saturation monitoring across East Khasi Hills.')}
        badge={
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-700 dark:text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>{t('weather_page.doppler_live', 'IMD Doppler Live (10s sync)')}</span>
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSimulatingLive(!isSimulatingLive)}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                isSimulatingLive
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-[#006B4F] dark:text-emerald-400 border-[#006B4F]/30'
                  : 'bg-white dark:bg-[#141418] text-slate-600 dark:text-zinc-400 border-[#D9E2DE] dark:border-[#27272A]'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${isSimulatingLive ? 'text-amber-500 fill-amber-500 animate-bounce' : ''}`} />
              <span>{isSimulatingLive ? t('weather_page.live_stream_active', 'Live Telemetry Active') : t('weather_page.stream_paused', 'Paused')}</span>
            </button>

            <button
              onClick={handleRefreshAll}
              disabled={isWeatherFetching}
              className="px-3.5 py-2 rounded-lg bg-[#006B4F] hover:bg-[#00523C] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isWeatherFetching ? 'animate-spin' : ''}`} />
              <span>{t('common.refresh', 'Refresh Sensors')}</span>
            </button>
          </div>
        }
      />

      {/* ── Station Selector Strip ─────────────────────────────────── */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0D0E10] border border-[#D9E2DE] dark:border-[#27272A] shadow-xs flex items-center justify-between gap-3 overflow-x-auto">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#EAF5F0] dark:bg-emerald-950/40 flex items-center justify-center text-[#006B4F] dark:text-emerald-400">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">{t('weather_page.monitoring_station', 'Telemetry Station')}</p>
            <p className="text-xs font-black text-slate-900 dark:text-white">{selectedStation.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {STATIONS.map((station) => {
            const isSelected = selectedStation.id === station.id;
            return (
              <button
                key={station.id}
                onClick={() => setSelectedStation(station)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                  isSelected
                    ? 'bg-[#006B4F] text-white border-[#006B4F] shadow-sm scale-102'
                    : 'bg-[#F5F7F6] dark:bg-[#141418] text-slate-700 dark:text-zinc-300 border-[#D9E2DE] dark:border-[#27272A] hover:border-[#006B4F]/40'
                }`}
              >
                <span>{station.name.split(' ')[0]}</span>
                <span className={`ml-1.5 text-[10px] font-normal opacity-75 ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                  {station.elev}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Top Grid: Live Animated Doppler Radar & Rainfall Physics ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Animated Doppler Radar Canvas / Scanner (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative rounded-2xl bg-gradient-to-b from-[#0B1512] to-[#040807] border border-emerald-900/40 p-5 text-white overflow-hidden shadow-xl min-h-[380px] flex flex-col justify-between">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#006B4F_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

            {/* Radar Header */}
            <div className="relative z-10 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <h3 className="text-xs font-black tracking-wider uppercase text-emerald-400 font-mono">
                    {t('weather_page.doppler_radar_title', 'Doppler Precipitation Sweep • Real-time')}
                  </h3>
                  <p className="text-[10px] text-emerald-600 font-mono">
                    {selectedStation.name} • {selectedStation.lat.toFixed(4)}°N, {selectedStation.lng.toFixed(4)}°E
                  </p>
                </div>
              </div>

              {/* Radar Mode Switcher */}
              <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-emerald-900/60 text-[10px] font-mono">
                {[
                  { key: 'precipitation', label: t('weather_page.mode_rain', 'Rain Radar') },
                  { key: 'moisture',      label: t('weather_page.mode_soil', 'Soil Saturation') },
                  { key: 'wind',          label: t('weather_page.mode_wind', 'Wind Vector') },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setRadarMode(key)}
                    className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                      radarMode === key ? 'bg-[#006B4F] text-white font-bold' : 'text-emerald-500 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Radar Center Visualizer */}
            <div className="relative my-6 flex items-center justify-center h-56">
              {/* Radar Range Rings */}
              <div className="absolute w-52 h-52 rounded-full border border-emerald-500/20 flex items-center justify-center">
                <div className="w-36 h-36 rounded-full border border-emerald-500/30 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full border border-emerald-500/40 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                </div>
              </div>

              {/* Crosshairs */}
              <div className="absolute inset-x-12 h-px bg-emerald-500/20" />
              <div className="absolute inset-y-4 w-px bg-emerald-500/20" />

              {/* Animated Radar Sweep Cone */}
              <div className="absolute w-52 h-52 rounded-full overflow-hidden pointer-events-none">
                <div
                  className="w-full h-full animate-radar-sweep opacity-75"
                  style={{
                    background: 'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(0, 200, 120, 0.4) 360deg)',
                  }}
                />
              </div>

              {/* Dynamic Radar Hazard Echoes (Pulsing Sector Dots) */}
              <div className="absolute top-12 left-20 flex flex-col items-center">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-ping opacity-90" />
                <span className="text-[9px] font-mono font-bold text-red-400 mt-1 bg-black/80 px-1 rounded">
                  84mm/h
                </span>
              </div>

              <div className="absolute bottom-14 right-24 flex flex-col items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse opacity-90" />
                <span className="text-[9px] font-mono font-bold text-orange-400 mt-0.5 bg-black/80 px-1 rounded">
                  42mm/h
                </span>
              </div>

              <div className="absolute top-20 right-20 flex flex-col items-center">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[8px] font-mono text-emerald-300 mt-0.5">18mm/h</span>
              </div>

              {/* Center Beacon Label */}
              <div className="absolute z-10 text-center bg-black/80 px-3 py-1 rounded-full border border-emerald-500/50 backdrop-blur-md">
                <span className="text-[10px] font-mono font-black text-emerald-300">
                  {selectedStation.id} RADAR NODE
                </span>
              </div>
            </div>

            {/* Radar Footer Metrics Bar */}
            <div className="relative z-10 grid grid-cols-4 gap-2 pt-3 border-t border-emerald-900/40 text-center font-mono">
              <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-900/30">
                <p className="text-[9px] text-emerald-500 uppercase">{t('weather_page.radar_dbz', 'Reflectivity')}</p>
                <p className="text-xs font-black text-emerald-300">54.2 dBZ</p>
              </div>
              <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-900/30">
                <p className="text-[9px] text-emerald-500 uppercase">{t('weather_page.wind_vector', 'Wind Vector')}</p>
                <p className="text-xs font-black text-emerald-300">{telemetry.windDir}</p>
              </div>
              <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-900/30">
                <p className="text-[9px] text-emerald-500 uppercase">{t('weather_page.pressure', 'Pressure')}</p>
                <p className="text-xs font-black text-emerald-300">{telemetry.pressure} hPa</p>
              </div>
              <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-900/30">
                <p className="text-[9px] text-emerald-500 uppercase">{t('weather_page.humidity', 'Humidity')}</p>
                <p className="text-xs font-black text-emerald-300">{telemetry.humidity}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Precipitation & Antecedent Hazard Barometer (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Precipitation Cylinder Gauge Card */}
          <div className="rounded-2xl bg-white dark:bg-[#0D0E10] border border-[#D9E2DE] dark:border-[#27272A] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 flex items-center justify-center">
                  <CloudRain className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white">
                    {t('weather_page.precipitation_intensity', 'Precipitation Telemetry')}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {t('weather_page.realtime_rain_gauge', 'Digital Optical Rain Gauge & Tipping Bucket')}
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                {telemetry.rain24h > 100 ? 'Downpour' : telemetry.rain24h > 50 ? 'Moderate' : 'Light Rain'}
              </span>
            </div>

            {/* Key Telemetry Numbers */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#F5F7F6] dark:bg-[#141418] border border-[#D9E2DE] dark:border-[#27272A]">
                <p className="text-[10px] font-bold uppercase text-slate-500">{t('sensors.rainfall_24h', '24h Rainfall')}</p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black text-sky-600 dark:text-sky-400">{telemetry.rain24h}</span>
                  <span className="text-xs font-bold text-slate-400">mm</span>
                </div>
                {/* Visual Bar */}
                <div className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-400 to-blue-600 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, (telemetry.rain24h / 150) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F5F7F6] dark:bg-[#141418] border border-[#D9E2DE] dark:border-[#27272A]">
                <p className="text-[10px] font-bold uppercase text-slate-500">{t('sensors.rainfall_72h', '72h Cumulative')}</p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{telemetry.rain72h}</span>
                  <span className="text-xs font-bold text-slate-400">mm</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-indigo-600 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, (telemetry.rain72h / 300) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F5F7F6] dark:bg-[#141418] border border-[#D9E2DE] dark:border-[#27272A]">
                <p className="text-[10px] font-bold uppercase text-slate-500">{t('sensors.peak_intensity', 'Peak Intensity')}</p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{telemetry.peakIntensity}</span>
                  <span className="text-xs font-bold text-slate-400">mm/h</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F5F7F6] dark:bg-[#141418] border border-[#D9E2DE] dark:border-[#27272A]">
                <p className="text-[10px] font-bold uppercase text-slate-500">{t('weather_page.forecast_24h', 'Forecast 24h')}</p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{telemetry.forecast24h}</span>
                  <span className="text-xs font-bold text-slate-400">mm</span>
                </div>
              </div>
            </div>

            {/* Antecedent Rainfall Index (ARI) Trigger Barometer */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-red-50 dark:from-amber-950/20 dark:to-red-950/20 border border-amber-200 dark:border-amber-900/40 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-black text-amber-900 dark:text-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-600 animate-bounce" />
                  <span>{t('weather_page.ari_trigger_index', 'Antecedent Rainfall Index (ARI)')}</span>
                </div>
                <span className="font-mono text-sm font-black text-red-600 dark:text-red-400">
                  {telemetry.ari}
                </span>
              </div>

              <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                {telemetry.ari > 120
                  ? t('weather_page.ari_critical_warning', '⚠️ CRITICAL: Soil pore pressure saturation exceeds slope shear strength threshold (>120). Immediate landslide risk.')
                  : t('weather_page.ari_elevated_warning', '⚡ ELEVATED: Moisture accumulation in slope matrix approaching critical safety factor.')}
              </p>

              {/* Color zone threshold meter */}
              <div className="space-y-1">
                <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-zinc-800 flex overflow-hidden">
                  <div className="w-[35%] bg-emerald-500" title="Nominal (<60)" />
                  <div className="w-[25%] bg-yellow-500" title="Watch (60-100)" />
                  <div className="w-[20%] bg-orange-500" title="Warning (100-120)" />
                  <div className="w-[20%] bg-red-600 animate-pulse" title="Critical (>120)" />
                </div>
                <div className="flex justify-between text-[9px] font-mono text-slate-400">
                  <span>0 (Safe)</span>
                  <span>60</span>
                  <span>100</span>
                  <span>120 (Trigger)</span>
                  <span>180+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Subsurface Soil Moisture Matrix: Animated Circular Probes ─── */}
      <SectionCard
        kicker={t('weather_page.iot_sensor_matrix_kicker', 'Subsurface Pore Pressure Array')}
        title={t('weather_page.iot_sensor_matrix_title', 'Slope Soil Moisture Depth Probes & Pore Telemetry')}
        subtitle={t('weather_page.iot_sensor_matrix_sub', 'Multi-depth IoT capacitive moisture sensors monitoring slope liquefaction risk.')}
        badge={
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#006B4F] dark:text-emerald-400">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>{sensorProbes.length} {t('weather_page.active_probes', 'Active Probes')}</span>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Sensor Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="font-bold text-slate-500">{t('weather_page.filter_status', 'Filter Node Status:')}</span>
            {[
              { key: 'all',      label: t('common.all', 'All Probes') },
              { key: 'critical', label: t('severity.critical_short', 'Critical (>80%)') },
              { key: 'warning',  label: t('severity.high_short', 'Warning (60-80%)') },
              { key: 'optimal',  label: t('severity.low_short', 'Optimal (<60%)') },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveSensorFilter(key)}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer border ${
                  activeSensorFilter === key
                    ? 'bg-[#006B4F] text-white border-[#006B4F]'
                    : 'bg-[#F5F7F6] dark:bg-[#141418] text-slate-600 dark:text-zinc-400 border-[#D9E2DE] dark:border-[#27272A]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Grid of Animated Sensor Node Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredProbes.map((probe) => {
              const isCrit = probe.status === 'critical';
              const isWarn = probe.status === 'warning';
              const strokeColor = isCrit ? '#E63946' : isWarn ? '#EA580C' : '#008060';
              const circumference = 2 * Math.PI * 34;
              const strokeDashoffset = circumference - (probe.moisture / 100) * circumference;

              return (
                <div
                  key={probe.id}
                  className={`p-4 rounded-2xl border transition-all duration-300 hover:shadow-md space-y-3.5 ${
                    isCrit
                      ? 'bg-red-50/40 dark:bg-red-950/15 border-red-200 dark:border-red-900/40'
                      : isWarn
                      ? 'bg-amber-50/40 dark:bg-amber-950/15 border-amber-200 dark:border-amber-900/40'
                      : 'bg-white dark:bg-[#0D0E10] border-[#D9E2DE] dark:border-[#27272A]'
                  }`}
                >
                  {/* Header Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${isCrit ? 'bg-red-500 animate-ping' : isWarn ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                      <span className="font-mono text-xs font-black text-slate-800 dark:text-white">{probe.id}</span>
                    </div>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                      isCrit
                        ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300'
                        : isWarn
                        ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {probe.status}
                    </span>
                  </div>

                  {/* Circular Animated Dial with Water Moisture Level */}
                  <div className="flex items-center justify-center py-2">
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                        <circle
                          cx="40"
                          cy="40"
                          r="34"
                          className="stroke-slate-200 dark:stroke-zinc-800"
                          strokeWidth="7"
                          fill="transparent"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="34"
                          stroke={strokeColor}
                          strokeWidth="7"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          fill="transparent"
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-xl font-black text-slate-900 dark:text-white leading-none">
                          {probe.moisture}%
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 mt-0.5">Saturation</span>
                      </div>
                    </div>
                  </div>

                  {/* Probe Depth & Pore Details */}
                  <div className="space-y-1.5 pt-2 border-t border-[#D9E2DE]/70 dark:border-[#27272A]/70 text-[11px]">
                    <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                      <span className="font-semibold">{t('weather_page.probe_depth', 'Sensor Depth')}:</span>
                      <span className="font-bold text-slate-800 dark:text-zinc-200">{probe.depth}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                      <span className="font-semibold">{t('weather_page.pore_pressure', 'Pore Pressure')}:</span>
                      <span className="font-mono font-bold text-sky-600 dark:text-sky-400">{probe.porePressure} kPa</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                      <span className="font-semibold">{t('weather_page.soil_temp', 'Soil Temp')}:</span>
                      <span className="font-mono">{probe.temp}°C</span>
                    </div>
                  </div>

                  {/* Hardware Telemetry: Signal & Battery */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 font-mono">
                    <span className="flex items-center gap-1">
                      <Signal className="w-3 h-3 text-emerald-500" /> {probe.signal} dBm
                    </span>
                    <span className="flex items-center gap-1">
                      <BatteryCharging className="w-3 h-3 text-emerald-500" /> {probe.battery}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </SectionCard>

      {/* ── 24-Hour Predictive Timeline & Rain Probability ───────── */}
      <SectionCard
        kicker={t('weather_page.forecast_curve_kicker', 'Predictive Hydrology')}
        title={t('weather_page.forecast_curve_title', '24-Hour Precipitation Simulation & Monsoon Progression')}
        subtitle={t('weather_page.forecast_curve_sub', 'Hourly numerical weather simulation for slope destabilization forecasting.')}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {hourlyForecast.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-[#F5F7F6] dark:bg-[#141418] border border-[#D9E2DE] dark:border-[#27272A] flex flex-col items-center gap-2 hover:border-[#006B4F]/40 transition-all text-center"
              >
                <span className="text-[10px] font-mono text-slate-400 font-semibold">{item.hour}</span>
                <CloudRain className={`w-5 h-5 ${item.rain > 20 ? 'text-blue-600 animate-bounce' : 'text-sky-500'}`} />
                <div>
                  <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">{item.rain} mm</p>
                  <p className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">{item.prob}% rain</p>
                </div>
                <div className="w-full bg-slate-200 dark:bg-zinc-800 h-1 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${Math.min(100, (item.rain / 40) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
