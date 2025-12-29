import {
  ShoppingCart,
  TrendingUp,
  BookOpen,
  Truck,
  Store,
  MessageCircle,
} from "lucide-react";

const features = [
  {
    icon: ShoppingCart,
    title: "उब्जनी बेच्नुहोस्",
    titleEn: "Sell Crops",
    description: "सिधै किन्नेलाई बेच्नुहोस्। बिचौलिया छैन, राम्रो भाउ।",
    descriptionEn: "Sell directly to buyers. No middlemen, fair prices.",
    color: "bg-primary",
  },
  {
    icon: TrendingUp,
    title: "बजार भाउ",
    titleEn: "Market Prices",
    description: "कालिमाटी र अन्य बजारको आजको भाउ हेर्नुहोस्।",
    descriptionEn: "See today's prices from Kalimati and other markets.",
    color: "bg-secondary",
  },
  {
    icon: Store,
    title: "कृषि पसल",
    titleEn: "Agri Store",
    description: "बिउ, मल र औजार किन्नुहोस्।",
    descriptionEn: "Buy seeds, fertilizers, and tools.",
    color: "bg-accent",
  },
  {
    icon: BookOpen,
    title: "सिक्नुहोस्",
    titleEn: "Learn",
    description: "नेपालीमा खेती गर्ने तरिका सिक्नुहोस्।",
    descriptionEn: "Learn farming techniques in Nepali.",
    color: "bg-primary",
  },
  {
    icon: Truck,
    title: "ढुवानी सेवा",
    titleEn: "Transport",
    description: "गाडी बुक गर्नुहोस्, भण्डारण पाउनुहोस्।",
    descriptionEn: "Book transport, find storage.",
    color: "bg-secondary",
  },
  {
    icon: MessageCircle,
    title: "AI सहायक",
    titleEn: "AI Helper",
    description: "बालीको रोग पहिचान र सल्लाह पाउनुहोस्।",
    descriptionEn: "Get crop disease help and advice.",
    color: "bg-accent",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="bg-gradient-soft py-20 md:py-28">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-5 py-2 text-base font-semibold text-primary">
            सुविधाहरू / Features
          </span>
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
            के-के <span className="text-primary">पाइन्छ?</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            What can you do here?
          </p>
        </div>

        {/* Features Grid - Larger cards for easier touch */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative overflow-hidden rounded-2xl bg-card p-8 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-medium"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon - Larger */}
              <div
                className={`mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl ${feature.color} shadow-soft transition-transform duration-300 group-hover:scale-110`}
              >
                <feature.icon className="h-10 w-10 text-primary-foreground" />
              </div>

              {/* Content */}
              <h3 className="mb-1 text-2xl font-bold text-foreground">
                {feature.title}
              </h3>
              <p className="mb-3 text-sm text-muted-foreground">
                {feature.titleEn}
              </p>
              <p className="text-lg text-foreground/80 mb-2">{feature.description}</p>
              <p className="text-sm text-muted-foreground">{feature.descriptionEn}</p>

              {/* Decorative Element */}
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/5 transition-transform duration-500 group-hover:scale-150" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
