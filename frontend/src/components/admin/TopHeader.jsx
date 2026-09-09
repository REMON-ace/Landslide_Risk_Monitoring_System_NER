import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import { SUPPORTED_LANGUAGES } from '../../i18n/index';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  Globe,
  Wifi,
  WifiOff,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Database,
  Radio,
  MapPin,
  ExternalLink,
} from 'lucide-react';

export default function TopHeader({
  onToggleSidebar,
  isSidebarCollapsed,
  alerts = [],
  zones = [],
  onOpenProfile,
  onOpenSettings,
}) {
  const { t, i18n } = useTranslation();
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { isOnline } = useOfflineSync();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const userMenuRef = useRef(null);
  const langRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute clean breadcrumbs from pathname
  const getBreadcrumb = () => {
    switch (location.pathname) {
      case '/':
        return { section: 'Command Center', current: 'Dashboard' };
      case '/map':
        return { section: 'Command Center', current: 'Risk Map' };
      case '/predict':
        return { section: 'Decision Support', current: 'Risk Predictor' };
      case '/report':
        return { section: 'Field Operations', current: 'Field Reports' };
      case '/alerts':
        return { section: 'Public Directives', current: 'Emergency Alerts' };
      default:
        return { section: 'Command Center', current: 'Overview' };
    }
  };

  const breadcrumb = getBreadcrumb();
  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language) || SUPPORTED_LANGUAGES[0];

  // Client-side quick filter on loaded zones for the search input
  const searchResults = searchQuery.trim()
    ? zones.filter(
        (z) =>
          z.village_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          z.zone_id?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <header className="sticky top-0 z-30 w-full h-16 bg-white dark:bg-[#0D0E10] border-b border-[#D9E2DE] dark:border-[#27272A] shadow-xs flex items-center justify-between px-4 sm:px-6 transition-colors">
      {/* ── Left: Sidebar Toggle & Breadcrumbs ───────────────────────── */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#141418] transition-colors"
          title="Toggle navigation"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400">
            <span>{breadcrumb.section}</span>
            <span>/</span>
            <strong className="text-slate-800 dark:text-zinc-200 font-semibold">{breadcrumb.current}</strong>
          </div>
        </div>
      </div>

      {/* ── Center: Search Bar (filtering loaded dataset) ───────────── */}
      <div ref={searchRef} className="relative hidden md:block w-72 lg:w-96">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 dark:text-zinc-500 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Search zones, villages, IDs..."
            className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-[#F5F7F6] dark:bg-[#141418] border border-[#D9E2DE] dark:border-[#27272A] text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-[#006B4F] focus:ring-1 focus:ring-[#006B4F] transition-all"
          />
        </div>

        {/* Quick Search Dropdown */}
        {isSearchOpen && searchQuery.trim() && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-[#0D0E10] border border-[#D9E2DE] dark:border-[#27272A] rounded-xl shadow-xl overflow-hidden z-50">
            <div className="p-2 border-b border-[#D9E2DE] dark:border-[#1E1E24] bg-[#F5F7F6]/50 dark:bg-[#121215]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Monitored Zones ({searchResults.length})
              </span>
            </div>

            {searchResults.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 dark:text-zinc-500">
                No matching zones found
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto divide-y divide-[#D9E2DE]/50 dark:divide-[#27272A]/50">
                {searchResults.map((z) => (
                  <button
                    key={z.zone_id}
                    onClick={() => {
                      navigate('/map');
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-left p-2.5 hover:bg-[#F5F7F6] dark:hover:bg-[#141418] flex items-center justify-between transition-colors"
                  >
                    <div>
                      <span className="font-bold text-xs text-[#1F2937] dark:text-white block">
                        {z.village_name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {z.zone_id} • Score: {z.risk_score}
                      </span>
                    </div>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#EAF5F0] text-[#006B4F] dark:bg-emerald-950/40 dark:text-emerald-400">
                      {z.severity}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Right Controls ────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Backend Connectivity Status */}
        <div
          className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#EAF5F0] dark:bg-emerald-950/30 text-[#006B4F] dark:text-emerald-400 border border-[#006B4F]/20"
          title="Connected to GIS Database"
        >
          <Database className="w-3.5 h-3.5" />
          <span>Connected to GIS Database</span>
        </div>

        {/* Telemetry Status (Online/Offline) */}
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium border ${
            isOnline
              ? 'bg-slate-50 text-slate-700 dark:bg-[#141418] dark:text-zinc-300 border-[#D9E2DE] dark:border-[#27272A]'
              : 'bg-red-50 text-[#E63946] dark:bg-red-950/40 dark:text-red-400 border-red-200'
          }`}
          title={isOnline ? 'Network telemetry online' : 'Offline mode active'}
        >
          {isOnline ? <Wifi className="w-3.5 h-3.5 text-[#006B4F]" /> : <WifiOff className="w-3.5 h-3.5 text-[#E63946]" />}
          <span className="hidden lg:inline">{isOnline ? 'Online' : 'Offline'}</span>
        </div>

        {/* Language Selector */}
        <div ref={langRef} className="relative">
          <button
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center gap-1.5 p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#141418] transition-colors"
            title="Select Language"
            aria-label="Select Language"
          >
            <Globe className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
            <span className="hidden sm:inline text-xs font-medium max-w-[64px] truncate">
              {currentLang.nativeName}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isLangOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-60 bg-white dark:bg-[#0D0E10] border border-[#D9E2DE] dark:border-[#27272A] rounded-xl shadow-xl overflow-hidden z-50">
              <div className="p-2.5 bg-[#F5F7F6] dark:bg-[#121215] border-b border-[#D9E2DE] dark:border-[#1E1E24]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#006B4F] dark:text-emerald-400">
                  Regional Languages
                </p>
              </div>
              <div className="max-h-60 overflow-y-auto py-1">
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const isSelected = i18n.language === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => {
                        i18n.changeLanguage(lang.code);
                        setIsLangOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors ${
                        isSelected
                          ? 'bg-[#EAF5F0] text-[#006B4F] dark:bg-emerald-950/40 dark:text-emerald-400 font-bold'
                          : 'text-slate-700 dark:text-zinc-300 hover:bg-[#F5F7F6] dark:hover:bg-[#141418]'
                      }`}
                    >
                      <div className="flex flex-col items-start">
                        <span>{lang.nativeName}</span>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500">{lang.regionLabel}</span>
                      </div>
                      <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500">
                        {lang.code.toUpperCase()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#141418] transition-colors"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Color Theme"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Notifications Dropdown */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#141418] transition-colors"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {alerts.length > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-[#E63946] text-white text-[9px] font-bold">
                {alerts.length}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-80 sm:w-96 bg-white dark:bg-[#0D0E10] border border-[#D9E2DE] dark:border-[#27272A] rounded-xl shadow-xl overflow-hidden z-50">
              <div className="flex items-center justify-between p-3.5 border-b border-[#D9E2DE] dark:border-[#1E1E24] bg-[#F5F7F6]/50 dark:bg-[#121215]">
                <div>
                  <h3 className="font-bold text-xs text-slate-800 dark:text-white">Active Directives</h3>
                  <p className="text-[10px] text-slate-500">{alerts.length} warning notices issued</p>
                </div>
                <Link
                  to="/alerts"
                  onClick={() => setIsNotifOpen(false)}
                  className="text-[11px] font-bold text-[#006B4F] dark:text-emerald-400 hover:underline"
                >
                  View all
                </Link>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-[#D9E2DE]/60 dark:divide-[#27272A]/60">
                {alerts.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 dark:text-zinc-500">
                    No active emergency alerts at this time.
                  </div>
                ) : (
                  alerts.slice(0, 4).map((alert) => (
                    <div key={alert.alert_id} className="p-3 hover:bg-[#F5F7F6] dark:hover:bg-[#141418] transition-colors space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-slate-700 dark:text-zinc-300">
                          {alert.alert_id}
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded uppercase bg-red-100 dark:bg-red-950/50 text-[#E63946]">
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-800 dark:text-zinc-200 line-clamp-2">
                        {alert.message}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                        <span>Sector: {alert.village || alert.zone_id}</span>
                        <span>{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-[#D9E2DE] dark:border-[#1E1E24] text-center bg-[#F8FAF9] dark:bg-[#121215]">
                <Link
                  to="/alerts"
                  onClick={() => setIsNotifOpen(false)}
                  className="text-xs font-semibold text-[#006B4F] dark:text-emerald-400 hover:underline"
                >
                  Go to Emergency Directives Portal
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ── User Profile Pill / Menu ────────────────────────────── */}
        <div ref={userMenuRef} className="relative pl-1">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#141418] transition-colors"
            aria-label="User profile menu"
          >
            <div className="w-8 h-8 rounded-full bg-[#006B4F] text-white font-bold flex items-center justify-center text-xs shadow-xs">
              {user?.district ? user.district[0] : 'S'}
            </div>
            <div className="hidden lg:flex flex-col text-left min-w-0">
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-100 leading-tight truncate">
                {user?.district || 'Official Shillong'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 capitalize leading-tight truncate">
                {user?.role ? user.role.replace('_', ' ') : 'District Admin'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-56 bg-white dark:bg-[#0D0E10] border border-[#D9E2DE] dark:border-[#27272A] rounded-xl shadow-xl overflow-hidden z-50 py-1">
              <div className="px-3.5 py-2.5 border-b border-[#D9E2DE] dark:border-[#1E1E24]">
                <p className="text-xs font-bold text-slate-800 dark:text-zinc-100">
                  {user?.district || 'Official Shillong'}
                </p>
                <p className="text-[10px] text-slate-500 capitalize">
                  {user?.role ? user.role.replace('_', ' ') : 'District Admin'}
                </p>
              </div>

              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  if (onOpenProfile) onOpenProfile();
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 dark:text-zinc-300 hover:bg-[#F5F7F6] dark:hover:bg-[#141418]"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>My Profile</span>
              </button>

              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  if (onOpenSettings) onOpenSettings();
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 dark:text-zinc-300 hover:bg-[#F5F7F6] dark:hover:bg-[#141418]"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Portal Settings</span>
              </button>

              <div className="my-1 border-t border-[#D9E2DE] dark:border-[#1E1E24]" />

              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#E63946] hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
