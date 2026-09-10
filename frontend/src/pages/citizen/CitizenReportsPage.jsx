// Citizen Field Reports — submit hazard observations with photo upload & GPS detection + view submission history
import React, { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { submitFieldReport, getFieldReports } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  FileText,
  MapPin,
  Send,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  Camera,
  Upload,
  X,
  Crosshair,
  Sparkles,
  Eye,
  Layers,
  AlertTriangle,
  Radio,
  Image as ImageIcon,
} from 'lucide-react';

export default function CitizenReportsPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  // Form state
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [desc, setDesc] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [hazardType, setHazardType] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoError, setPhotoError] = useState(false);

  // Location detection state
  const [locating, setLocating] = useState(false);
  const [locationAccuracy, setLocationAccuracy] = useState(null);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formOpen, setFormOpen] = useState(true);

  // Lightbox preview modal
  const [lightboxImg, setLightboxImg] = useState(null);

  // Quick hazard presets
  const HAZARD_PRESETS = [
    { id: 'cracks', label: t('report_form.preset_cracks', 'Slope Cracks / Tension Fissures'), icon: '⚡' },
    { id: 'mudflow', label: t('report_form.preset_mudflow', 'Active Mudflow / Debris Wash'), icon: '🌊' },
    { id: 'boulders', label: t('report_form.preset_boulders', 'Rockfall / Boulders on Road'), icon: '🪨' },
    { id: 'retaining_wall', label: t('report_form.preset_wall', 'Retaining Wall Bowing / Seepage'), icon: '🧱' },
    { id: 'drain_choked', label: t('report_form.preset_drain', 'Culvert / Drain Blockage'), icon: '🌧️' },
  ];

  // GPS Auto-detect handler
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError(t('report_form.geo_not_supported', 'Geolocation is not supported by your browser. Please enter coordinates manually.'));
      return;
    }

    setLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latitude = pos.coords.latitude.toFixed(6);
        const longitude = pos.coords.longitude.toFixed(6);
        setLat(latitude);
        setLng(longitude);
        if (pos.coords.accuracy) {
          setLocationAccuracy(Math.round(pos.coords.accuracy));
        }
        setLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setLocating(false);
        setError(
          t('report_form.geo_permission_denied', 'Could not obtain GPS location. Please check browser permissions or enter coordinates manually.')
        );
        // Fallback default coordinates if fields are empty
        if (!lat && !lng) {
          setLat('25.2840');
          setLng('91.7325');
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  // Photo selection handler
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError(t('report_form.photo_too_large', 'Photo size must be under 10MB.'));
        return;
      }
      setPhotoFile(file);
      setPhotoError(false);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePresetClick = (preset) => {
    setHazardType(preset.id);
    const prefix = `[${preset.label}] `;
    if (!desc.includes(preset.label)) {
      setDesc(prev => (prev ? `${prefix}${prev}` : prefix));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!lat || !lng) {
      setError(t('report_form.coords_required', 'Location coordinates are required. Use GPS or enter them manually.'));
      return;
    }

    if (!desc.trim()) {
      setError(t('report_form.desc_required', 'Please describe the observed landslide hazard.'));
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('lat', parseFloat(lat));
      formData.append('lng', parseFloat(lng));
      formData.append('description', desc.trim());
      formData.append('reporter_type', 'citizen');
      formData.append('severity', severity);
      formData.append('language', i18n.language || 'en');

      if (photoFile) {
        formData.append('photo', photoFile);
      }

      await submitFieldReport(formData);

      setSuccess(true);
      setLat('');
      setLng('');
      setDesc('');
      setHazardType('');
      setPhotoFile(null);
      setPhotoPreview(null);
      setLocationAccuracy(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      queryClient.invalidateQueries({ queryKey: ['citizen_reports'] });
      queryClient.invalidateQueries({ queryKey: ['citizen_alerts'] });
      queryClient.invalidateQueries({ queryKey: ['reports_nav'] });

      setTimeout(() => setSuccess(false), 6000);
    } catch (err) {
      setError(err.message || t('report_form.failed_msg', 'Submission failed. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  // Load recent reports
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['citizen_reports'],
    queryFn: () => getFieldReports({ reporter_type: 'citizen' }),
    staleTime: 1000 * 45,
  });

  const STATUS_STYLE = {
    received: 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    verified: 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
    dismissed: 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-700',
  };

  const SEVERITY_PILL = {
    low: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200',
    medium: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200',
    high: 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 border-orange-200',
    critical: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border-red-200',
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#006B4F]/10 dark:bg-emerald-950/40 text-[#006B4F] dark:text-emerald-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {t('sidebar.field_reports', { defaultValue: 'Citizen Hazard Field Reports' })}
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xl leading-relaxed">
            {t(
              'report_form.subtitle',
              { defaultValue: 'Submit real-time ground observations, slope fissures, or rockfall photos. Your input directly triggers emergency validation.' }
            )}
          </p>
        </div>
      </div>

      {/* ── Submit Form Card ───────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0D0E10] border border-[#D9E2DE] dark:border-[#27272A] rounded-2xl overflow-hidden shadow-sm transition-all">
        <button
          onClick={() => setFormOpen((p) => !p)}
          className="w-full flex items-center justify-between px-5 py-4 border-b border-[#D9E2DE] dark:border-[#27272A] bg-[#F8FAF9] dark:bg-[#121215] text-left cursor-pointer hover:bg-[#EAF5F0]/60 dark:hover:bg-emerald-950/10 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#006B4F] text-white">
              <Send className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-zinc-100 block">
                {t('report_form.title', { defaultValue: 'Submit New Hazard Observation' })}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                {t('report_form.form_hint', { defaultValue: 'Attach photos & GPS coordinates for immediate ground dispatch' })}
              </span>
            </div>
          </div>
          <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-500">
            {formOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {formOpen && (
          <div className="p-5 sm:p-6">
            {/* Success Notification */}
            {success && (
              <div className="flex items-start gap-3 p-4 mb-5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-800 dark:text-emerald-300 animate-fade-in shadow-xs">
                <CheckCircle2 className="w-5 h-5 text-[#006B4F] dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-sm">
                    {t('report_form.success_title', { defaultValue: 'Report Transmitted Successfully!' })}
                  </p>
                  <p className="text-[11px] opacity-90">
                    {t('report_form.success_msg', { defaultValue: 'Your observation and evidence photos have been sent to the District Operations Centre for immediate review.' })}
                  </p>
                </div>
              </div>
            )}

            {/* Error Notification */}
            {error && (
              <div className="flex items-start gap-3 p-4 mb-5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-[#E63946] animate-fade-in shadow-xs">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold">{t('report_form.error_title', { defaultValue: 'Unable to submit report' })}</p>
                  <p className="text-[11px] opacity-90">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              {/* ── Quick Hazard Presets ─────────────────────────── */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                  {t('report_form.quick_presets', { defaultValue: 'Quick Hazard Category' })}
                </label>
                <div className="flex flex-wrap gap-2">
                  {HAZARD_PRESETS.map((p) => {
                    const active = hazardType === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handlePresetClick(p)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1.5 border cursor-pointer ${
                          active
                            ? 'bg-[#006B4F] text-white border-[#006B4F] shadow-xs'
                            : 'bg-[#F5F7F6] dark:bg-[#141418] text-slate-700 dark:text-zinc-300 border-[#D9E2DE] dark:border-[#27272A] hover:border-[#006B4F]/40'
                        }`}
                      >
                        <span>{p.icon}</span>
                        <span>{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Location Coordinates & GPS Button ────────────── */}
              <div className="space-y-2.5 p-4 rounded-xl bg-[#F5F7F6]/80 dark:bg-[#141418]/80 border border-[#D9E2DE] dark:border-[#27272A]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#006B4F] dark:text-emerald-400" />
                    <span>{t('report_form.location', { defaultValue: 'Location Coordinates' })}</span>
                    <span className="text-[#E63946]">*</span>
                  </label>

                  {/* USE MY GPS COORDINATES BUTTON */}
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={locating}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#006B4F] hover:bg-[#00523C] text-white font-bold text-[11px] transition-all shadow-xs disabled:opacity-50 cursor-pointer active:scale-95"
                  >
                    <Crosshair className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : 'animate-pulse'}`} />
                    <span>
                      {locating
                        ? t('report_form.detecting_gps', { defaultValue: 'Detecting GPS...' })
                        : t('report_form.use_gps', { defaultValue: 'Use My GPS Coordinates' })}
                    </span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-semibold block mb-1">
                      {t('report_form.lat_label', { defaultValue: 'Latitude (°N)' })}
                    </span>
                    <input
                      type="number"
                      step="any"
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      placeholder="e.g. 25.284021"
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0D0E10] border border-[#D9E2DE] dark:border-[#27272A] text-slate-900 dark:text-white placeholder-slate-400 font-mono focus:outline-none focus:border-[#006B4F] focus:ring-1 focus:ring-[#006B4F] transition-all"
                      required
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-semibold block mb-1">
                      {t('report_form.lng_label', { defaultValue: 'Longitude (°E)' })}
                    </span>
                    <input
                      type="number"
                      step="any"
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                      placeholder="e.g. 91.732540"
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0D0E10] border border-[#D9E2DE] dark:border-[#27272A] text-slate-900 dark:text-white placeholder-slate-400 font-mono focus:outline-none focus:border-[#006B4F] focus:ring-1 focus:ring-[#006B4F] transition-all"
                      required
                    />
                  </div>
                </div>

                {locationAccuracy && (
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>
                      {t('report_form.gps_accuracy', {
                        defaultValue: 'GPS fix acquired with accuracy of ±{{meters}}m',
                        meters: locationAccuracy,
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* ── Photo Evidence Upload Section ─────────────────── */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-[#006B4F] dark:text-emerald-400" />
                    <span>{t('report_form.photo_evidence', { defaultValue: 'Hazard Photo Evidence' })}</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {t('report_form.photo_recommended', { defaultValue: 'Recommended for fast verification' })}
                  </span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoSelect}
                  className="hidden"
                  id="citizen-report-photo-input"
                />

                {!photoPreview ? (
                  <label
                    htmlFor="citizen-report-photo-input"
                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#D9E2DE] dark:border-[#27272A] hover:border-[#006B4F] dark:hover:border-emerald-500/50 rounded-xl bg-[#F8FAF9] dark:bg-[#121215] cursor-pointer transition-all text-center group"
                  >
                    <div className="w-12 h-12 rounded-full bg-white dark:bg-[#18181C] border border-[#D9E2DE] dark:border-[#27272A] flex items-center justify-center text-slate-500 group-hover:text-[#006B4F] group-hover:scale-110 transition-all shadow-xs mb-2">
                      <Camera className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                      {t('report_form.upload_photo_btn', { defaultValue: 'Click to Take Photo or Upload Image' })}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {t('report_form.upload_photo_sub', { defaultValue: 'Supports camera capture, PNG, JPG, WEBP up to 10MB' })}
                    </p>
                  </label>
                ) : (
                  <div className="relative rounded-xl border border-[#D9E2DE] dark:border-[#27272A] overflow-hidden bg-slate-900 group">
                    <img
                      src={photoPreview}
                      alt="Hazard Evidence Preview"
                      className="w-full h-48 sm:h-56 object-contain bg-black/40"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                      <div className="text-white text-[11px]">
                        <p className="font-bold truncate max-w-[200px]">{photoFile?.name || 'Hazard Photo'}</p>
                        <p className="text-[10px] text-slate-300">
                          {photoFile ? `${(photoFile.size / 1024).toFixed(0)} KB` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setLightboxImg(photoPreview)}
                          className="p-1.5 rounded-lg bg-white/20 hover:bg-white/40 text-white transition-colors"
                          title="View Full Size"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="p-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                          title="Remove Photo"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Quick remove badge always accessible */}
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-red-600 text-white transition-colors shadow-md group-hover:hidden"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* ── Severity Level ───────────────────────────────── */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-800 dark:text-zinc-200">
                  {t('report_form.severity_label', { defaultValue: 'Hazard Severity Level' })}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'low', label: t('severity.low_short', 'Low (Minor)'), color: 'border-emerald-500' },
                    { id: 'medium', label: t('severity.medium_short', 'Medium (Moderate)'), color: 'border-amber-500' },
                    { id: 'high', label: t('severity.high_short', 'High (Severe)'), color: 'border-orange-500' },
                    { id: 'critical', label: t('severity.critical_short', 'Critical (Urgent)'), color: 'border-red-500' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSeverity(s.id)}
                      className={`p-2 rounded-xl text-center font-bold text-xs border transition-all cursor-pointer ${
                        severity === s.id
                          ? 'bg-[#006B4F] text-white border-[#006B4F] shadow-xs'
                          : 'bg-[#F5F7F6] dark:bg-[#141418] text-slate-700 dark:text-zinc-300 border-[#D9E2DE] dark:border-[#27272A]'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Detailed Description ─────────────────────────── */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-800 dark:text-zinc-200">
                  {t('report_form.description', { defaultValue: 'Detailed Observation Notes' })}{' '}
                  <span className="text-[#E63946]">*</span>
                </label>
                <textarea
                  rows={4}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder={t(
                    'report_form.description_placeholder',
                    { defaultValue: 'Describe what you observed: slope cracks, soil movement, blocked roads, fallen trees, unusual water flow...' }
                  )}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F7F6] dark:bg-[#141418] border border-[#D9E2DE] dark:border-[#27272A] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#006B4F] focus:ring-1 focus:ring-[#006B4F] resize-none transition-all leading-relaxed"
                  required
                />
              </div>

              {/* ── Submit Action ─────────────────────────────────── */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-[#006B4F] hover:bg-[#00523C] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer shadow-md active:scale-98"
              >
                <Send className="w-4 h-4" />
                {submitting
                  ? t('report_form.submitting', { defaultValue: 'Transmitting Field Report...' })
                  : t('report_form.submit', { defaultValue: 'Submit Field Hazard Report' })}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ── Reports History Feed ───────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0D0E10] border border-[#D9E2DE] dark:border-[#27272A] rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-[#D9E2DE] dark:border-[#27272A] bg-[#F8FAF9] dark:bg-[#121215] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#006B4F] dark:text-emerald-400" />
              <h2 className="text-xs sm:text-sm font-black text-slate-800 dark:text-zinc-100">
                {t('reports_feed.title', { defaultValue: 'Recent Community Field Reports' })}
              </h2>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {t('reports_feed.subtitle', { defaultValue: 'Verified citizen observations across the district' })}
            </p>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#EAF5F0] dark:bg-emerald-950/40 text-[#006B4F] dark:text-emerald-400 font-mono text-[10px] font-bold border border-[#006B4F]/20">
            {reports.length} {t('common.reports', { defaultValue: 'Reports' })}
          </span>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-7 h-7 border-3 border-[#006B4F] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-2 text-center">
            <div className="w-12 h-12 rounded-full bg-[#EAF5F0] dark:bg-emerald-950/40 flex items-center justify-center text-[#006B4F] dark:text-emerald-400">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">
              {t('reports_feed.empty', { defaultValue: 'No reports logged yet' })}
            </p>
            <p className="text-[11px] text-slate-400">
              {t('reports_feed.empty_sub', { defaultValue: 'Be the first to log a slope hazard in your area.' })}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#D9E2DE]/60 dark:divide-[#27272A]/60">
            {reports.slice(0, 15).map((report) => (
              <div
                key={report.report_id}
                className="p-4 sm:p-5 hover:bg-[#F8FAF9] dark:hover:bg-[#121215] transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[11px] font-bold text-slate-500 dark:text-zinc-400">
                        {report.report_id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${
                          STATUS_STYLE[report.status] || STATUS_STYLE.received
                        }`}
                      >
                        {t(`reports_feed.status_${report.status}`, { defaultValue: report.status })}
                      </span>
                      {report.severity && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${
                            SEVERITY_PILL[report.severity] || SEVERITY_PILL.medium
                          }`}
                        >
                          {t(`severity.${report.severity}_short`, report.severity)}
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-800 dark:text-zinc-200 leading-relaxed font-medium">
                      {report.description || t('report_modal.no_description', { defaultValue: 'No description provided.' })}
                    </p>

                    <div className="flex items-center gap-4 text-[10px] text-slate-400 font-mono flex-wrap pt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#006B4F]" />
                        {report.lat?.toFixed(4)}°N, {report.lng?.toFixed(4)}°E
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(report.timestamp || report.submitted_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Photo thumbnail */}
                  {report.photo_url && (
                    <div
                      onClick={() => setLightboxImg(report.photo_url)}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-[#D9E2DE] dark:border-[#27272A] shrink-0 cursor-pointer relative group shadow-xs"
                    >
                      <img
                        src={report.photo_url}
                        alt="Hazard observation photo"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Eye className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Photo Lightbox Modal ───────────────────────────────────── */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setLightboxImg(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] bg-black rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <img src={lightboxImg} alt="Hazard evidence full view" className="max-w-full max-h-[80vh] object-contain" />
            <button
              onClick={() => setLightboxImg(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
