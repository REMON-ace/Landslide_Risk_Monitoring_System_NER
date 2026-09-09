import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, ShieldAlert, FileText } from 'lucide-react';

export default function CtaSection() {
  const { t } = useTranslation();
  const { isAuthenticated, isOfficial } = useAuth();

  return (
    <section
      id="cta"
      className="relative py-28 bg-[#003322] text-white overflow-hidden text-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 40, 28, 0.88), rgba(0, 26, 18, 0.94)), url('/images/meghalaya_hero_mountain.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Decorative subtle radial glow */}
      <div className="absolute inset-0 bg-radial from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        <div className="space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            {t('landing.cta.heading', {
              defaultValue: 'Know the Risk. Act Before It Becomes a Disaster.',
            })}
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-emerald-100/90 max-w-2xl mx-auto leading-relaxed">
            {t('landing.cta.subtitle', {
              defaultValue:
                'Stay informed, report hazards and help build safer communities across East Khasi Hills.',
            })}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          {/* Primary Action: Emergency Red Button */}
          <Link
            to={isAuthenticated ? (isOfficial ? '/map' : '/citizen/map') : '/login'}
            className="inline-flex items-center gap-2.5 px-7 py-4 rounded-xl bg-[#E63946] hover:bg-[#C92A37] text-white font-bold text-sm sm:text-base shadow-xl shadow-red-950/40 hover:shadow-red-700/50 transition-all duration-200 active:scale-[0.98] group cursor-pointer"
          >
            <ShieldAlert className="w-5 h-5" />
            <span>{t('landing.cta.btn_risk', { defaultValue: 'Check Live Risk' })}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Secondary Action: Dark / Transparent Style with White Border */}
          <Link
            to={isAuthenticated ? (isOfficial ? '/report' : '/citizen/reports') : '/login'}
            className="inline-flex items-center gap-2.5 px-7 py-4 rounded-xl bg-black/40 hover:bg-black/60 text-white font-bold text-sm sm:text-base backdrop-blur-md border border-white/40 hover:border-white/70 transition-all duration-200 active:scale-[0.98] cursor-pointer group"
          >
            <FileText className="w-5 h-5 text-emerald-300" />
            <span>{t('landing.cta.btn_report', { defaultValue: 'Report an Incident' })}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
