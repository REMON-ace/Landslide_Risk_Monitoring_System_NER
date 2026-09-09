import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { predictRisk } from '../api/client';
import { Cpu, Gauge, Play, RotateCcw, Sparkles, Layers } from 'lucide-react';

export default function PredictorPage() {
  const { t } = useTranslation();

  const defaultFeatures = {
    slope: 34.5,
    aspect: 182.3,
    elevation: 1420,
    curvature: -0.42,
    dist_to_drainage: 310.0,
    rainfall_24h: 65.2,
    rainfall_72h: 210.0,
    rainfall_7d: 380.5,
    rainfall_intensity_peak: 28.4,
    antecedent_rainfall_index: 145.7,
    soil_moisture: 0.61,
    dist_to_history: 0.8,
    landslide_freq_district: 47,
  };

  const [features, setFeatures] = useState(defaultFeatures);
  const [prediction, setPrediction] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleSlider = (key, val) => {
    setFeatures((prev) => ({ ...prev, [key]: parseFloat(val) }));
  };

  const handleRunPredict = async () => {
    setIsRunning(true);
    try {
      const res = await predictRisk(features);
      setPrediction(res);
    } catch (err) {
      console.error('Prediction failed:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const resetFeatures = () => {
    setFeatures(defaultFeatures);
    setPrediction(null);
  };

  const severityColor = {
    critical: '#ef4444',
    high: '#ea580c',
    medium: '#eab308',
    low: '#10b981',
  }[prediction?.severity || 'high'];

  // Feature slider definitions
  const sliders = [
    { key: 'slope',                    labelKey: 'predictor.feat_slope',      min: 5,    max: 75,   step: 0.5,  unit: '°',     color: 'orange' },
    { key: 'rainfall_24h',             labelKey: 'predictor.feat_rainfall_24h', min: 0, max: 250,  step: 1,    unit: ' mm',   color: 'cyan' },
    { key: 'rainfall_72h',             labelKey: 'predictor.feat_rainfall_72h', min: 0, max: 500,  step: 5,    unit: ' mm',   color: 'cyan' },
    { key: 'rainfall_7d',              labelKey: 'predictor.feat_rainfall_7d',  min: 0, max: 900,  step: 5,    unit: ' mm',   color: 'cyan' },
    { key: 'antecedent_rainfall_index',labelKey: 'predictor.feat_ari',          min: 10, max: 300, step: 1,    unit: '',      color: 'amber' },
    { key: 'soil_moisture',            labelKey: 'predictor.feat_moisture',     min: 0.1, max: 0.95, step: 0.01, unit: '',   color: 'emerald' },
    { key: 'rainfall_intensity_peak',  labelKey: 'predictor.feat_peak',         min: 0, max: 80,   step: 0.5,  unit: ' mm/h', color: 'default' },
    { key: 'elevation',                labelKey: 'predictor.feat_elevation',    min: 200, max: 2000, step: 10, unit: ' m',   color: 'default' },
    { key: 'curvature',                labelKey: 'predictor.feat_curvature',    min: -2, max: 2,   step: 0.05, unit: '',     color: 'default' },
    { key: 'dist_to_drainage',         labelKey: 'predictor.feat_drainage',     min: 10, max: 1000, step: 10, unit: ' m',   color: 'default' },
  ];

  const colorClass = {
    orange: 'text-orange-500',
    cyan: 'text-cyan-500',
    amber: 'text-amber-500',
    emerald: 'text-emerald-500',
    default: 'text-slate-900 dark:text-white',
  };
  const accentClass = {
    orange: 'accent-orange-500',
    cyan: 'accent-cyan-500',
    amber: 'accent-amber-500',
    emerald: 'accent-emerald-500',
    default: '',
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#006B4F] dark:text-emerald-400 flex items-center gap-2">
            <Cpu className="w-6 h-6 text-[#006B4F] dark:text-emerald-400" />
            <span>{t('predictor.title')}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {t('predictor.subtitle')}{' '}
            <code className="font-mono text-[#006B4F] dark:text-emerald-400 font-bold">POST /predict-risk</code>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetFeatures}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 border border-[#D9E2DE] dark:border-zinc-800 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('predictor.reset_btn')}</span>
          </button>
          <button
            onClick={handleRunPredict}
            disabled={isRunning}
            className="px-4 py-1.5 rounded-lg bg-[#006B4F] hover:bg-[#00523c] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{isRunning ? t('predictor.running') : t('predictor.run_btn')}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sliders Panel */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-950 border border-[#D9E2DE] dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#D9E2DE] dark:border-zinc-800">
            <h3 className="font-bold text-sm text-[#006B4F] dark:text-emerald-400 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#006B4F] dark:text-emerald-400" />
              <span>{t('predictor.panel_title')}</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-500">{t('predictor.panel_badge')}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-xs">
            {sliders.map(({ key, labelKey, min, max, step, unit, color }) => (
              <div key={key} className="space-y-1">
                <div className="flex justify-between">
                  <span className="font-semibold text-[#1F2937] dark:text-zinc-300">{t(labelKey)}</span>
                  <span className={`font-mono font-bold ${color === 'emerald' ? 'text-[#008060]' : colorClass[color]}`}>
                    {features[key]}{unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={features[key]}
                  onChange={(e) => handleSlider(key, e.target.value)}
                  className={`w-full accent-[#006B4F]`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Output Panel */}
        <div className="bg-white dark:bg-zinc-950 border border-[#D9E2DE] dark:border-zinc-800 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9E2DE] dark:border-zinc-800">
              <h3 className="font-bold text-sm text-[#006B4F] dark:text-emerald-400 flex items-center gap-2">
                <Gauge className="w-4 h-4 text-[#006B4F] dark:text-emerald-400" />
                <span>{t('predictor.output_title')}</span>
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">{t('predictor.output_badge')}</span>
            </div>

            {prediction ? (
              <div className="space-y-6 text-center py-4">
                <div className="relative inline-flex items-center justify-center">
                  <div
                    className="w-36 h-36 rounded-full border-8 flex flex-col items-center justify-center transition-all duration-700 shadow-md bg-white dark:bg-zinc-900"
                    style={{ borderColor: severityColor, boxShadow: `0 0 25px -5px ${severityColor}30` }}
                  >
                    <span className="text-3xl font-black font-mono text-[#1F2937] dark:text-white">
                      {(prediction.risk_score * 100).toFixed(0)}%
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">{t('predictor.risk_score_label')}</span>
                  </div>
                </div>

                <div>
                  <span
                    className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-sm"
                    style={{ backgroundColor: severityColor }}
                  >
                    {t(`severity.${prediction.severity}`)}
                  </span>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 mt-2 leading-relaxed">
                    {t('predictor.result_desc')}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#F5F7F6] dark:bg-zinc-900 border border-[#D9E2DE] dark:border-zinc-800 text-left text-[11px] font-mono space-y-1">
                  <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                    <span>{t('predictor.raw_score_label')}:</span>
                    <span className="text-[#1F2937] dark:text-white font-bold">{prediction.risk_score}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                    <span>{t('predictor.model_label')}:</span>
                    <span className="text-[#008060] font-bold">{t('predictor.model_name')}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-slate-400 space-y-2">
                <Sparkles className="w-8 h-8 text-[#006B4F] mx-auto opacity-50" />
                <p>{t('predictor.empty_hint')}</p>
              </div>
            )}
          </div>

          <button
            onClick={handleRunPredict}
            disabled={isRunning}
            className="w-full py-2.5 rounded-lg bg-[#006B4F] hover:bg-[#00523c] text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" />
            <span>{t('predictor.execute_btn')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
