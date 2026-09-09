import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Custom Leaflet HTML icon for database alert directives
const createAlertBeaconIcon = (severity) => {
  const isCritical = severity === 'critical';
  const isHigh = severity === 'high';

  const bgClass = isCritical
    ? 'bg-purple-700 border-red-200'
    : isHigh
    ? 'bg-purple-600 border-amber-200'
    : 'bg-purple-600 border-purple-200';

  const pulseClass = isCritical ? 'bg-purple-500' : 'bg-purple-400';

  return L.divIcon({
    className: 'custom-alert-beacon-marker',
    html: `
      <div class="relative flex items-center justify-center cursor-pointer group">
        <span class="absolute inline-flex h-9 w-9 rounded-full ${pulseClass} opacity-75 animate-ping"></span>
        <div class="relative flex items-center gap-1.5 px-2.5 py-1 rounded-full ${bgClass} text-white font-extrabold text-[10px] tracking-wider shadow-xl border-2 border-white transform group-hover:scale-110 transition-transform">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
          </svg>
          <span class="whitespace-nowrap font-sans uppercase font-black">ALERT DIRECTIVE</span>
        </div>
      </div>
    `,
    iconSize: [135, 34],
    iconAnchor: [67, 17],
    popupAnchor: [0, -17],
  });
};

export default function AlertOverlay({ alerts = [], zones = [], onSelectZone }) {
  // Build lookup map for fast matching by zone_id or village name
  const zoneLookup = React.useMemo(() => {
    const map = new Map();
    zones.forEach((z) => {
      if (z.zone_id) map.set(z.zone_id, z);
      if (z.village_name) map.set(z.village_name.toLowerCase(), z);
    });
    return map;
  }, [zones]);

  return (
    <>
      {alerts.map((alert, idx) => {
        let lat = alert.lat;
        let lng = alert.lng;
        let matchedZone = null;

        if (alert.zone_id && zoneLookup.has(alert.zone_id)) {
          matchedZone = zoneLookup.get(alert.zone_id);
        } else if (alert.village && zoneLookup.has(alert.village.toLowerCase())) {
          matchedZone = zoneLookup.get(alert.village.toLowerCase());
        }

        if (matchedZone) {
          lat = lat ?? matchedZone.lat;
          lng = lng ?? matchedZone.lng;
        }

        // Fallback offset coordinates near Shillong center if coordinates are missing
        if (!lat || !lng) {
          lat = 25.5788 + idx * 0.02;
          lng = 91.8933 + idx * 0.02;
        }

        const icon = createAlertBeaconIcon(alert.severity);

        return (
          <Marker
            key={alert.alert_id || `alert-${idx}`}
            position={[lat, lng]}
            icon={icon}
          >
            <Popup>
              <div className="p-1.5 min-w-[240px] max-w-[280px] text-xs">
                {/* Header Banner */}
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-gradient-to-r from-purple-700 to-indigo-800 text-white font-bold text-[11px] mb-2 shadow-sm">
                  <div className="p-1 rounded bg-white/20">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="uppercase tracking-wider text-[9px] text-purple-200 font-mono">
                      OFFICIAL PUBLIC DIRECTIVE
                    </div>
                    <div className="font-extrabold truncate text-xs">
                      {alert.village || matchedZone?.village_name || 'East Khasi Hills'} Sector
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-zinc-400">Directive ID:</span>
                    <span className="font-mono font-bold text-purple-700 dark:text-purple-400">
                      {alert.alert_id}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-zinc-400">Threat Level:</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase text-white ${
                        alert.severity === 'critical'
                          ? 'bg-red-600'
                          : alert.severity === 'high'
                          ? 'bg-amber-600'
                          : 'bg-purple-600'
                      }`}
                    >
                      {alert.severity || 'high'}
                    </span>
                  </div>

                  {/* Directive Message Body */}
                  <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-900/50 text-slate-800 dark:text-zinc-200 font-medium leading-relaxed">
                    "{alert.message}"
                  </div>

                  {/* Broadcast Channels */}
                  {(() => {
                    const chs = alert.channels || alert.sent_via || [];
                    return chs.length > 0 ? (
                    <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-slate-400 font-medium">Broadcasted via:</span>
                      {chs.map((ch) => (
                        <span
                          key={ch}
                          className="px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 font-bold text-[9px] uppercase border border-purple-200 dark:border-purple-800"
                        >
                          {ch}
                        </span>
                      ))}
                    </div>
                    ) : null;
                  })()}

                  <div className="pt-1 text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-200 dark:border-zinc-800">
                    <span>Issued by Admin</span>
                    <span className="font-mono">
                      {alert.sent_at || alert.timestamp
                        ? new Date(alert.sent_at || alert.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Just now'}
                    </span>
                  </div>

                  {matchedZone && onSelectZone && (
                    <button
                      onClick={() => onSelectZone(matchedZone)}
                      className="w-full mt-2 py-1.5 px-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                    >
                      <span>Focus Zone Details</span>
                    </button>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}
