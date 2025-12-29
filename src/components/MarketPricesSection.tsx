import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const marketPrices = [
  {
    name: "Tomato",
    nameNp: "टमाटर",
    price: 85,
    unit: "kg",
    change: 5,
    market: "Kalimati",
  },
  {
    name: "Potato",
    nameNp: "आलु",
    price: 45,
    unit: "kg",
    change: -2,
    market: "Kalimati",
  },
  {
    name: "Rice (Basmati)",
    nameNp: "बासमती चामल",
    price: 120,
    unit: "kg",
    change: 0,
    market: "Narayangadh",
  },
  {
    name: "Cauliflower",
    nameNp: "काउली",
    price: 55,
    unit: "piece",
    change: 8,
    market: "Kalimati",
  },
  {
    name: "Onion",
    nameNp: "प्याज",
    price: 65,
    unit: "kg",
    change: -3,
    market: "Kalimati",
  },
  {
    name: "Carrot",
    nameNp: "गाजर",
    price: 70,
    unit: "kg",
    change: 2,
    market: "Pokhara",
  },
];

const MarketPricesSection = () => {
  return (
    <section id="prices" className="bg-muted/50 py-20 md:py-28">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
            Market Prices
          </span>
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
            Today's <span className="text-primary">Live Prices</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Real-time wholesale prices from major markets across Nepal. Updated
            daily.
          </p>
        </div>

        {/* Prices Grid */}
        <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {marketPrices.map((item) => (
            <div
              key={item.name}
              className="group relative overflow-hidden rounded-xl bg-card p-5 shadow-soft transition-all duration-300 hover:shadow-medium"
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.nameNp}</p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                    item.change > 0
                      ? "bg-primary/10 text-primary"
                      : item.change < 0
                      ? "bg-destructive/10 text-destructive"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {item.change > 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : item.change < 0 ? (
                    <TrendingDown className="h-3 w-3" />
                  ) : (
                    <Minus className="h-3 w-3" />
                  )}
                  {Math.abs(item.change)}%
                </span>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-foreground">
                  ₨ {item.price}
                </span>
                <span className="text-sm text-muted-foreground">
                  /{item.unit}
                </span>
              </div>

              <p className="mt-2 text-xs text-muted-foreground">
                {item.market} Market
              </p>

              {/* Hover Accent */}
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-warm transition-all duration-300 group-hover:w-full" />
            </div>
          ))}
        </div>

        {/* View All Link */}
        <div className="mt-10 text-center">
          <a
            href="#"
            className="inline-flex items-center gap-2 font-medium text-primary transition-colors hover:text-primary/80"
          >
            View all market prices
            <TrendingUp className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default MarketPricesSection;
