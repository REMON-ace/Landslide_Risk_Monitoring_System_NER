import React from 'react';

/**
 * Semantic Status Badge for Roads, Reports, and System States
 */
export default function StatusBadge({ status, className = '', size = 'sm' }) {
  const norm = (status || 'clear').toLowerCase();

  const configs = {
    // Roads
    blocked: {
      bg: 'bg-red-50 dark:bg-red-950/40 text-[#E63946] dark:text-red-400 border-red-200 dark:border-red-900/50',
      dot: 'bg-[#E63946]',
      label: 'Blocked',
    },
    partial: {
      bg: 'bg-amber-50 dark:bg-amber-950/40 text-[#D97706] dark:text-amber-400 border-amber-200 dark:border-amber-900/50',
      dot: 'bg-[#D97706]',
      label: 'Partial',
    },
    clear: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-[#008060] dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50',
      dot: 'bg-[#008060]',
      label: 'Clear / Open',
    },

    // Reports
    verified: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-[#008060] dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50',
      dot: 'bg-[#008060]',
      label: 'Verified',
    },
    received: {
      bg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50',
      dot: 'bg-blue-500',
      label: 'Pending Review',
    },
    dismissed: {
      bg: 'bg-slate-100 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700',
      dot: 'bg-slate-400',
      label: 'Dismissed',
    },

    // Alerts
    sent: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-[#008060] dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50',
      dot: 'bg-[#008060]',
      label: 'Broadcast Sent',
    },
    active: {
      bg: 'bg-red-50 dark:bg-red-950/40 text-[#E63946] dark:text-red-400 border-red-200 dark:border-red-900/50',
      dot: 'bg-[#E63946] animate-pulse',
      label: 'Active Warning',
    },
  };

  const conf = configs[norm] || {
    bg: 'bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700',
    dot: 'bg-slate-400',
    label: status,
  };

  const sizeClasses = size === 'xs'
    ? 'px-1.5 py-0.5 text-[10px]'
    : size === 'md'
    ? 'px-3 py-1 text-xs'
    : 'px-2 py-0.5 text-[11px]';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-md border font-sans select-none capitalize ${conf.bg} ${sizeClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${conf.dot}`} />
      <span>{conf.label}</span>
    </span>
  );
}
