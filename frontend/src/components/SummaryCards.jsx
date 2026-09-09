import React from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, AlertTriangle, Route, Bell, FileText, ChevronRight } from 'lucide-react';

export default function SummaryCards({ summary, isLoading, onCardClick }) {
  const { t } = useTranslation();

  const cards = [
    {
      id: 'total_zones',
      title: t('summary.monitored_zones'),
      value: summary?.total_zones_monitored ?? 46,
      subtext: t('summary.subtext_zones'),
      icon: Activity,
      iconBg: 'bg-[#EAF5F0] text-[#006B4F] dark:bg-emerald-950/40 dark:text-emerald-400 border-[#006B4F]/20',
      borderGlow: 'hover:border-[#006B4F]/50',
    },
    {
      id: 'high_risk',
      title: t('summary.high_risk'),
      value: summary?.high_risk_zones ?? 5,
      subtext: t('summary.subtext_high_risk'),
      icon: AlertTriangle,
      iconBg: 'bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400 border-orange-200',
      borderGlow: 'hover:border-orange-400',
      highlight: true,
    },
    {
      id: 'roads_blocked',
      title: t('summary.roads_blocked'),
      value: summary?.roads_blocked ?? 2,
      subtext: t('summary.subtext_roads'),
      icon: Route,
      iconBg: 'bg-red-50 text-[#E63946] dark:bg-red-950/40 dark:text-red-400 border-red-200',
      borderGlow: 'hover:border-[#E63946]/50',
    },
    {
      id: 'active_alerts',
      title: t('summary.active_alerts'),
      value: summary?.active_alerts ?? 3,
      subtext: t('summary.subtext_alerts'),
      icon: Bell,
      iconBg: 'bg-[#EAF5F0] text-[#006B4F] dark:bg-emerald-950/40 dark:text-emerald-400 border-[#006B4F]/20',
      borderGlow: 'hover:border-[#006B4F]/50',
    },
    {
      id: 'reports_24h',
      title: t('summary.reports_24h'),
      value: summary?.reports_last_24h ?? 11,
      subtext: t('summary.subtext_reports'),
      icon: FileText,
      iconBg: 'bg-[#EAF5F0] text-[#006B4F] dark:bg-emerald-950/40 dark:text-emerald-400 border-[#006B4F]/20',
      borderGlow: 'hover:border-[#006B4F]/50',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            role="button"
            tabIndex={0}
            onClick={() => onCardClick?.(card.id, card.title, card.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCardClick?.(card.id, card.title, card.value); } }}
            className={`group p-4 rounded-xl transition-all duration-200 bg-white dark:bg-zinc-950 border border-[#D9E2DE] dark:border-zinc-800 ${card.borderGlow} shadow-sm flex flex-col justify-between cursor-pointer select-none hover:shadow-lg hover:scale-[1.03] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#006B4F]/40 focus-visible:outline-none`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#006B4F] dark:text-emerald-400 line-clamp-1">
                {card.title}
              </span>
              <div className={`p-2 rounded-lg border ${card.iconBg} transition-transform duration-200 group-hover:scale-110`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-1">
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1F2937] dark:text-white font-mono">
                {isLoading ? (
                  <div className="h-8 w-14 bg-slate-200 dark:bg-zinc-800 rounded animate-pulse" />
                ) : (
                  card.value
                )}
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                  {card.subtext}
                </p>
                <span className="flex items-center gap-0.5 text-[10px] font-semibold text-slate-400 dark:text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap ml-1">
                  Details
                  <ChevronRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
