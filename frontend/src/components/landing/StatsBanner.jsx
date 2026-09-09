import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export default function StatsBanner() {
  const { t } = useTranslation();
  const bannerRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [counts, setCounts] = useState({ stat1: 0, stat2: 0, stat3: 0, stat4: 0 });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          const duration = 1200;
          const frameDuration = 1000 / 60;
          const totalFrames = Math.round(duration / frameDuration);
          let frame = 0;

          const timer = setInterval(() => {
            frame++;
            const progress = frame / totalFrames;
            const easeOutProgress = 1 - Math.pow(1 - progress, 3); // cubic ease-out

            setCounts({
              stat1: Math.min(7, Math.round(7 * easeOutProgress)),
              stat2: Math.min(3, Math.round(3 * easeOutProgress)),
              stat3: Math.min(2, Math.round(2 * easeOutProgress)),
              stat4: Math.min(3, Math.round(3 * easeOutProgress)),
            });

            if (frame >= totalFrames) {
              clearInterval(timer);
              setCounts({ stat1: 7, stat2: 3, stat3: 2, stat4: 3 });
            }
          }, frameDuration);
        }
      },
      { threshold: 0.25 }
    );

    if (bannerRef.current) {
      observer.observe(bannerRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  const stats = [
    {
      value: hasAnimated ? counts.stat1 : 7,
      label: t('landing.stats.stat1_label', { defaultValue: 'Monitored Risk Zones' }),
      sub: t('landing.stats.stat1_sub', { defaultValue: 'Across East Khasi Hills' }),
    },
    {
      value: hasAnimated ? counts.stat2 : 3,
      label: t('landing.stats.stat2_label', { defaultValue: 'High / Critical Zones' }),
      sub: t('landing.stats.stat2_sub', { defaultValue: 'Requiring close monitoring' }),
    },
    {
      value: hasAnimated ? counts.stat3 : 2,
      label: t('landing.stats.stat3_label', { defaultValue: 'Blocked Road Corridors' }),
      sub: t('landing.stats.stat3_sub', { defaultValue: 'NH-206 & NH-40 passes' }),
    },
    {
      value: hasAnimated ? counts.stat4 : 3,
      label: t('landing.stats.stat4_label', { defaultValue: 'Active Community Alerts' }),
      sub: t('landing.stats.stat4_sub', { defaultValue: 'SMS & App notifications' }),
    },
    {
      value: '24/7',
      label: t('landing.stats.stat5_label', { defaultValue: 'Monitoring' }),
      sub: t('landing.stats.stat5_sub', { defaultValue: 'For a safer tomorrow' }),
    },
  ];

  return (
    <section
      id="stats"
      ref={bannerRef}
      className="relative py-20 bg-[#004D38] text-white overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 60, 44, 0.88), rgba(0, 45, 33, 0.94)), url('/images/meghalaya_hero_mountain.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-10 divide-y md:divide-y-0 lg:divide-x divide-emerald-600/30">
          {stats.map((item, idx) => (
            <div
              key={idx}
              className={`px-4 sm:px-6 text-center flex flex-col justify-center items-center ${
                idx === stats.length - 1 ? 'col-span-2 md:col-span-1' : ''
              }`}
            >
              <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-white font-mono tracking-tight drop-shadow-sm mb-2">
                {item.value}
              </div>
              <div className="text-sm sm:text-base font-bold text-emerald-200 tracking-tight mb-1">
                {item.label}
              </div>
              <div className="text-xs text-emerald-300/80 font-medium">
                {item.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
