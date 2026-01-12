import { Button } from "@/components/ui/button";
import { ArrowRight, Download, CheckCircle } from "lucide-react";
import produceImage from "@/assets/produce-display.jpg";

const CTASection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-hero py-20 md:py-28">
      {/* Decorative Elements */}
      <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-secondary/20 blur-3xl" />
      <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
          {/* Content */}
          <div className="flex-1 text-center lg:text-left">
            <h2 className="mb-3 text-3xl font-bold text-primary-foreground md:text-4xl lg:text-5xl">
              अब बेच्न सुरु गर्नुहोस्
            </h2>
            <p className="mb-6 text-xl text-primary-foreground/90">
              Start Selling Today
            </p>
            <p className="mb-8 text-lg text-primary-foreground/70">
              हजारौं किसानहरू जस्तै तपाईं पनि सिधै बेचेर बढी कमाउनुहोस्।
            </p>
            <p className="mb-8 text-base text-primary-foreground/60">
              Join thousands of farmers earning more through direct sales.
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
              <Button
                variant="hero"
                size="xl"
                className="h-16 w-full px-8 sm:w-auto"
              >
                <Download className="mr-2 h-6 w-6" />
                <span className="flex flex-col items-start leading-tight">
                  <span className="text-xl font-bold">एप डाउनलोड गर्नुहोस्</span>
                  <span className="text-sm opacity-80">Download App</span>
                </span>
              </Button>
              <Button
                variant="heroOutline"
                size="xl"
                className="group h-16 w-full px-8 sm:w-auto"
              >
                <span className="flex flex-col items-start leading-tight">
                  <span className="text-xl font-bold">अनलाइन दर्ता</span>
                  <span className="text-sm opacity-80">Register Online</span>
                </span>
                <ArrowRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>

            {/* Trust Badges - Larger with Nepali */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <div className="flex items-center gap-3 rounded-xl bg-primary-foreground/10 px-4 py-3">
                <CheckCircle className="h-6 w-6 text-secondary" />
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-medium text-primary-foreground">निःशुल्क</span>
                  <span className="text-xs text-primary-foreground/70">Free</span>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-primary-foreground/10 px-4 py-3">
                <CheckCircle className="h-6 w-6 text-secondary" />
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-medium text-primary-foreground">बिचौलिया छैन</span>
                  <span className="text-xs text-primary-foreground/70">No middlemen</span>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-primary-foreground/10 px-4 py-3">
                <CheckCircle className="h-6 w-6 text-secondary" />
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-medium text-primary-foreground">सुरक्षित पेमेन्ट</span>
                  <span className="text-xs text-primary-foreground/70">Secure payment</span>
                </div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-warm opacity-20 blur-2xl" />
              <img
                src={produceImage}
                alt="Fresh produce"
                className="relative rounded-2xl shadow-medium"
              />

              {/* Floating Card */}
              <div className="absolute -bottom-6 -left-6 rounded-xl bg-card p-5 shadow-medium">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-3xl">🌾</span>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">
                      रु. २५,०००+
                    </p>
                    <p className="text-sm text-foreground/80">
                      औसत मासिक आम्दानी
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Avg. monthly earning
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
