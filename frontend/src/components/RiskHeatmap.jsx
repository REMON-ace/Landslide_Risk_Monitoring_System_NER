import React from 'react';
import { Circle, CircleMarker, Popup } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';

const SEVERITY_CONFIG = {
  critical: { color: '#E63946', fillColor: '#E63946', radius: 14 },
  high: { color: '#ea580c', fillColor: '#ea580c', radius: 12 },
  medium: { color: '#eab308', fillColor: '#eab308', radius: 10 },
  low: { color: '#008060', fillColor: '#008060', radius: 8 },
};

export default function RiskHeatmap({ zones = [], selectedZoneId, onSelectZone }) {
  const { t } = useTranslation();

  return (
    <>
      {zones.map((zone) => {
        const config = SEVERITY_CONFIG[zone.severity] || SEVERITY_CONFIG.medium;
        const isSelected = selectedZoneId === zone.zone_id;

        return (
          <React.Fragment key={zone.zone_id}>
            {/* Outer risk halo for high / critical zones */}
            {(zone.severity === 'critical' || zone.severity === 'high') && (
              <Circle
                center={[zone.lat, zone.lng]}
                radius={zone.severity === 'critical' ? 2200 : 1500}
                pathOptions={{
                  color: config.color,
                  fillColor: config.fillColor,
                  fillOpacity: 0.14,
                  weight: 1.5,
                  dashArray: '4, 4',
                }}
              />
            )}

            {/* Core Interactive Risk Marker */}
            <CircleMarker
              center={[zone.lat, zone.lng]}
              radius={isSelected ? config.radius + 4 : config.radius}
              pathOptions={{
                color: isSelected ? '#ffffff' : config.color,
                fillColor: config.fillColor,
                fillOpacity: 0.88,
                weight: isSelected ? 3 : 2,
              }}
              eventHandlers={{
                click: () => onSelectZone(zone),
              }}
            >
              <Popup>
                <div className="p-1 min-w-[200px] text-xs">
                  <div className="flex items-center justify-between pb-1.5 border-b border-[#D9E2DE] dark:border-zinc-800">
                    <span className="font-bold text-sm text-[#1F2937] dark:text-white">{zone.village_name}</span>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white"
                      style={{ backgroundColor: config.color }}
                    >
                      {t(`severity.${zone.severity}_short`, { defaultValue: zone.severity })}
                    </span>
                  </div>

                  <div className="mt-2 space-y-1 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t('map_popup.zone_id')}:</span>
                      <span className="font-semibold text-slate-800 dark:text-zinc-200">{zone.zone_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t('map_popup.risk_score')}:</span>
                      <span className="font-bold text-[#006B4F] dark:text-emerald-400">{zone.risk_score.toFixed(2)} / 1.0</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>{t('map_popup.coordinates')}:</span>
                      <span>{zone.lat.toFixed(4)}, {zone.lng.toFixed(4)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectZone(zone)}
                    className="mt-3 w-full py-1.5 px-2 rounded-lg bg-[#006B4F] hover:bg-[#00523c] text-white font-medium flex items-center justify-center gap-1 transition-colors shadow-sm"
                  >
                    <span>{t('map_popup.inspect')}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Popup>
            </CircleMarker>
          </React.Fragment>
        );
      })}
    </>
  );
}
