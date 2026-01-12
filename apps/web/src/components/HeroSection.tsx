import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Upload, TrendingUp, ShoppingCart } from "lucide-react";
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

          {/* Action Grid - Action First Design */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full max-w-5xl mx-auto px-4">
            {/* Sell Card */}
            <Link to="/my-listings" className="group bg-green-600 hover:bg-green-700 text-white p-6 rounded-2xl transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-xl flex flex-col items-center border-2 border-green-500 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="bg-white/20 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-1">{t('hero.action.sell')}</h3>
              <p className="text-green-100 font-medium">{t('hero.action.sell.sub')}</p>
            </Link>

            {/* Price Card */}
            <Link to="/#prices" onClick={() => document.getElementById('prices')?.scrollIntoView({ behavior: 'smooth' })} className="group bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-2xl transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-xl flex flex-col items-center border-2 border-blue-500 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="bg-white/20 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-1">{t('hero.action.price')}</h3>
              <p className="text-blue-100 font-medium">{t('hero.action.price.sub')}</p>
            </Link>

            {/* Buy Card */}
            <Link to="/#marketplace" onClick={() => document.getElementById('marketplace')?.scrollIntoView({ behavior: 'smooth' })} className="group bg-orange-500 hover:bg-orange-600 text-white p-6 rounded-2xl transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-xl flex flex-col items-center border-2 border-orange-400 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="bg-white/20 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-1">{t('hero.action.buy')}</h3>
              <p className="text-orange-100 font-medium">{t('hero.action.buy.sub')}</p>
            </Link>
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
