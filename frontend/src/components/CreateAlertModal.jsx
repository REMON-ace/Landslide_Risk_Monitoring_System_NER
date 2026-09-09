import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createAlert } from '../api/client';
import { SUPPORTED_LANGUAGES } from '../i18n/index';
import { Radio, X, CheckCircle2, Send } from 'lucide-react';

export default function CreateAlertModal({ isOpen, onClose, zones = [], defaultZone = null, onAlertCreated }) {
  const { t } = useTranslation();
  const [zoneId, setZoneId] = useState(defaultZone?.zone_id || zones[0]?.zone_id || 'MEG-EKH-014');
  const [severity, setSeverity] = useState('high');
  const [messageKey, setMessageKey] = useState('landslide_risk_high');
  const [customMessage, setCustomMessage] = useState('');
  const [languages, setLanguages] = useState(['en', 'kha']);
  const [channels, setChannels] = useState(['sms', 'app']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const handleToggleLang = (lang) => {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const handleToggleChannel = (ch) => {
    setChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    const selectedZoneObj = zones.find((z) => z.zone_id === zoneId);

    try {
      const payload = {
        zone_id: zoneId,
        village: selectedZoneObj?.village_name || 'Sohra',
        severity,
        message_key: messageKey,
        languages,
        channels,
        custom_message:
          customMessage.trim() ||
          `URGENT: Landslide hazard alert issued for ${selectedZoneObj?.village_name || zoneId}. Slope instability detected. Evacuate low-lying trails immediately.`,
      };

      const res = await createAlert(payload);
      setResult(res);
      if (onAlertCreated) onAlertCreated();
      setTimeout(() => {
        onClose();
        setResult(null);
      }, 1800);
    } catch (err) {
      console.error('Failed to broadcast alert:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-950 border border-[#D9E2DE] dark:border-zinc-800 w-full max-w-lg rounded-xl p-6 shadow-2xl space-y-4">
        
        <div className="flex items-center justify-between pb-3 border-b border-[#D9E2DE] dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-red-50 text-[#E63946] border border-red-200">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#006B4F] dark:text-emerald-400">
                {t('create_alert.title')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {t('create_alert.subtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-200"
            aria-label={t('common.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {result ? (
          <div className="p-6 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-[#008060] mx-auto animate-bounce" />
            <h4 className="font-bold text-base text-[#1F2937] dark:text-white">
              {t('create_alert.success_title')}
            </h4>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {t('create_alert.success_desc', { alert_id: result.alert_id, count: result.recipients_count })}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Zone Selection */}
            <div>
              <label className="block font-semibold text-[#1F2937] dark:text-zinc-300 mb-1">
                {t('create_alert.zone_label')}
              </label>
              <select
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 text-[#1F2937] dark:text-zinc-200 border border-[#D9E2DE] dark:border-zinc-800 font-medium focus:outline-none focus:border-[#006B4F] focus:ring-1 focus:ring-[#006B4F]"
              >
                {zones.map((z) => (
                  <option key={z.zone_id} value={z.zone_id}>
                    {z.village_name} ({z.zone_id}) — {t('zone_detail.risk_score_label')}: {z.risk_score} ({t(`severity.${z.severity}_short`, { defaultValue: z.severity })})
                  </option>
                ))}
              </select>
            </div>

            {/* Severity */}
            <div>
              <label className="block font-semibold text-[#1F2937] dark:text-zinc-300 mb-1">
                {t('create_alert.severity_label')}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { key: 'low', label: t('severity.low_short'), color: 'bg-[#008060]' },
                  { key: 'medium', label: t('severity.medium_short'), color: 'bg-yellow-600' },
                  { key: 'high', label: t('severity.high_short'), color: 'bg-orange-600' },
                  { key: 'critical', label: t('severity.critical_short'), color: 'bg-[#E63946]' },
                ].map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setSeverity(s.key)}
                    className={`py-2 rounded-lg font-bold uppercase transition-all ${
                      severity === s.key
                        ? `${s.color} text-white ring-2 ring-black/20`
                        : 'bg-slate-50 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-[#D9E2DE] dark:border-zinc-800'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Advisory text */}
            <div>
              <label className="block font-semibold text-[#1F2937] dark:text-zinc-300 mb-1">
                {t('create_alert.message_label')}
              </label>
              <textarea
                rows={3}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder={t('create_alert.message_placeholder')}
                className="w-full p-3 rounded-lg bg-white dark:bg-zinc-900 text-[#1F2937] dark:text-zinc-200 border border-[#D9E2DE] dark:border-zinc-800 focus:outline-none focus:border-[#006B4F] focus:ring-1 focus:ring-[#006B4F]"
              />
            </div>

            {/* Language & Broadcast Channels */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#1F2937] dark:text-zinc-300 mb-1">
                  {t('create_alert.languages_label')}
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleToggleLang(lang.code)}
                      title={lang.regionLabel}
                      className={`px-2 py-1 rounded-lg font-mono font-bold text-[10px] border transition-all ${
                        languages.includes(lang.code)
                          ? 'bg-[#006B4F] text-white border-[#006B4F]'
                          : 'bg-slate-50 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-[#D9E2DE] dark:border-zinc-700'
                      }`}
                    >
                      <span className="block text-[9px] font-medium">{lang.code.toUpperCase()}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">
                  {t('create_alert.langs_selected', { count: languages.length })}
                </p>
              </div>

              <div>
                <label className="block font-semibold text-[#1F2937] dark:text-zinc-300 mb-1">
                  {t('create_alert.channels_label')}
                </label>
                <div className="flex gap-2">
                  {['sms', 'app', 'siren'].map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => handleToggleChannel(ch)}
                      className={`px-2.5 py-1.5 rounded-lg uppercase font-mono font-bold text-[11px] border ${
                        channels.includes(ch)
                          ? 'bg-[#E63946] text-white border-[#E63946]'
                          : 'bg-slate-50 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-[#D9E2DE] dark:border-zinc-700'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#D9E2DE] dark:border-zinc-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-[#D9E2DE] dark:border-zinc-700 font-medium hover:bg-slate-50"
              >
                {t('create_alert.cancel')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting || channels.length === 0}
                className="px-5 py-2 rounded-lg bg-[#E63946] hover:bg-[#c92a37] text-white font-bold flex items-center gap-1.5 shadow transition-all disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? t('create_alert.dispatching') : t('create_alert.dispatch_btn')}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
