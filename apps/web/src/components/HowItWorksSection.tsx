import { UserPlus, Camera, MessageCircle, Banknote } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const steps = [
  {
    icon: UserPlus,
    step: "१",
    stepEn: "1",
    title: "दर्ता गर्नुहोस्",
    titleEn: "Register",
    description: "मोबाइल नम्बरले दर्ता गर्नुहोस्।",
    descriptionEn: "Sign up with your mobile number.",
  },
  {
    icon: Camera,
    step: "२",
    stepEn: "2",
    title: "फोटो खिच्नुहोस्",
    titleEn: "Take Photo",
    description: "आफ्नो उब्जनीको फोटो खिच्नुहोस्।",
    descriptionEn: "Take a photo of your produce.",
  },
  {
    icon: MessageCircle,
    step: "३",
    stepEn: "3",
    title: "किन्नेसँग कुरा गर्नुहोस्",
    titleEn: "Chat with Buyer",
    description: "भाउ मिलाउनुहोस्।",
    descriptionEn: "Negotiate the price.",
  },
  {
    icon: Banknote,
    step: "४",
    stepEn: "4",
    title: "पैसा पाउनुहोस्",
    titleEn: "Get Paid",
    description: "सिधै आफ्नो खातामा पैसा पाउनुहोस्।",
    descriptionEn: "Receive money directly to your account.",
  },
];

const HowItWorksSection = () => {
  const { t, language } = useLanguage();

  return (
    <section id="how-it-works" className="bg-background py-20 md:py-28">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="mb-4 inline-block rounded-full bg-secondary/20 px-5 py-2 text-base font-semibold text-secondary-foreground">
            {t('how.badge')}
          </span>
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
            <span className="text-gradient-warm">{t('how.title.highlight')}</span> {t('how.title.suffix')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('how.subtitle')}
          </p>
        </div>

        {/* Steps - Mobile-friendly vertical layout */}
        <div className="mx-auto max-w-2xl">
          <div className="relative">
            {/* Connection Line */}
            <div className="absolute left-8 top-0 h-full w-1 bg-gradient-to-b from-primary via-secondary to-accent md:left-10" />

            <div className="space-y-6">
              {steps.map((step, index) => (
                <div
                  key={step.step}
                  className="relative flex gap-6"
                >
                  {/* Icon Circle */}
                  <div className="relative z-10 flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-gradient-hero shadow-medium md:h-20 md:w-20">
                    <step.icon className="h-8 w-8 text-primary-foreground md:h-10 md:w-10" />
                  </div>

                  {/* Content Card */}
                  <div className="flex-1 rounded-2xl bg-card p-6 shadow-soft transition-all duration-300 hover:shadow-medium">
                    <div className="mb-2 flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                        {language === 'ne' ? step.step : step.stepEn}
                      </span>
                    </div>
                    <h3 className="mb-1 text-xl font-bold text-foreground md:text-2xl">
                      {language === 'ne' ? step.title : step.titleEn}
                    </h3>
                    <p className="text-lg text-foreground/80">
                      {language === 'ne' ? step.description : step.descriptionEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
