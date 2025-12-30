import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const marketPrices = [
  {
    name: "टमाटर",
    nameEn: "Tomato",
    emoji: "🍅",
    price: 85,
    unit: "केजी",
    unitEn: "kg",
    change: 5,
    market: "कालिमाटी",
  },
  {
    name: "आलु",
    nameEn: "Potato",
    emoji: "🥔",
    price: 45,
    unit: "केजी",
    unitEn: "kg",
    change: -2,
    market: "कालिमाटी",
  },
  {
    name: "बासमती चामल",
    nameEn: "Basmati Rice",
    emoji: "🍚",
    price: 120,
    unit: "केजी",
    unitEn: "kg",
    change: 0,
    market: "नारायणगढ",
  },
  {
    name: "काउली",
    nameEn: "Cauliflower",
    emoji: "🥬",
    price: 55,
    unit: "गोटा",
    unitEn: "piece",
    change: 8,
    market: "कालिमाटी",
  },
  {
    name: "प्याज",
    nameEn: "Onion",
    emoji: "🧅",
    price: 65,
    unit: "केजी",
    unitEn: "kg",
    change: -3,
    market: "कालिमाटी",
  },
  {
    name: "गाजर",
    nameEn: "Carrot",
    emoji: "🥕",
    price: 70,
    unit: "केजी",
    unitEn: "kg",
    change: 2,
    market: "पोखरा",
  },
];

const MarketPricesSection = () => {
  return (
    <section id="prices" className="bg-muted/50 py-20 md:py-28">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-5 py-2 text-base font-semibold text-primary">
            बजार भाउ / Market Prices
          </span>
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
            आजको <span className="text-primary">भाउ</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Today's Prices
          </p>
        </div>

        {/* Prices Grid - Larger cards with emojis */}
        <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {marketPrices.map((item) => (
            <div
              key={item.name}
              className="group relative overflow-hidden rounded-2xl bg-card p-6 shadow-soft transition-all duration-300 hover:shadow-medium"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{item.emoji}</span>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.nameEn}</p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium ${
                    item.change > 0
                      ? "bg-primary/10 text-primary"
                      : item.change < 0
                      ? "bg-destructive/10 text-destructive"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {item.change > 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : item.change < 0 ? (
                    <TrendingDown className="h-4 w-4" />
                  ) : (
                    <Minus className="h-4 w-4" />
                  )}
                  {Math.abs(item.change)}%
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground md:text-4xl">
                  रु. {item.price}
                </span>
                <span className="text-base text-muted-foreground">
                  /{item.unit}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                per {item.unitEn}
              </p>

              <p className="mt-3 text-sm text-muted-foreground">
                📍 {item.market}
              </p>

              {/* Hover Accent */}
              <div className="absolute bottom-0 left-0 h-1.5 w-0 bg-gradient-warm transition-all duration-300 group-hover:w-full" />
            </div>
          ))}
        </div>

        {/* View All Link - Larger button */}
        <div className="mt-10 text-center">
          <a
            href="#"
            className="inline-flex items-center gap-3 rounded-xl bg-primary/10 px-6 py-4 text-lg font-semibold text-primary transition-colors hover:bg-primary/20"
          >
            <span className="flex flex-col leading-tight">
              <span>सबै भाउ हेर्नुहोस्</span>
              <span className="text-sm opacity-70">View all prices</span>
            </span>
            <TrendingUp className="h-5 w-5" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default MarketPricesSection;
