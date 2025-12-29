import { Button } from "@/components/ui/button";
import { ArrowRight, Download } from "lucide-react";
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
            <h2 className="mb-6 text-3xl font-bold text-primary-foreground md:text-4xl lg:text-5xl">
              Ready to Transform Your Farming?
            </h2>
            <p className="mb-8 text-lg text-primary-foreground/80">
              Join thousands of Nepali farmers who are already earning more
              through direct sales. Download the app or sign up online today.
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
              <Button
                variant="hero"
                size="xl"
                className="w-full sm:w-auto"
              >
                <Download className="h-5 w-5" />
                Download App
              </Button>
              <Button
                variant="heroOutline"
                size="xl"
                className="group w-full sm:w-auto"
              >
                Register Online
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 lg:justify-start">
              <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/10">
                  ✓
                </span>
                Free to use
              </div>
              <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/10">
                  ✓
                </span>
                No middlemen
              </div>
              <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/10">
                  ✓
                </span>
                Secure payments
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
              <div className="absolute -bottom-6 -left-6 rounded-xl bg-card p-4 shadow-medium">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-2xl">🌾</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      ₨ 25,000+
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
