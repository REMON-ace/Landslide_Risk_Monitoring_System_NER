import React from 'react';

/**
 * Standardized Section Card Panel inspired by AppDashboard (.dashboard-panel)
 */
export default function SectionCard({
  kicker,
  title,
  subtitle,
  actions,
  children,
  className = '',
  bodyClassName = 'p-5',
  noPadding = false,
  badge,
}) {
  return (
    <section className={`bg-white dark:bg-[#0D0E10] border border-[#D9E2DE] dark:border-[#27272A] rounded-xl shadow-sm overflow-hidden ${className}`}>
      {(title || kicker || actions) && (
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#D9E2DE] dark:border-[#1E1E24] flex-wrap gap-2">
          <div>
            {kicker && (
              <span className="block text-[10px] font-bold tracking-wider uppercase text-[#006B4F] dark:text-emerald-400 mb-0.5">
                {kicker}
              </span>
            )}
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-[#1F2937] dark:text-white">
                {title}
              </h2>
              {badge && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF5F0] dark:bg-emerald-950/40 text-[#006B4F] dark:text-emerald-400 border border-[#006B4F]/20">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>

          {actions && (
            <div className="flex items-center gap-2 shrink-0">
              {actions}
            </div>
          )}
        </div>
      )}

      <div className={noPadding ? '' : bodyClassName}>
        {children}
      </div>
    </section>
  );
}
