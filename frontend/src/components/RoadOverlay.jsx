import React from 'react';
import { Polyline, Popup } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Route } from 'lucide-react';

const ROAD_STATUS_STYLES = {
  clear: { color: '#008060', weight: 5, dashArray: null },
  partial: { color: '#f59e0b', weight: 5, dashArray: '6, 6' },
  blocked: { color: '#E63946', weight: 6, dashArray: '8, 8' },
};

export default function RoadOverlay({ roads = [], onStatusUpdate }) {
  const { t } = useTranslation();
  const { isOfficial } = useAuth();

  return (
    <>
      {roads.map((road) => {
        const style = ROAD_STATUS_STYLES[road.status] || ROAD_STATUS_STYLES.clear;

        return (
          <Polyline
            key={road.road_id}
            positions={road.coordinates}
            pathOptions={{
              color: style.color,
              weight: style.weight,
              dashArray: style.dashArray,
              opacity: 0.9,
            }}
          >
            <Popup>
              <div className="p-1 min-w-[210px] text-xs">
                <div className="flex items-center gap-1.5 pb-1.5 border-b border-[#D9E2DE] dark:border-zinc-800">
                  <Route className="w-4 h-4 text-[#006B4F]" />
                  <span className="font-bold text-[#1F2937] dark:text-zinc-100">{road.name}</span>
                </div>

                <div className="mt-2 space-y-1 text-[11px]">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-zinc-400">{t('map_popup.current_status')}:</span>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold uppercase text-white"
                      style={{ backgroundColor: style.color }}
                    >
                      {t(`road_status.${road.status}_label`, { defaultValue: road.status })}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-zinc-500">
                    {t('map_popup.road_id')}: {road.road_id} • {t('map_popup.road_updated')} {new Date(road.last_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {/* Official action to update status */}
                {isOfficial && onStatusUpdate && (
                  <div className="mt-3 pt-2 border-t border-[#D9E2DE] dark:border-zinc-800">
                    <span className="block text-[10px] font-semibold text-slate-500 dark:text-zinc-400 mb-1">
                      {t('map_popup.authority_override')}:
                    </span>
                    <div className="grid grid-cols-3 gap-1">
                      {['clear', 'partial', 'blocked'].map((st) => (
                        <button
                          key={st}
                          disabled={road.status === st}
                          onClick={() => onStatusUpdate(road.road_id, st)}
                          className={`py-1 px-1 rounded text-[10px] font-semibold capitalize border transition-all ${
                            road.status === st
                              ? 'bg-[#EAF5F0] text-[#006B4F] font-bold border-[#006B4F]/30 cursor-default'
                              : st === 'blocked'
                              ? 'bg-white dark:bg-zinc-900 hover:bg-[#E63946] hover:text-white border-[#D9E2DE] dark:border-zinc-700'
                              : 'bg-white dark:bg-zinc-900 hover:bg-[#006B4F] hover:text-white border-[#D9E2DE] dark:border-zinc-700'
                          }`}
                        >
                          {t(`road_status.${st}_label`, { defaultValue: st })}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Popup>
          </Polyline>
        );
      })}
    </>
  );
}
