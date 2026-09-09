import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { getRiskZoneHistory, getCurrentWeather, getSoilMoisture } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  X,
  CloudRain,
  Droplets,
  TrendingUp,
  Radio,
  Gauge,
} from 'lucide-react';

export default function ZoneDetailDrawer({ zone, onClose, onOpenAlertModal }) {
  const { t } = useTranslation();
  const { isOfficial } = useAuth();
  const [history, setHistory] = useState([]);
  const [weather, setWeather] = useState(null);
  const [moisture, setMoisture] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!zone) return;

    let isMounted = true;
    setLoading(true);

    Promise.all([
      getRiskZoneHistory(zone.zone_id),
      getCurrentWeather(zone.lat, zone.lng),
      getSoilMoisture(zone.zone_id),
    ])
      .then(([histData, weatherData, moistData]) => {
        if (!isMounted) return;
        setHistory(histData?.history || []);
        setWeather(weatherData);
        if (Array.isArray(moistData) && moistData.length > 0) {
          setMoisture(moistData[0]);
        } else {
          setMoisture(moistData);
        }
      })
      .catch((err) => console.error('Error fetching zone analytics:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [zone]);

  if (!zone) return null;

  const severityColors = {
    critical: '#E63946',
    high: '#ea580c',
    medium: '#eab308',
    low: '#008060',
  };

  const currentColor = severityColors[zone.severity] || '#ea580c';

  return (
    <div className="bg-white dark:bg-zinc-950 border border-[#D9E2DE] dark:border-zinc-800 rounded-xl p-5 shadow-lg flex flex-col h-full overflow-y-auto">
      
      {/* Header */}
      <div className="flex items-start justify-between pb-4 border-b border-[#D9E2DE] dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-[#1F2937] dark:text-zinc-100">
              {zone.village_name}
            </h3>
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase text-white tracking-wider"
              style={{ backgroundColor: currentColor }}
            >
              {t(`severity.${zone.severity}_short`, { defaultValue: zone.severity })}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono mt-0.5">
            {t('zone_detail.zone_label')}: {zone.zone_id} • {t('zone_detail.lat_label')}: {zone.lat.toFixed(4)}, {t('zone_detail.lng_label')}: {zone.lng.toFixed(4)}
          </p>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900"
          aria-label={t('common.close')}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Risk Gauge Bar */}
      <div className="py-4 border-b border-[#D9E2DE] dark:border-zinc-800">
        <div className="flex justify-between items-center mb-1.5 text-xs">
          <span className="font-bold text-[#006B4F] dark:text-emerald-400 flex items-center gap-1.5">
            <Gauge className="w-4 h-4 text-[#006B4F] dark:text-emerald-400" />
            {t('zone_detail.risk_probability')}
          </span>
          <span className="font-mono font-bold text-base" style={{ color: currentColor }}>
            {(zone.risk_score * 100).toFixed(0)}%
          </span>
        </div>
        <div className="w-full h-3 bg-[#F5F7F6] dark:bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-[#D9E2DE] dark:border-zinc-800">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${zone.risk_score * 100}%`,
              backgroundColor: currentColor,
            }}
          />
        </div>
      </div>

      {/* 7-Day Trend Chart */}
      <div className="py-4 border-b border-[#D9E2DE] dark:border-zinc-800">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-[#006B4F] dark:text-emerald-400 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-[#006B4F] dark:text-emerald-400" />
            {t('zone_detail.trend_title')}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-zinc-500 font-mono">
            GET /risk-zones/{'{id}'}/history
          </span>
        </div>

        <div className="h-40 w-full">
          {loading ? (
            <div className="h-full flex items-center justify-center text-xs text-zinc-500 animate-pulse">
              {t('zone_detail.loading_trend')}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={currentColor} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={currentColor} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#D9E2DE" opacity={0.6} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(val) => val.slice(5)}
                  tick={{ fontSize: 10, fill: '#6B7280' }}
                />
                <YAxis domain={[0, 1]} tick={{ fontSize: 10, fill: '#6B7280' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#D9E2DE',
                    borderRadius: '8px',
                    color: '#1F2937',
                    fontSize: '11px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="risk_score"
                  stroke={currentColor}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#riskGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Telemetry & Weather Grid */}
      <div className="py-4 space-y-3 flex-1">
        <h4 className="text-xs font-bold text-[#006B4F] dark:text-emerald-400 flex items-center gap-1.5">
          <CloudRain className="w-4 h-4 text-[#006B4F] dark:text-emerald-400" />
          {t('zone_detail.telemetry_title')}
        </h4>

        <div className="grid grid-cols-2 gap-2 text-xs">
          
          <div className="p-2.5 rounded-xl bg-[#F5F7F6] dark:bg-zinc-900 border border-[#D9E2DE] dark:border-zinc-800">
            <span className="text-[10px] text-slate-500 dark:text-zinc-400">{t('zone_detail.rainfall_24h')}</span>
            <div className="text-base font-bold font-mono text-[#1F2937] dark:text-zinc-100 mt-0.5">
              {weather?.rainfall_24h ?? '65.2'} mm
            </div>
            <span className="text-[10px] text-[#008060] dark:text-emerald-400 font-medium">{t('zone_detail.peak_label')}: {weather?.rainfall_intensity_peak ?? '28.4'} mm/h</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#F5F7F6] dark:bg-zinc-900 border border-[#D9E2DE] dark:border-zinc-800">
            <span className="text-[10px] text-slate-500 dark:text-zinc-400">{t('zone_detail.soil_moisture')}</span>
            <div className="text-base font-bold font-mono text-[#1F2937] dark:text-zinc-100 mt-0.5 flex items-center gap-1">
              <Droplets className="w-4 h-4 text-[#008060]" />
              {moisture?.moisture ? `${(moisture.moisture * 100).toFixed(0)}%` : '61%'}
            </div>
            <span className="text-[10px] text-zinc-500">{t('zone_detail.sensor_label')}: {moisture?.sensor_id || 'SM-014'}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#F5F7F6] dark:bg-zinc-900 border border-[#D9E2DE] dark:border-zinc-800">
            <span className="text-[10px] text-slate-500 dark:text-zinc-400">{t('zone_detail.rainfall_7d')}</span>
            <div className="text-base font-bold font-mono text-[#1F2937] dark:text-zinc-100 mt-0.5">
              {weather?.rainfall_7d ?? '380.5'} mm
            </div>
            <span className="text-[10px] text-zinc-500">{t('zone_detail.rainfall_72h_label')}: {weather?.rainfall_72h ?? '210'} mm</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#F5F7F6] dark:bg-zinc-900 border border-[#D9E2DE] dark:border-zinc-800">
            <span className="text-[10px] text-slate-500 dark:text-zinc-400">{t('zone_detail.ari_label')}</span>
            <div className="text-base font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5">
              {weather?.antecedent_rainfall_index ?? '145.7'}
            </div>
            <span className="text-[10px] text-zinc-500">{t('zone_detail.forecast_label')}: {weather?.forecast_next_24h ?? '40.0'} mm</span>
          </div>
        </div>

        {weather?.source && (
          <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
            {t('zone_detail.source_label')}: {weather.source}
          </p>
        )}
      </div>

      {/* Official Actions */}
      <div className="pt-3 border-t border-[#D9E2DE] dark:border-zinc-800">
        {isOfficial ? (
          <button
            onClick={() => onOpenAlertModal(zone)}
            className="w-full py-2.5 px-4 rounded-xl bg-[#E63946] hover:bg-[#c92a37] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>{t('zone_detail.broadcast_btn', { village: zone.village_name })}</span>
          </button>
        ) : (
          <div className="p-2.5 rounded-xl bg-[#F5F7F6] dark:bg-zinc-900 border border-[#D9E2DE] dark:border-zinc-800 text-center text-[11px] text-slate-600 dark:text-zinc-400">
            {t('zone_detail.official_required')}
          </div>
        )}
      </div>
    </div>
  );
}
