import React from 'react';

/**
 * Standardized AppDashboard-style Data Table Container
 */
export default function DataTable({
  headers = [],
  children,
  emptyMessage = 'No records found',
  isEmpty = false,
  className = '',
}) {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="w-full text-left border-collapse text-xs">
        {headers.length > 0 && (
          <thead>
            <tr className="border-b border-[#D9E2DE] dark:border-[#27272A] bg-[#F5F7F6]/50 dark:bg-[#121215]/50">
              {headers.map((h, i) => (
                <th
                  key={i}
                  className={`py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 ${
                    h.align === 'right' ? 'text-right' : h.align === 'center' ? 'text-center' : 'text-left'
                  } ${h.className || ''}`}
                >
                  {h.label || h}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-[#D9E2DE]/70 dark:divide-[#27272A]/70">
          {isEmpty ? (
            <tr>
              <td
                colSpan={headers.length || 1}
                className="py-10 text-center text-xs text-slate-400 dark:text-zinc-500 font-medium"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}
