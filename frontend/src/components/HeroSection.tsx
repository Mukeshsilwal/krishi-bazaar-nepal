import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Users, Banknote, MapPin } from "lucide-react";
import heroImage from "@/assets/hero-farming.jpg";
import { useLanguage } from "@/context/LanguageContext";

const HeroSection = () => {
  const { t } = useLanguage();
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="नेपाली कृषि"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto flex min-h-screen flex-col items-center justify-center px-4 pt-20 text-center md:pt-24">
        <div className="animate-fade-in-up max-w-4xl">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-5 py-3 backdrop-blur-sm">
            <span className="h-3 w-3 animate-pulse-slow rounded-full bg-secondary" />
            <span className="text-base font-medium text-primary-foreground">
              {t('hero.badge')}
            </span>
          </div>

          {/* Headline */}
          <h1 className="mb-6 text-4xl font-bold leading-tight text-primary-foreground md:text-5xl lg:text-6xl xl:text-7xl">
            {t('hero.title.prefix')} {" "}
            <span className="text-gradient-warm inline-block">
              {t('hero.title.suffix')}
            </span>
          </h1>

          {/* Subheadline - Larger and clearer */}
          <p className="mx-auto mb-4 max-w-2xl text-xl text-primary-foreground/90 md:text-2xl font-medium">
            {t('hero.subtitle')}
          </p>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-foreground/70 md:text-xl">
            {t('hero.description')}
          </p>

          {/* CTA Buttons - Larger for easier touch */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button variant="hero" size="xl" className="group h-16 w-full px-8 text-lg sm:w-auto">
              <span className="flex flex-col items-center leading-tight">
                <span className="text-xl font-bold">{t('hero.cta.start')}</span>
                <span className="text-sm opacity-80">{t('hero.cta.start.sub')}</span>
              </span>
              <ArrowRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="heroOutline" size="xl" className="h-16 w-full px-8 text-lg sm:w-auto">
              <Play className="mr-2 h-6 w-6" />
              <span className="flex flex-col items-center leading-tight">
                <span className="text-xl font-bold">{t('hero.cta.video')}</span>
                <span className="text-sm opacity-80">{t('hero.cta.video.sub')}</span>
              </span>
            </Button>
          </div>

          {/* Stats - With icons for better understanding */}
          <div className="mt-12 grid grid-cols-3 gap-4 md:gap-8">
            <div className="rounded-2xl bg-primary-foreground/10 p-4 backdrop-blur-sm">
              <Users className="mx-auto mb-2 h-8 w-8 text-secondary" />
              <div className="text-2xl font-bold text-primary-foreground md:text-3xl lg:text-4xl">
                ५०,०००+
              </div>
              <div className="text-sm text-primary-foreground/70 md:text-base">
                {t('hero.stat.farmers')}
              </div>
            </div>
            <div className="rounded-2xl bg-primary-foreground/10 p-4 backdrop-blur-sm">
              <Banknote className="mx-auto mb-2 h-8 w-8 text-secondary" />
              <div className="text-2xl font-bold text-primary-foreground md:text-3xl lg:text-4xl">
                २.५ करोड+
              </div>
              <div className="text-sm text-primary-foreground/70 md:text-base">
                {t('hero.stat.trade')}
              </div>
            </div>
            <div className="rounded-2xl bg-primary-foreground/10 p-4 backdrop-blur-sm">
              <MapPin className="mx-auto mb-2 h-8 w-8 text-secondary" />
              <div className="text-2xl font-bold text-primary-foreground md:text-3xl lg:text-4xl">
                ७५+
              </div>
              <div className="text-sm text-primary-foreground/70 md:text-base">
                {t('hero.stat.districts')}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <div className="flex h-12 w-8 items-start justify-center rounded-full border-2 border-primary-foreground/30 p-2">
            <div className="h-3 w-1.5 animate-pulse rounded-full bg-primary-foreground/60" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
