import React from 'react';
import { ArrowUpRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * Premium AppDashboard Disaster Intelligence KPI Card
 *
 * Visual hierarchy:
 * ┌──────────────────────────────┐
 * │  ◉ (icon)                  ↗ │
 * │                              │
 * │  10                          │
 * │  Risk Zones                  │
 * │                              │
 * │  ● Monitoring active         │
 * └──────────────────────────────┘
 */
export default function KpiCard({
  title,
  value,
  subtext,
  icon: Icon,
  variant = 'primary',
  isLoading = false,
  onClick,
  trend,
  trendLabel,
  statusText,
}) {
  // Curated color themes based on metric severity/type
  const themeMap = {
    // TOTAL RISK ZONES → Deep/neutral green accent (#006B4F)
    primary: {
      cardBg: 'bg-gradient-to-br from-white via-[#F8FAF9] to-[#EAF5F0]/60 dark:from-[#0D0E10] dark:via-[#101312] dark:to-[#006B4F]/10',
      border: 'border-[#D9E2DE] dark:border-[#1E2E26] hover:border-[#006B4F]/50 dark:hover:border-[#006B4F]/60',
      iconBox: 'bg-[#EAF5F0] dark:bg-[#006B4F]/20 text-[#006B4F] dark:text-emerald-400 border border-[#006B4F]/20',
      arrowColor: 'text-[#006B4F] dark:text-emerald-400',
      dotColor: 'bg-[#006B4F] dark:bg-emerald-400',
      statusTextColor: 'text-slate-600 dark:text-zinc-400',
      accentGlow: 'hover:shadow-[0_8px_20px_-6px_rgba(0,107,79,0.15)]',
    },
    // HIGH RISK → Orange/amber accent (#EA580C)
    high: {
      cardBg: 'bg-gradient-to-br from-white via-[#FFFBF7] to-[#FFEDD5]/40 dark:from-[#0D0E10] dark:via-[#16120E] dark:to-[#EA580C]/10',
      border: 'border-[#FED7AA] dark:border-[#382314] hover:border-[#EA580C]/50 dark:hover:border-[#EA580C]/60',
      iconBox: 'bg-[#FFEDD5] dark:bg-[#EA580C]/20 text-[#EA580C] dark:text-orange-400 border border-[#EA580C]/20',
      arrowColor: 'text-[#EA580C] dark:text-orange-400',
      dotColor: 'bg-[#EA580C] dark:bg-orange-400',
      statusTextColor: 'text-orange-700 dark:text-orange-400',
      accentGlow: 'hover:shadow-[0_8px_20px_-6px_rgba(234,88,12,0.15)]',
    },
    // CRITICAL RISK → Strong red accent (#E63946)
    critical: {
      cardBg: 'bg-gradient-to-br from-white via-[#FFF8F8] to-[#FFE4E6]/50 dark:from-[#0D0E10] dark:via-[#181012] dark:to-[#E63946]/10',
      border: 'border-[#FECDD3] dark:border-[#3B191F] hover:border-[#E63946]/50 dark:hover:border-[#E63946]/60',
      iconBox: 'bg-[#FFE4E6] dark:bg-[#E63946]/20 text-[#E63946] dark:text-rose-400 border border-[#E63946]/20',
      arrowColor: 'text-[#E63946] dark:text-rose-400',
      dotColor: 'bg-[#E63946] dark:bg-rose-400',
      statusTextColor: 'text-[#E63946] dark:text-rose-400',
      accentGlow: 'hover:shadow-[0_8px_20px_-6px_rgba(230,57,70,0.18)]',
    },
    // BLOCKED ROADS → Amber/orange accent (#D97706)
    warning: {
      cardBg: 'bg-gradient-to-br from-white via-[#FFFDF5] to-[#FEF3C7]/40 dark:from-[#0D0E10] dark:via-[#15130A] dark:to-[#D97706]/10',
      border: 'border-[#FDE68A] dark:border-[#332B10] hover:border-[#D97706]/50 dark:hover:border-[#D97706]/60',
      iconBox: 'bg-[#FEF3C7] dark:bg-[#D97706]/20 text-[#D97706] dark:text-amber-400 border border-[#D97706]/20',
      arrowColor: 'text-[#D97706] dark:text-amber-400',
      dotColor: 'bg-[#D97706] dark:bg-amber-400',
      statusTextColor: 'text-amber-800 dark:text-amber-400',
      accentGlow: 'hover:shadow-[0_8px_20px_-6px_rgba(217,119,6,0.15)]',
    },
    // ACTIVE ALERTS → Rose/Red accent (#E63946)
    rose: {
      cardBg: 'bg-gradient-to-br from-white via-[#FFF8F8] to-[#FFE4E6]/50 dark:from-[#0D0E10] dark:via-[#181012] dark:to-[#E63946]/10',
      border: 'border-[#FECDD3] dark:border-[#3B191F] hover:border-[#E63946]/50 dark:hover:border-[#E63946]/60',
      iconBox: 'bg-[#FFE4E6] dark:bg-[#E63946]/20 text-[#E63946] dark:text-rose-400 border border-[#E63946]/20',
      arrowColor: 'text-[#E63946] dark:text-rose-400',
      dotColor: 'bg-[#E63946] dark:bg-rose-400',
      statusTextColor: 'text-[#E63946] dark:text-rose-400',
      accentGlow: 'hover:shadow-[0_8px_20px_-6px_rgba(230,57,70,0.18)]',
    },
    // Info / Field reports / Telemetry
    info: {
      cardBg: 'bg-gradient-to-br from-white via-[#F8FAFC] to-[#E0F2FE]/40 dark:from-[#0D0E10] dark:via-[#0F1418] dark:to-sky-950/10',
      border: 'border-[#BAE6FD] dark:border-[#132A38] hover:border-sky-500/50 dark:hover:border-sky-500/60',
      iconBox: 'bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 border border-sky-500/20',
      arrowColor: 'text-sky-600 dark:text-sky-400',
      dotColor: 'bg-sky-500',
      statusTextColor: 'text-sky-800 dark:text-sky-400',
      accentGlow: 'hover:shadow-[0_8px_20px_-6px_rgba(2,132,199,0.15)]',
    },
  };

  const theme = themeMap[variant] || themeMap.primary;
  const clickable = Boolean(onClick);

  return (
    <div
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (clickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`group relative rounded-2xl p-4 sm:p-5 border shadow-xs transition-all duration-300 ${
        theme.cardBg
      } ${theme.border} ${theme.accentGlow} ${
        clickable
          ? 'cursor-pointer hover:-translate-y-1 hover:shadow-md active:scale-[0.98]'
          : ''
      } select-none overflow-hidden`}
    >
      {/* Top row: Colored icon container on left, subtle arrow / indicator on right */}
      <div className="flex items-center justify-between mb-3">
        {Icon && (
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 shadow-2xs ${theme.iconBox}`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}

        <div className="flex items-center gap-1">
          {clickable && (
            <ArrowUpRight
              className={`w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity ${theme.arrowColor}`}
            />
          )}
        </div>
      </div>

      {/* Middle: Large bold number + supporting label */}
      <div className="space-y-0.5">
        <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white font-mono leading-none">
          {isLoading ? (
            <div className="h-8 w-16 bg-slate-200/70 dark:bg-zinc-800 rounded-lg animate-pulse" />
          ) : (
            value ?? '—'
          )}
        </div>
        <div className="text-xs sm:text-[13px] font-bold text-slate-700 dark:text-zinc-300 tracking-tight">
          {title}
        </div>
      </div>

      {/* Bottom: Subtle status indicator with colored dot */}
      {(statusText || trendLabel || subtext) && (
        <div className="mt-3 pt-2.5 border-t border-slate-200/50 dark:border-white/5 flex items-center gap-1.5 text-[11px] font-medium">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${theme.dotColor} animate-pulse`} />
          <span className={`truncate ${theme.statusTextColor}`}>
            {statusText || trendLabel || subtext}
          </span>
        </div>
      )}
    </div>
  );
}
