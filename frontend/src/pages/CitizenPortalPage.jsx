// CitizenPortalPage.jsx — dedicated portal for verified citizen users
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { getAlerts, getRiskZones, submitFieldReport } from '../api/client';
import {
  Bell, MapPin, AlertTriangle, ShieldCheck, LogOut, FileText,
  ChevronRight, CheckCircle2, Clock, AlertCircle, X, Send,
  Info, Wifi, WifiOff, Sun, Moon,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useOfflineSync } from '../hooks/useOfflineSync';

const SEVERITY_CONFIG = {
  critical: { color: 'bg-red-500', text: 'text-red-600 dark:text-red-400', badge: 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' },
  high:     { color: 'bg-orange-500', text: 'text-orange-600 dark:text-orange-400', badge: 'bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800' },
  medium:   { color: 'bg-yellow-500', text: 'text-yellow-600 dark:text-yellow-400', badge: 'bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800' },
  low:      { color: 'bg-green-500',  text: 'text-green-600 dark:text-green-400',  badge: 'bg-green-100  dark:bg-green-950/50  text-green-700  dark:text-green-400  border-green-200  dark:border-green-800'  },
};

function ReportModal({ onClose, onSubmit }) {
  const [lat, setLat]   = useState('');
  const [lng, setLng]   = useState('');
  const [desc, setDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]   = useState(null);
  const [success, setSuccess] = useState(false);

  const locateMe = () => {
    if (!navigator.geolocation) { setError('Geolocation not supported.'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLat(pos.coords.latitude.toFixed(6)); setLng(pos.coords.longitude.toFixed(6)); },
      () => setError('Could not obtain location. Please enter manually.'),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!lat || !lng) { setError('Please provide location coordinates.'); return; }
    setSubmitting(true);
    try {
      await onSubmit({ lat: parseFloat(lat), lng: parseFloat(lng), description: desc, reporter_type: 'citizen' });
      setSuccess(true);
      setTimeout(onClose, 2000);
    } catch (err) {
      setError(err.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-[#0D0E10] border border-[#D9E2DE] dark:border-[#27272A] rounded-2xl shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-black text-sm text-slate-900 dark:text-white">Submit Field Observation</h2>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Report a landslide or hazard near you</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center py-6 gap-3">
            <CheckCircle2 className="w-10 h-10 text-[#006B4F]" />
            <p className="font-bold text-sm text-slate-800 dark:text-white">Report Submitted!</p>
            <p className="text-xs text-slate-500 text-center">Your observation has been sent to the district operations center for review.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-[#E63946]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-700 dark:text-zinc-300">Location Coordinates <span className="text-[#E63946]">*</span></label>
              <div className="flex gap-2">
                <input
                  type="number" step="any" value={lat} onChange={e => setLat(e.target.value)} placeholder="Latitude"
                  className="flex-1 px-3 py-2 rounded-lg bg-[#F5F7F6] dark:bg-[#141418] border border-[#D9E2DE] dark:border-[#27272A] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#006B4F] focus:ring-1 focus:ring-[#006B4F] transition-all"
                />
                <input
                  type="number" step="any" value={lng} onChange={e => setLng(e.target.value)} placeholder="Longitude"
                  className="flex-1 px-3 py-2 rounded-lg bg-[#F5F7F6] dark:bg-[#141418] border border-[#D9E2DE] dark:border-[#27272A] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#006B4F] focus:ring-1 focus:ring-[#006B4F] transition-all"
                />
              </div>
              <button
                type="button" onClick={locateMe}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-[#006B4F] dark:text-emerald-400 hover:underline cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5" /> Use my current location
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-700 dark:text-zinc-300">Description</label>
              <textarea
                rows={3} value={desc} onChange={e => setDesc(e.target.value)}
                placeholder="Describe what you observed (slope movement, cracks, blocked roads...)"
                className="w-full px-3 py-2 rounded-lg bg-[#F5F7F6] dark:bg-[#141418] border border-[#D9E2DE] dark:border-[#27272A] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#006B4F] focus:ring-1 focus:ring-[#006B4F] resize-none transition-all"
              />
            </div>

            <button
              type="submit" disabled={submitting}
              className="w-full py-2.5 rounded-lg bg-[#006B4F] hover:bg-[#00523C] text-white font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              {submitting ? 'Submitting...' : 'Submit Observation'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function CitizenPortalPage() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { isOnline } = useOfflineSync();
  const [showReportModal, setShowReportModal] = useState(false);
  const [activeTab, setActiveTab]   = useState('alerts');

  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ['citizen_alerts'],
    queryFn: getAlerts,
    staleTime: 1000 * 30,
  });

  const { data: zones = [], isLoading: zonesLoading } = useQuery({
    queryKey: ['citizen_zones'],
    queryFn: getRiskZones,
    staleTime: 1000 * 60,
  });

  const handleSubmitReport = async (data) => {
    await submitFieldReport(data);
  };

  const criticalZones = zones.filter(z => z.severity === 'critical' || z.severity === 'high' || z.current_severity === 'critical' || z.current_severity === 'high');

  return (
    <div className="min-h-screen bg-[#F5F7F6] dark:bg-black text-[#1F2937] dark:text-zinc-100 transition-colors">

      <header className="sticky top-0 z-30 w-full h-14 bg-white dark:bg-[#0D0E10] border-b border-[#D9E2DE] dark:border-[#27272A] shadow-xs flex items-center justify-between px-4 sm:px-6 transition-colors">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-black border border-[#D9E2DE] dark:border-[#27272A] shrink-0 overflow-hidden">
            <img src="/logo.svg" alt="NER LEWS" className="w-full h-full object-cover" />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="font-extrabold text-xs text-[#006B4F] dark:text-emerald-400">Landslide Early Warning</span>
            <span className="text-[10px] text-slate-500 dark:text-zinc-500">Citizen Portal · {user?.district || 'NER'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium border ${
            isOnline ? 'bg-slate-50 text-slate-600 dark:bg-[#141418] dark:text-zinc-300 border-[#D9E2DE] dark:border-[#27272A]'
                     : 'bg-red-50 text-[#E63946] dark:bg-red-950/40 dark:text-red-400 border-red-200'
          }`}>
            {isOnline ? <Wifi className="w-3 h-3 text-[#006B4F]" /> : <WifiOff className="w-3 h-3 text-[#E63946]" />}
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#141418] transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F5F7F6] dark:bg-[#141418] border border-[#D9E2DE] dark:border-[#27272A]">
            <div className="w-5 h-5 rounded-full bg-[#006B4F] flex items-center justify-center text-white text-[9px] font-bold shrink-0">
              {user?.username ? user.username[0].toUpperCase() : 'C'}
            </div>
            <span className="text-[11px] font-semibold text-slate-700 dark:text-zinc-200 truncate max-w-[80px]">
              {user?.username || 'Citizen'}
            </span>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#E63946] hover:bg-red-50 dark:hover:bg-red-950/30 border border-transparent hover:border-red-200 dark:hover:border-red-900 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">

        <div className="rounded-2xl bg-gradient-to-r from-[#006B4F] to-[#004f3a] p-5 text-white shadow-lg">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 opacity-80" />
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">Verified Resident</span>
              </div>
              <h1 className="text-base sm:text-lg font-black">Stay Safe, Stay Informed</h1>
              <p className="text-[11px] opacity-70">
                Receive real-time landslide alerts for {user?.district || 'your district'} and report hazards to help protect your community.
              </p>
            </div>
            <div className="shrink-0 flex flex-col items-center gap-1.5">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                <Bell className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold opacity-80">{alerts.length} Alerts</span>
            </div>
          </div>

          <button
            onClick={() => setShowReportModal(true)}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white text-[#006B4F] font-black text-xs hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            Report a Hazard Near Me
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Active Alerts', value: alerts.length, icon: Bell, color: 'text-[#E63946]', bg: 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30' },
            { label: 'Critical Zones', value: criticalZones.length, icon: AlertTriangle, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900/30' },
            { label: 'Monitored Zones', value: zones.length, icon: MapPin, color: 'text-[#006B4F] dark:text-emerald-400', bg: 'bg-[#EAF5F0] dark:bg-emerald-950/20 border-[#006B4F]/15 dark:border-emerald-900/30' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={`rounded-xl border p-3.5 flex flex-col gap-1.5 ${bg}`}>
              <Icon className={`w-4 h-4 ${color}`} />
              <p className={`text-lg font-black ${color}`}>{value}</p>
              <p className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 leading-tight">{label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-1 p-1 bg-[#F5F7F6] dark:bg-[#141418] rounded-xl border border-[#D9E2DE] dark:border-[#27272A]">
          {[
            { key: 'alerts', label: 'Active Alerts', icon: Bell },
            { key: 'zones',  label: 'Risk Zones',    icon: MapPin },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === key
                  ? 'bg-white dark:bg-[#0D0E10] text-[#006B4F] dark:text-emerald-400 shadow-sm border border-[#D9E2DE] dark:border-[#27272A]'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'alerts' && (
          <div className="space-y-3">
            {alertsLoading ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-3 border-[#006B4F] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-[#006B4F] mx-auto" />
                <p className="font-bold text-sm text-slate-700 dark:text-zinc-200">No active alerts</p>
                <p className="text-xs text-slate-500">Your district is currently safe. Stay vigilant during monsoon season.</p>
              </div>
            ) : (
              alerts.map((alert) => {
                const cfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.medium;
                return (
                  <div key={alert.alert_id} className="rounded-xl bg-white dark:bg-[#0D0E10] border border-[#D9E2DE] dark:border-[#27272A] p-4 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${cfg.color} animate-pulse shrink-0`} />
                        <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-zinc-400">{alert.alert_id}</span>
                      </div>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${cfg.badge}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-800 dark:text-zinc-200 leading-relaxed">{alert.message}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-[#D9E2DE]/60 dark:border-[#27272A]/60">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{alert.village || alert.zone_id}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(alert.timestamp || alert.sent_at).toLocaleString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'zones' && (
          <div className="space-y-3">
            {zonesLoading ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-3 border-[#006B4F] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : zones.length === 0 ? (
              <div className="text-center py-12">
                <Info className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No zone data available.</p>
              </div>
            ) : (
              zones.slice(0, 20).map((zone) => {
                const sev = zone.severity || zone.current_severity || 'low';
                const cfg = SEVERITY_CONFIG[sev] || SEVERITY_CONFIG.low;
                return (
                  <div key={zone.zone_id} className="rounded-xl bg-white dark:bg-[#0D0E10] border border-[#D9E2DE] dark:border-[#27272A] p-3.5 flex items-center gap-3 shadow-xs">
                    <div className={`w-3 h-3 rounded-full shrink-0 ${cfg.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate">{zone.village_name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{zone.zone_id} · Score: {zone.risk_score ?? zone.current_risk_score ?? '—'}</p>
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0 ${cfg.badge}`}>
                      {sev}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}

        <div className="rounded-xl bg-[#EAF5F0] dark:bg-emerald-950/20 border border-[#006B4F]/15 dark:border-emerald-900/30 p-4 space-y-2">
          <p className="text-[11px] font-black text-[#006B4F] dark:text-emerald-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" /> Safety Guidance
          </p>
          <ul className="text-[11px] text-slate-600 dark:text-zinc-400 space-y-1.5 list-none">
            {[
              'During heavy rainfall, avoid slopes and hillside areas.',
              'If you notice cracks, water seepage or unusual sounds — evacuate immediately.',
              'Keep emergency numbers handy: District SDRF — 1077.',
              'Report hazards using the button above. Every report helps.',
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-2">
                <ChevronRight className="w-3 h-3 text-[#006B4F] shrink-0 mt-0.5" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </main>

      {showReportModal && (
        <ReportModal
          onClose={() => setShowReportModal(false)}
          onSubmit={handleSubmitReport}
        />
      )}
    </div>
  );
}
