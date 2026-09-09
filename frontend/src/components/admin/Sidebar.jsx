import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Map,
  Cpu,
  FileText,
  Bell,
  Route,
  Home,
  CloudRain,
  Radio,
  ShieldCheck,
  X,
  ChevronRight,
  Activity,
  ChevronLeft,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

export default function Sidebar({
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
  activeAlertCount = 0,
  pendingReportCount = 0,
  onOpenProfile,
  onOpenSettings,
}) {
  const { t } = useTranslation();
  const { } = useAuth(); // Auth context available if needed for future admin-role checks
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavClick = (path, hash) => {
    if (onClose) onClose();
    if (hash) {
      if (location.pathname !== '/') {
        navigate(`/${hash}`);
      } else {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  const rawNavSections = [
    {
      heading: 'Navigation',
      items: [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/map', label: 'Risk Map', icon: Map },
        { path: '/predict', label: 'Risk Predictor', icon: Cpu, isPredictor: true },
        { path: '/report', label: 'Field Reports', icon: FileText, badge: pendingReportCount > 0 ? pendingReportCount : null },
        { path: '/alerts', label: 'Alerts', icon: Bell, badge: activeAlertCount > 0 ? activeAlertCount : null },
      ],
    },
    {
      heading: 'Infrastructure & Sensors',
      items: [
        { path: '/', hash: '#roads-section', label: 'Roads', icon: Route },
        { path: '/', hash: '#priority-zones', label: 'Villages', icon: Home },
        { path: '/', hash: '#weather-sensors', label: 'Weather & Sensors', icon: CloudRain },
      ],
    },
    {
      heading: 'Admin / Management',
      isAdminOnly: true,
      items: [
        { path: '/report', label: 'Reports Management', icon: ShieldCheck },
        { path: '/alerts', label: 'Alert Management', icon: Radio },
        { path: '/', hash: '#risk-distribution', label: 'System Overview', icon: Activity },
      ],
    },
  ];

  // Sidebar is only rendered inside AdminLayout which is admin-only —
  // show all navigation sections without citizen filtering.
  const navSections = rawNavSections;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Main Aside Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white dark:bg-[#0D0E10] border-r border-[#D9E2DE] dark:border-[#27272A] transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-[72px]' : 'w-64'
        } ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } shadow-lg lg:shadow-none`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-[#D9E2DE] dark:border-[#1E1E24] shrink-0">
          <NavLink
            to="/"
            onClick={onClose}
            className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'justify-center w-full' : ''}`}
            title="Landslide Risk Monitoring Portal"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-black border border-[#D9E2DE] dark:border-[#27272A] shrink-0 overflow-hidden shadow-sm">
              <img src="/logo.svg" alt="NER LEWS" className="w-full h-full object-cover" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-xs tracking-tight text-[#006B4F] dark:text-emerald-400 truncate">
                  Landslide Risk Monitoring
                </span>
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium truncate">
                  Disaster Ops Center
                </span>
              </div>
            )}
          </NavLink>

          {/* Close button for Mobile */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links Scrollable Body */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {navSections.map((sec, secIdx) => (
            <div key={secIdx} className="space-y-1">
              {!isCollapsed ? (
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
                  {sec.heading}
                </p>
              ) : (
                <div className="border-t border-[#D9E2DE] dark:border-[#1E1E24] my-2" />
              )}

              {sec.items.map((item, idx) => {
                const Icon = item.icon;
                const isExactActive = !item.hash && location.pathname === item.path;

                return (
                  <NavLink
                    key={idx}
                    to={item.hash ? `${item.path}${item.hash}` : item.path}
                    onClick={() => handleNavClick(item.path, item.hash)}
                    title={isCollapsed ? item.label : undefined}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                      isExactActive
                        ? 'bg-[#006B4F] text-white font-bold shadow-sm'
                        : 'text-slate-700 dark:text-zinc-300 hover:bg-[#F5F7F6] dark:hover:bg-[#141418] hover:text-[#006B4F] dark:hover:text-emerald-400'
                    } ${isCollapsed ? 'justify-center px-2' : ''}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isExactActive
                            ? 'text-white'
                            : 'text-slate-500 dark:text-zinc-400 group-hover:text-[#006B4F] dark:group-hover:text-emerald-400'
                        }`}
                      />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!isCollapsed && item.badge && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isExactActive ? 'bg-white text-[#006B4F]' : 'bg-[#E63946] text-white'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* Minimal Clean Sidebar Footer with Collapse Toggle */}
        <div className="p-3 border-t border-[#D9E2DE] dark:border-[#1E1E24] shrink-0 bg-[#F8FAF9] dark:bg-[#121215] flex items-center justify-between">
          {!isCollapsed ? (
            <>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-[#006B4F] animate-pulse" />
                <span className="font-semibold">GIS Live Node</span>
              </div>
              {onToggleCollapse && (
                <button
                  onClick={onToggleCollapse}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-[#1E1E24] transition-colors"
                  title="Collapse sidebar"
                  aria-label="Collapse sidebar"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
            </>
          ) : (
            onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="w-full py-1.5 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-[#1E1E24] transition-colors"
                title="Expand sidebar"
                aria-label="Expand sidebar"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )
          )}
        </div>
      </aside>
    </>
  );
}
