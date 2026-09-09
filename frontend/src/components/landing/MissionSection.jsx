import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check, ArrowRight, Quote } from 'lucide-react';

export default function MissionSection() {
  const { t } = useTranslation();

  const scrollToFeatures = () => {
    const el = document.getElementById('features');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const checklist = [
    t('landing.mission.check1', { defaultValue: 'Early detection' }),
    t('landing.mission.check2', { defaultValue: 'Location-based warnings' }),
    t('landing.mission.check3', { defaultValue: 'Community reporting' }),
    t('landing.mission.check4', { defaultValue: 'Infrastructure monitoring' }),
    t('landing.mission.check5', { defaultValue: 'Data-driven decision making' }),
    t('landing.mission.check6', { defaultValue: 'Stronger, safer communities' }),
  ];

  return (
    <section id="mission" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* ── LEFT COLUMN: Meghalaya Mountain / Road Image with Overlay (5 cols) ── */}
          <div className="lg:col-span-5 relative group">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-[#D9E2DE] aspect-[4/5] sm:aspect-[4/3] lg:aspect-[4/5]">
              <img
                src="/images/meghalaya_mission_road.jpg"
                alt="Meghalaya East Khasi Hills Mountain Highway"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

              {/* Text Overlay: "Safer Communities Stronger Tomorrow" */}
              <div className="absolute bottom-6 left-6 right-6 p-6 rounded-2xl bg-black/50 backdrop-blur-md border border-white/20 text-white space-y-1">
                <p className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
                  “{t('landing.mission.img_badge_line1', { defaultValue: 'Safer Communities' })}
                  <br />
                  <span className="text-emerald-400">
                    {t('landing.mission.img_badge_line2', { defaultValue: 'Stronger Tomorrow' })}
                  </span>”
                </p>
                <p className="text-[11px] text-slate-300 font-mono uppercase tracking-wider">
                  East Khasi Hills • Meghalaya
                </p>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Mission Content, Checklist, Quote (7 cols) ── */}
          <div className="lg:col-span-7 space-y-7">
            <div className="space-y-3">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#006B4F]">
                {t('landing.mission.kicker', { defaultValue: 'OUR MISSION' })}
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                {t('landing.mission.heading', {
                  defaultValue: 'Building a Safer, More Resilient Northeast',
                })}
              </h2>
            </div>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              {t('landing.mission.paragraph', {
                defaultValue:
                  'Landslides can develop rapidly, but better information can give communities valuable time to prepare. NER Landslide Alert brings spatial intelligence, environmental data, AI and community reporting together in one platform.',
              })}
            </p>

            {/* Checklist Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {checklist.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#EAF5F0] text-[#006B4F] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                  <span className="text-sm font-semibold text-slate-800">{item}</span>
                </div>
              ))}
            </div>

            {/* Explore Platform Button */}
            <div className="pt-2">
              <button
                onClick={scrollToFeatures}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#006B4F] hover:bg-[#00523C] text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer group"
              >
                <span>{t('landing.mission.btn_explore', { defaultValue: 'Explore the Platform' })}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Subtle Quote Card on the right */}
            <div className="p-5 rounded-2xl bg-[#F8FAF9] border-l-4 border-l-[#006B4F] border border-[#D9E2DE] shadow-2xs flex items-start gap-3.5">
              <Quote className="w-6 h-6 text-[#006B4F] shrink-0 opacity-80" />
              <p className="text-sm font-semibold text-slate-800 italic leading-relaxed">
                “{t('landing.mission.quote', {
                  defaultValue: 'Technology and people together can build a safer Meghalaya.',
                })}”
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
