import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function LandingFooter() {
  const { t } = useTranslation();

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-white border-t border-[#D9E2DE] text-slate-700 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* ── LEFT: Logo & Attribution (2 cols) ───────────────── */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-white border border-emerald-600/30 shadow-2xs flex items-center justify-center overflow-hidden shrink-0 p-0.5">
                <img src="/logo.png" alt="NER Landslide Alert" className="w-full h-full object-contain rounded-full" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#006B4F] tracking-tight">
                  {t('landing.footer.brand_title', { defaultValue: 'NER Landslide Alert' })}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {t('landing.footer.dept', {
                    defaultValue: 'East Khasi Hills • Meghalaya State Disaster Management',
                  })}
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-600 font-medium max-w-sm pt-1">
              {t('landing.footer.tagline', {
                defaultValue: 'Together for a Safer, Stronger Northeast.',
              })}
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF5F0] border border-[#006B4F]/20 text-[11px] font-bold text-[#006B4F]">
              <span>Government of Meghalaya • SDMA Initiative</span>
            </div>
          </div>

          {/* ── QUICK LINKS (1 col) ─────────────────────────────── */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              {t('landing.footer.heading_quick_links', { defaultValue: 'QUICK LINKS' })}
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <button
                  onClick={() => scrollToSection('hero')}
                  className="text-slate-600 hover:text-[#006B4F] transition-colors cursor-pointer"
                >
                  {t('landing.footer.link_home', { defaultValue: 'Home' })}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('features')}
                  className="text-slate-600 hover:text-[#006B4F] transition-colors cursor-pointer"
                >
                  {t('landing.footer.link_platform', { defaultValue: 'Platform' })}
                </button>
              </li>
              <li>
                <Link
                  to="/map"
                  className="text-slate-600 hover:text-[#006B4F] transition-colors"
                >
                  {t('landing.footer.link_risk_map', { defaultValue: 'Risk Map' })}
                </Link>
              </li>
              <li>
                <Link
                  to="/alerts"
                  className="text-slate-600 hover:text-[#006B4F] transition-colors"
                >
                  {t('landing.footer.link_alerts', { defaultValue: 'Alerts' })}
                </Link>
              </li>
              <li>
                <Link
                  to="/report"
                  className="text-slate-600 hover:text-[#006B4F] transition-colors"
                >
                  {t('landing.footer.link_field_reports', { defaultValue: 'Field Reports' })}
                </Link>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('mission')}
                  className="text-slate-600 hover:text-[#006B4F] transition-colors cursor-pointer"
                >
                  {t('landing.footer.link_about', { defaultValue: 'About' })}
                </button>
              </li>
            </ul>
          </div>

          {/* ── SUPPORT (1 col) ─────────────────────────────────── */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              {t('landing.footer.heading_support', { defaultValue: 'SUPPORT' })}
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <a
                  href="#support"
                  onClick={(e) => { e.preventDefault(); alert('Emergency helpline: 1077 (State Emergency Operations Centre, Shillong)'); }}
                  className="text-slate-600 hover:text-[#006B4F] transition-colors cursor-pointer"
                >
                  {t('landing.footer.link_emergency_info', { defaultValue: 'Emergency Information' })}
                </a>
              </li>
              <li>
                <a
                  href="#safety"
                  onClick={(e) => { e.preventDefault(); scrollToSection('mission'); }}
                  className="text-slate-600 hover:text-[#006B4F] transition-colors cursor-pointer"
                >
                  {t('landing.footer.link_safety_guidelines', { defaultValue: 'Safety Guidelines' })}
                </a>
              </li>
              <li>
                <a
                  href="mailto:support-lews@meghalaya.gov.in"
                  className="text-slate-600 hover:text-[#006B4F] transition-colors"
                >
                  {t('landing.footer.link_contact_us', { defaultValue: 'Contact Us' })}
                </a>
              </li>
            </ul>
          </div>

          {/* ── FOLLOW US (1 col) ───────────────────────────────── */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              {t('landing.footer.heading_follow_us', { defaultValue: 'FOLLOW US' })}
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-600 hover:text-[#006B4F] transition-colors"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-600 hover:text-[#006B4F] transition-colors"
                >
                  Twitter/X
                </a>
              </li>
              <li>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-600 hover:text-[#006B4F] transition-colors"
                >
                  YouTube
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-600 hover:text-[#006B4F] transition-colors"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ── BOTTOM COPYRIGHT ─────────────────────────────────── */}
        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            {t('landing.footer.copyright', {
              defaultValue: '© 2026 NER Landslide Alert. All rights reserved.',
            })}
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Meghalaya State Disaster Management Authority</span>
            <span>•</span>
            <span>East Khasi Hills District Operations</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
