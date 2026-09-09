import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Activity, Bell, FileText, ArrowRight } from 'lucide-react';

export default function FeaturesSection() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Activity,
      title: t('landing.features.card1_title', { defaultValue: 'Real-Time Risk Monitoring' }),
      description: t('landing.features.card1_desc', {
        defaultValue:
          'Monitor rainfall, terrain and geospatial data to identify landslide-prone areas in real time.',
      }),
      linkText: t('landing.features.card1_link', { defaultValue: 'View Risk Map' }),
      to: '/map',
      iconBg: 'bg-emerald-50 text-[#006B4F]',
    },
    {
      icon: Bell,
      title: t('landing.features.card2_title', { defaultValue: 'Community Alerts' }),
      description: t('landing.features.card2_desc', {
        defaultValue:
          'Receive timely alerts and safety information via SMS, mobile app and public channels.',
      }),
      linkText: t('landing.features.card2_link', { defaultValue: 'View Alerts' }),
      to: '/alerts',
      iconBg: 'bg-amber-50 text-amber-700',
    },
    {
      icon: FileText,
      title: t('landing.features.card3_title', { defaultValue: 'Field Incident Reporting' }),
      description: t('landing.features.card3_desc', {
        defaultValue:
          'Enable citizens and field officials to report landslides, road blockages and other hazards from the field.',
      }),
      linkText: t('landing.features.card3_link', { defaultValue: 'Submit a Report' }),
      to: '/report',
      iconBg: 'bg-teal-50 text-teal-700',
    },
  ];

  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#006B4F]">
            {t('landing.features.kicker', { defaultValue: 'OUR FEATURES' })}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {t('landing.features.heading', {
              defaultValue: 'Everything you need to understand and respond to landslide risk.',
            })}
          </h2>
        </div>

        {/* 3 Horizontal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="group relative bg-white border border-[#D9E2DE] hover:border-[#006B4F]/40 rounded-2xl p-8 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-5">
                  {/* Soft circular icon background */}
                  <div
                    className={`w-14 h-14 rounded-2xl ${card.iconBg} flex items-center justify-center shadow-xs transition-transform duration-300 group-hover:scale-110`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-[#006B4F] transition-colors">
                    {card.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100">
                  <Link
                    to={card.to}
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#006B4F] hover:text-[#00523C] group/link"
                  >
                    <span>{card.linkText}</span>
                    <ArrowRight className="w-4 h-4 transform group-hover/link:translate-x-1.5 transition-transform duration-200" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
