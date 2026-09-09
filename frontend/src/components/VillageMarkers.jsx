import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';
import { Home } from 'lucide-react';

const villageIcon = L.divIcon({
  className: 'custom-village-icon',
  html: `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      background: #006B4F;
      border: 2px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    ">
      <div style="width: 6px; height: 6px; background: #ffffff; border-radius: 50%;"></div>
    </div>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -11],
});

export default function VillageMarkers({ villages = [] }) {
  const { t } = useTranslation();

  return (
    <>
      {villages.map((village) => (
        <Marker
          key={village.village_id}
          position={[village.lat, village.lng]}
          icon={villageIcon}
        >
          <Popup>
            <div className="p-1 min-w-[180px] text-xs">
              <div className="flex items-center gap-1.5 pb-1 border-b border-[#D9E2DE] dark:border-zinc-800">
                <Home className="w-4 h-4 text-[#006B4F]" />
                <span className="font-bold text-[#1F2937] dark:text-white">{village.name}</span>
              </div>
              <div className="mt-2 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('map_popup.population')}:</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">{village.population?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('map_popup.zone_label')}:</span>
                  <span className="font-mono text-slate-600 dark:text-zinc-400">{village.zone_id}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {t('zone_detail.lat_label')}: {village.lat.toFixed(4)}, {t('zone_detail.lng_label')}: {village.lng.toFixed(4)}
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}
