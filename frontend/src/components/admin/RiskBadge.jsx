import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Semantic Risk Badge
 * Strictly follows risk colors:
 * LOW: green (#008060)
 * MEDIUM: amber (#D97706)
 * HIGH: orange (#EA580C)
 * CRITICAL: red (#E63946)
 */
export default function RiskBadge({ severity, className = '', showDot = true, size = 'sm' }) {
  const { t } = useTranslation();
  const norm = (severity || 'low').toLowerCase();

  const configs = {
    low: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-[#008060] dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800/40',
      dot: 'bg-[#008060]',
      labelKey: 'severity.low_short',
      defaultLabel: 'LOW',
    },
    medium: {
      bg: 'bg-amber-50 dark:bg-amber-950/40 text-[#D97706] dark:text-amber-400 border-amber-200/80 dark:border-amber-800/40',
      dot: 'bg-[#D97706]',
      labelKey: 'severity.medium_short',
      defaultLabel: 'MEDIUM',
    },
    high: {
      bg: 'bg-orange-50 dark:bg-orange-950/40 text-[#EA580C] dark:text-orange-400 border-orange-200/80 dark:border-orange-800/40',
      dot: 'bg-[#EA580C]',
      labelKey: 'severity.high_short',
      defaultLabel: 'HIGH',
    },
    critical: {
      bg: 'bg-red-50 dark:bg-red-950/40 text-[#E63946] dark:text-red-400 border-red-200/80 dark:border-red-800/40',
      dot: 'bg-[#E63946] animate-pulse',
      labelKey: 'severity.critical_short',
      defaultLabel: 'CRITICAL',
    },
  };

  const conf = configs[norm] || configs.low;

  const sizeClasses = size === 'xs'
    ? 'px-1.5 py-0.5 text-[10px]'
    : size === 'md'
    ? 'px-3 py-1 text-xs'
    : 'px-2.5 py-0.5 text-[11px]';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-md border font-sans select-none ${conf.bg} ${sizeClasses} ${className}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${conf.dot}`} />}
      <span>{t(conf.labelKey, conf.defaultLabel)}</span>
    </span>
  );
}
