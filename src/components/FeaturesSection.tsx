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
    title: "Sell Crops Directly",
    description:
      "List your produce and connect directly with buyers. No middlemen, fair prices.",
    color: "bg-primary",
  },
  {
    icon: TrendingUp,
    title: "Live Market Prices",
    description:
      "Real-time prices from Kalimati, Narayangadh and other major markets across Nepal.",
    color: "bg-secondary",
  },
  {
    icon: Store,
    title: "Agri Store",
    description:
      "Buy quality seeds, fertilizers, and equipment from verified vendors.",
    color: "bg-accent",
  },
  {
    icon: BookOpen,
    title: "Learn & Grow",
    description:
      "Access farming guides, videos, and expert tips in Nepali language.",
    color: "bg-primary",
  },
  {
    icon: Truck,
    title: "Logistics Support",
    description:
      "Easy transport booking and cold storage access for your produce.",
    color: "bg-secondary",
  },
  {
    icon: MessageCircle,
    title: "AI Assistant",
    description:
      "Get instant help with crop diseases, weather, and farming queries.",
    color: "bg-accent",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="bg-gradient-soft py-20 md:py-28">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
            Features
          </span>
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
            Everything You Need to{" "}
            <span className="text-primary">Succeed</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            A complete digital ecosystem designed for Nepali farmers, from
            selling crops to accessing finance.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative overflow-hidden rounded-2xl bg-card p-8 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-medium"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div
                className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl ${feature.color} shadow-soft transition-transform duration-300 group-hover:scale-110`}
              >
                <feature.icon className="h-7 w-7 text-primary-foreground" />
              </div>

              {/* Content */}
              <h3 className="mb-3 text-xl font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">{feature.description}</p>

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
