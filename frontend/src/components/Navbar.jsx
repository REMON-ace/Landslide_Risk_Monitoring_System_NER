import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { SUPPORTED_LANGUAGES } from '../i18n/index';
import {
  ShieldAlert,
  Map,
  FileText,
  Bell,
  Cpu,
  Sun,
  Moon,
  Globe,
  Wifi,
  WifiOff,
  LogIn,
  LogOut,
  Layers,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { toggleTheme, isDark } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const { isOnline, pendingCount } = useOfflineSync();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const isMock = import.meta.env.VITE_USE_MOCKS !== 'false';

  const navItems = [
    { path: '/', label: t('nav.dashboard'), icon: Layers },
    { path: '/map', label: t('nav.map'), icon: Map },
    { path: '/report', label: t('nav.report'), icon: FileText, badge: pendingCount > 0 ? pendingCount : null },
    { path: '/alerts', label: t('nav.alerts'), icon: Bell },
    { path: '/predict', label: t('nav.predictor'), icon: Cpu },
  ];

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language) || SUPPORTED_LANGUAGES[0];

  const handleLangSelect = (code) => {
    i18n.changeLanguage(code);
    setLangOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full shadow-sm">
      {/* 1. White Institutional Header */}
      <div className="w-full bg-white dark:bg-black border-b border-[#D9E2DE] dark:border-zinc-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-3">

            {/* Emblem & Platform Title */}
            <Link to="/" className="flex items-center gap-3 sm:gap-3.5 group shrink-0">
              <div className="relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white border border-emerald-600/30 dark:border-emerald-700/50 shadow-sm overflow-hidden p-0.5">
                <img
                  src="/logo.png"
                  alt="NER Landslide Early Warning"
                  className="w-full h-full object-contain rounded-full group-hover:scale-105 transition-transform"
                />
                <span className="absolute w-2 h-2 rounded-full bg-[#E63946] top-1 right-1 animate-ping opacity-75"></span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#006B4F] dark:text-emerald-400">
                    {t('nav.layers_label', { defaultValue: 'NER Landslide Early Warning' })}
                  </span>
                  <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#EAF5F0] text-[#006B4F] dark:bg-emerald-950/40 dark:text-emerald-400 border border-[#006B4F]/20">
                    {t('common.pwa_badge', { defaultValue: 'PWA' })}
                  </span>
                  {isMock && (
                    <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                      {t('common.mock_badge', { defaultValue: 'MOCK' })}
                    </span>
                  )}
                </div>
                <p className="text-[11px] sm:text-xs text-slate-600 dark:text-zinc-400 font-medium leading-tight">
                  {t('common.early_warning', { defaultValue: 'National Disaster Management • North Eastern Region • Meghalaya' })}
                </p>
              </div>
            </Link>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              {/* Online/Offline telemetry indicator */}
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                  isOnline
                    ? 'bg-[#EAF5F0] text-[#006B4F] dark:bg-emerald-950/40 dark:text-emerald-400 border-[#006B4F]/20'
                    : 'bg-red-50 text-[#E63946] dark:bg-red-950/40 dark:text-red-400 border-red-200 animate-pulse'
                }`}
              >
                {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isOnline ? t('nav.online') : t('nav.offline')}</span>
              </div>

              {/* Regional Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-[#D9E2DE] dark:border-zinc-800 text-xs font-medium text-[#1F2937] dark:text-zinc-200 hover:border-[#006B4F] transition-all"
                  aria-label="Select Language"
                >
                  <Globe className="w-3.5 h-3.5 text-[#006B4F] dark:text-zinc-400" />
                  <span className="max-w-[80px] truncate">{currentLang.nativeName}</span>
                  <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
                </button>

                {langOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setLangOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-1.5 z-40 w-64 bg-white dark:bg-zinc-950 border border-[#D9E2DE] dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden">
                      <div className="p-2.5 bg-slate-50 dark:bg-zinc-900 border-b border-[#D9E2DE] dark:border-zinc-800">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#006B4F] dark:text-zinc-400">
                          Regional Languages
                        </p>
                      </div>

                      <div className="max-h-72 overflow-y-auto py-1">
                        {SUPPORTED_LANGUAGES.map((lang) => {
                          const isSelected = i18n.language === lang.code;
                          return (
                            <button
                              key={lang.code}
                              onClick={() => handleLangSelect(lang.code)}
                              className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors ${
                                isSelected
                                  ? 'bg-[#EAF5F0] text-[#006B4F] dark:bg-emerald-950/40 dark:text-emerald-400 font-bold'
                                  : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900'
                              }`}
                            >
                              <div className="flex flex-col items-start gap-0.5">
                                <span className="font-semibold">{lang.nativeName}</span>
                                <span className="text-[10px] text-slate-500 dark:text-zinc-500">
                                  {lang.regionLabel}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                                  {lang.code}
                                </span>
                                {isSelected && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#006B4F]"></span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:text-[#006B4F] dark:hover:text-emerald-400 border border-[#D9E2DE] dark:border-zinc-800 transition-colors"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label="Toggle Color Theme"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
              </button>

              {/* Auth Controls */}
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <div className="hidden md:flex flex-col text-right">
                    <span className="text-xs font-bold text-[#1F2937] dark:text-zinc-200">
                      {user?.district || t('common.district_admin')}
                    </span>
                    <span className="text-[10px] text-[#006B4F] dark:text-emerald-400 font-semibold capitalize">
                      {user?.role ? user.role.replace('_', ' ') : t('common.official')}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 rounded-lg bg-red-50 text-[#E63946] dark:bg-red-950/30 dark:text-red-400 hover:bg-red-100 border border-red-200 dark:border-red-900/40 transition-colors"
                    title={t('nav.logout')}
                    aria-label={t('nav.logout')}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#006B4F] hover:bg-[#00523c] text-white shadow-sm transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{t('nav.login')}</span>
                </Link>
              )}

              {/* Mobile hamburger toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900"
                aria-label="Open menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Thin Red Horizontal Line Separator */}
      <div className="h-[3px] bg-[#E63946] w-full" />

      {/* 3. Deep Green Navigation Bar (#006B4F) */}
      <div className="w-full bg-[#006B4F] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="hidden lg:flex items-center justify-between h-11">
            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs transition-all ${
                      isActive
                        ? 'bg-white text-[#006B4F] font-bold shadow-sm'
                        : 'text-white/90 hover:bg-[#008060] hover:text-white font-medium'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#006B4F]' : 'text-white/80'}`} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-[#E63946] text-white' : 'bg-white text-[#006B4F]'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="text-[11px] font-medium text-emerald-100/80 flex items-center gap-2">
              <span>{t('dashboard.pilot_district', { defaultValue: 'District Emergency Ops: Active' })}</span>
            </div>
          </div>

          {/* Mobile Navigation Drawer */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-3 border-t border-white/10 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm ${
                      isActive
                        ? 'bg-white text-[#006B4F] font-bold shadow-sm'
                        : 'text-white/90 hover:bg-[#008060] font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#006B4F]' : 'text-white'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#E63946] text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
