import React, { Suspense } from 'react';
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import MarketPricesSection from "@/components/MarketPricesSection";
import MarketplaceSection from "@/modules/marketplace/components/MarketplaceSection";
import CTASection from "@/components/CTASection";

const WeatherWidget = React.lazy(() => import("@/modules/advisory/components/WeatherWidget"));

const Index = () => {
  return (
    <>
      <HeroSection />
      <Suspense fallback={<div className="h-48 bg-gray-50 animate-pulse" />}>
        <WeatherWidget />
      </Suspense>
      <FeaturesSection />
      <HowItWorksSection />
      <MarketPricesSection />
      <MarketplaceSection id="marketplace" />
      <CTASection />
    </>
  );
};

export default Index;
