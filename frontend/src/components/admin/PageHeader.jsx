import React from 'react';

/**
 * Slim PageHeader — kicker + title + actions only. No long description.
 */
export default function PageHeader({ kicker, title, actions, badge, icon: Icon }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <div className="w-9 h-9 rounded-xl bg-[#EAF5F0] dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
            <Icon className="w-4.5 h-4.5 text-[#006B4F] dark:text-emerald-400" />
          </div>
        )}
        <div className="min-w-0">
          {kicker && (
            <p className="text-[10px] font-bold tracking-widest uppercase text-[#006B4F] dark:text-emerald-400 mb-0.5">
              {kicker}
            </p>
          )}
          <h1 className="text-lg sm:text-xl font-black text-[#1F2937] dark:text-white tracking-tight leading-tight flex items-center gap-2 flex-wrap">
            {title}
            {badge && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF5F0] dark:bg-emerald-950/40 text-[#006B4F] dark:text-emerald-400 border border-[#006B4F]/20">
                {badge}
              </span>
            )}
          </h1>
        </div>
      </div>

      {actions && (
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
