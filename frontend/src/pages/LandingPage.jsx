import React, { useEffect } from 'react';
import LandingNavbar from '../components/landing/LandingNavbar';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import LiveRiskSection from '../components/landing/LiveRiskSection';
import StatsBanner from '../components/landing/StatsBanner';
import MissionSection from '../components/landing/MissionSection';
import CtaSection from '../components/landing/CtaSection';
import LandingFooter from '../components/landing/LandingFooter';

export default function LandingPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'NER Landslide Alert | East Khasi Hills • Early Warning Platform';
    // Enable smooth scrolling for the landing page
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = '';
    };
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-[#006B4F] selection:text-white antialiased overflow-x-hidden">
      {/* 1. Sticky Navbar */}
      <LandingNavbar />

      <main className="flex-1 w-full">
        {/* 2. Full-screen Hero Section */}
        <HeroSection />

        {/* 3. Features Section */}
        <FeaturesSection />

        {/* 4. How It Works Section */}
        <HowItWorksSection />

        {/* 5. Live Risk View Section */}
        <LiveRiskSection />

        {/* 6. Statistics Banner */}
        <StatsBanner />

        {/* 7. Mission Section */}
        <MissionSection />

        {/* 8. Final CTA Section */}
        <CtaSection />
      </main>

      {/* 9. Footer */}
      <LandingFooter />
    </div>
  );
}
