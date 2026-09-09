import React from 'react';
import { useTranslation } from 'react-i18next';
import { CloudRain, Cpu, Users, ArrowRight, ArrowDown } from 'lucide-react';

export default function HowItWorksSection() {
  const { t } = useTranslation();

  const steps = [
    {
      number: '01',
      icon: CloudRain,
      title: t('landing.how_it_works.step1_title', { defaultValue: '1. Sensors & Rainfall' }),
      description: t('landing.how_it_works.step1_desc', {
        defaultValue: 'Collect real-time data from weather stations, sensors and satellite sources.',
      }),
    },
    {
      number: '02',
      icon: Cpu,
      title: t('landing.how_it_works.step2_title', { defaultValue: '2. AI Risk Engine' }),
      description: t('landing.how_it_works.step2_desc', {
        defaultValue: 'Analyze data using AI/ML to detect landslide risk and generate early warnings.',
      }),
    },
    {
      number: '03',
      icon: Users,
      title: t('landing.how_it_works.step3_title', { defaultValue: '3. Authorities & Communities' }),
      description: t('landing.how_it_works.step3_desc', {
        defaultValue: 'Share alerts with district authorities, field teams and local communities for faster response.',
      }),
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-[#F2F8F5] border-y border-[#E2EEE7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#006B4F]">
            {t('landing.how_it_works.kicker', { defaultValue: 'FROM DATA TO A SAFER TOMORROW' })}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            {t('landing.how_it_works.heading', { defaultValue: 'How It Works' })}
          </h2>
        </div>

        {/* 3 Steps horizontal with animated arrows (collapses into vertical timeline on mobile) */}
        <div className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="relative flex flex-col items-center text-center">
                  {/* Step Card */}
                  <div className="w-full bg-white rounded-2xl p-8 border border-[#D9E2DE] shadow-xs hover:shadow-lg transition-all duration-300 relative group h-full flex flex-col items-center">
                    {/* Step Number Badge */}
                    <div className="absolute top-4 right-4 text-xs font-mono font-bold text-slate-300 group-hover:text-[#006B4F] transition-colors">
                      {step.number}
                    </div>

                    {/* Step Icon */}
                    <div className="w-16 h-16 rounded-2xl bg-[#EAF5F0] border border-[#006B4F]/20 text-[#006B4F] flex items-center justify-center mb-6 shadow-2xs group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-8 h-8" />
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-3">
                      {step.title}
                    </h3>

                    <p className="text-sm text-slate-600 leading-relaxed max-w-xs">
                      {step.description}
                    </p>
                  </div>

                  {/* Horizontal Arrow for Desktop (between cards 0 and 1, and 1 and 2) */}
                  {idx < steps.length - 1 && (
                    <div className="hidden lg:flex absolute -right-6 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[#006B4F] text-white items-center justify-center shadow-md animate-pulse">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}

                  {/* Vertical Arrow for Mobile */}
                  {idx < steps.length - 1 && (
                    <div className="flex lg:hidden my-3 w-8 h-8 rounded-full bg-[#006B4F] text-white items-center justify-center shadow-md animate-bounce">
                      <ArrowDown className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
