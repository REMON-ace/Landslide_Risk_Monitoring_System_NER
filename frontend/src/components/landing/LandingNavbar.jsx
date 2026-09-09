import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { SUPPORTED_LANGUAGES } from '../../i18n/index';
import {
  Globe,
  ChevronDown,
  Menu,
  X,
  LogIn,
  Check,
  LayoutDashboard,
} from 'lucide-react';

export default function LandingNavbar() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  const langRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Track active section for navbar underline
      const sections = ['hero', 'features', 'how-it-works', 'risk-view', 'stats', 'mission', 'cta'];
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 160 && rect.bottom >= 160) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close language dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang =
    SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language) || SUPPORTED_LANGUAGES[0];

  const scrollToSection = (sectionId) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinks = [
    { label: t('landing.nav.home', { defaultValue: 'Home' }), id: 'hero', type: 'scroll' },
    { label: t('landing.nav.about', { defaultValue: 'About' }), id: 'mission', type: 'scroll' },
    { label: t('landing.nav.live_risk_map', { defaultValue: 'Live Risk Map' }), id: 'risk-view', type: 'scroll' },
    { label: t('landing.nav.alerts', { defaultValue: 'Alerts' }), to: '/alerts', type: 'route' },
    { label: t('landing.nav.field_reports', { defaultValue: 'Field Reports' }), to: '/report', type: 'route' },
    { label: t('landing.nav.resources', { defaultValue: 'Resources' }), id: 'features', type: 'scroll' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-[#D9E2DE]/70 py-2.5'
          : 'bg-white/80 backdrop-blur-xs border-b border-white/20 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* ── LEFT: Logo & Brand ────────────────────────────── */}
          <button
            onClick={() => scrollToSection('hero')}
            className="flex items-center gap-3 group text-left cursor-pointer focus:outline-none"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white border border-emerald-600/25 shadow-xs flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-200 p-0.5">
              <img
                src="/logo.png"
                alt="NER Landslide Alert Logo"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div>
              <div className="font-extrabold text-base sm:text-lg tracking-tight text-[#006B4F] leading-tight">
                {t('landing.nav.brand_title', { defaultValue: 'NER Landslide Alert' })}
              </div>
              <div className="text-[11px] text-slate-500 font-medium leading-tight">
                {t('landing.nav.brand_subtitle', { defaultValue: 'East Khasi Hills • Early Warning Platform' })}
              </div>
            </div>
          </button>

          {/* ── CENTER: Navigation Links (Desktop) ─────────────── */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((item, idx) => {
              const isActive = item.type === 'scroll' && activeSection === item.id;
              if (item.type === 'route') {
                return (
                  <Link
                    key={idx}
                    to={item.to}
                    className="relative px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-[#006B4F] transition-colors rounded-lg hover:bg-slate-50"
                  >
                    {item.label}
                  </Link>
                );
              }
              return (
                <button
                  key={idx}
                  onClick={() => scrollToSection(item.id)}
                  className={`relative px-3.5 py-1.5 text-xs font-semibold transition-all rounded-lg cursor-pointer ${
                    isActive
                      ? 'text-[#006B4F] font-bold'
                      : 'text-slate-700 hover:text-[#006B4F] hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-3.5 right-3.5 h-[2.5px] bg-[#006B4F] rounded-full animate-fade-in" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* ── RIGHT: Language Selector & Login/Dashboard Button ─ */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Language Dropdown */}
            <div ref={langRef} className="relative">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D9E2DE] bg-white/90 text-xs font-semibold text-slate-700 hover:text-[#006B4F] hover:border-[#006B4F]/40 shadow-2xs transition-all cursor-pointer"
                title="Change language"
              >
                <Globe className="w-3.5 h-3.5 text-[#006B4F]" />
                <span>{currentLang.nativeName}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-60 bg-white border border-[#D9E2DE] rounded-xl shadow-xl overflow-hidden z-50 animate-fade-in">
                  <div className="p-2.5 bg-[#F5F7F6] border-b border-[#D9E2DE]">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#006B4F]">
                      Regional Languages
                    </p>
                  </div>
                  <div className="max-h-64 overflow-y-auto py-1 divide-y divide-slate-100">
                    {SUPPORTED_LANGUAGES.map((lang) => {
                      const isSelected = i18n.language === lang.code;
                      return (
                        <button
                          key={lang.code}
                          onClick={() => {
                            i18n.changeLanguage(lang.code);
                            setLangDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#EAF5F0] text-[#006B4F] font-bold'
                              : 'text-slate-700 hover:bg-[#F5F7F6]'
                          }`}
                        >
                          <div className="flex flex-col text-left">
                            <span>{lang.nativeName}</span>
                            <span className="text-[10px] text-slate-400">{lang.regionLabel}</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#006B4F]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Dark Green Login / Dashboard Button */}
            <Link
              to={isAuthenticated ? '/dashboard' : '/login'}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#006B4F] hover:bg-[#00523C] text-white font-bold text-xs shadow-sm transition-all duration-200 active:scale-[0.98] cursor-pointer"
            >
              {isAuthenticated ? (
                <>
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>{t('landing.nav.login_dashboard', { defaultValue: 'Login / Dashboard' })}</span>
                </>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{t('landing.nav.login_dashboard', { defaultValue: 'Login / Dashboard' })}</span>
                </>
              )}
            </Link>
          </div>

          {/* ── Mobile Hamburger Button ───────────────────────── */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Dropdown Navigation Drawer ─────────────────── */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-b border-[#D9E2DE] px-4 pt-3 pb-5 space-y-3 shadow-lg animate-fade-in">
          <div className="flex flex-col space-y-1">
            {navLinks.map((item, idx) => {
              if (item.type === 'route') {
                return (
                  <Link
                    key={idx}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-[#006B4F] rounded-lg hover:bg-slate-50"
                  >
                    {item.label}
                  </Link>
                );
              }
              return (
                <button
                  key={idx}
                  onClick={() => scrollToSection(item.id)}
                  className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-[#006B4F] rounded-lg hover:bg-slate-50 text-left"
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#D9E2DE] flex flex-col gap-2.5">
            {/* Language Selector for mobile */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Language:</span>
              <select
                value={i18n.language}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                className="px-2.5 py-1 text-xs border border-[#D9E2DE] rounded-lg bg-white text-slate-700 font-medium"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.nativeName} ({lang.code.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {/* Login / Dashboard Button for mobile */}
            <Link
              to={isAuthenticated ? '/dashboard' : '/login'}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-lg bg-[#006B4F] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{t('landing.nav.login_dashboard', { defaultValue: 'Login / Dashboard' })}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
