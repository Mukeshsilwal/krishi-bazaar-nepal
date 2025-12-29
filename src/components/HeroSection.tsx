import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import heroImage from "@/assets/hero-farming.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Nepali farming landscape"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto flex min-h-screen flex-col items-center justify-center px-4 pt-20 text-center md:pt-24">
        <div className="animate-fade-in-up max-w-4xl">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-2 backdrop-blur-sm">
            <span className="h-2 w-2 animate-pulse-slow rounded-full bg-secondary" />
            <span className="text-sm font-medium text-primary-foreground">
              Nepal's #1 Agricultural Platform
            </span>
          </div>

          {/* Headline */}
          <h1 className="mb-6 text-4xl font-bold leading-tight text-primary-foreground md:text-5xl lg:text-6xl xl:text-7xl">
            Empowering Farmers,{" "}
            <span className="text-gradient-warm inline-block">
              Growing Nepal
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-foreground/80 md:text-xl">
            Sell your crops directly to buyers, access real-time market prices,
            and learn modern farming techniques — all in one platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button variant="hero" size="xl" className="group w-full sm:w-auto">
              Start Selling Today
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="heroOutline" size="xl" className="w-full sm:w-auto">
              <Play className="h-5 w-5" />
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-4 md:gap-8">
            {[
              { value: "50,000+", label: "Active Farmers" },
              { value: "₨ 2.5Cr+", label: "Monthly Trade" },
              { value: "75+", label: "Districts" },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className={`animate-fade-in-up delay-${(index + 2) * 100}`}
              >
                <div className="text-2xl font-bold text-primary-foreground md:text-3xl lg:text-4xl">
                  {stat.value}
                </div>
                <div className="text-sm text-primary-foreground/70 md:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-primary-foreground/30 p-2">
            <div className="h-2 w-1 animate-pulse rounded-full bg-primary-foreground/60" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
