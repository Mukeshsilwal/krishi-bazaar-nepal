import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import marketPriceService from "@/modules/marketplace/services/marketPriceService";

// Helper for emojis (can be expanded)
const getEmoji = (name: string) => {
  if (name.toLowerCase().includes('tomato') || name.includes('टमाटर')) return "🍅";
  if (name.toLowerCase().includes('potato') || name.includes('आलु')) return "🥔";
  if (name.toLowerCase().includes('rice') || name.includes('चामल')) return "🍚";
  if (name.toLowerCase().includes('onion') || name.includes('प्याज')) return "🧅";
  if (name.toLowerCase().includes('carrot') || name.includes('गाजर')) return "🥕";
  if (name.toLowerCase().includes('cauliflower') || name.includes('काउली')) return "🥬";
  if (name.toLowerCase().includes('apple') || name.includes('स्याउ')) return "🍎";
  return "🥬";
};

const MarketPricesSection = () => {
  const { t, language } = useLanguage();
  const [prices, setPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const data = await marketPriceService.getTodaysPrices();
        // Handle paginated (data.content) vs legacy list (data) response
        const items = Array.isArray(data) ? data : (data.content || []);
        const sliced = items.slice(0, 6);
        setPrices(sliced);
      } catch (error) {
        console.error("Failed to load home prices", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPrices();
  }, []);

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

        {/* Prices Grid */}
        <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full text-center py-10">Loading live prices...</div>
          ) : prices.length === 0 ? (
            <div className="col-span-full text-center py-10">No prices available today.</div>
          ) : (
            prices.map((item, index) => {
              const emoji = getEmoji(item.cropName);
              // Mocking change for now as API doesn't provide it yet
              const change = 0;

              return (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-2xl bg-card p-6 shadow-soft transition-all duration-300 hover:shadow-medium"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{emoji}</span>
                      <div>
                        <h3 className="text-xl font-bold text-foreground">
                          {item.cropName}
                        </h3>

                      </div>
                    </div>
                    {/* Removed change indicator as we don't have real data for it yet */}
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-foreground md:text-4xl">
                      रु. {item.avgPrice}
                    </span>
                    <span className="text-base text-muted-foreground">
                      /{item.unit}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {item.district}
                  </p>

                  <p className="mt-3 text-sm text-muted-foreground">
                    Minimum: Rs. {item.minPrice}
                  </p>

                  {/* Hover Accent */}
                  <div className="absolute bottom-0 left-0 h-1.5 w-0 bg-gradient-warm transition-all duration-300 group-hover:w-full" />
                </div>
              )
            })
          )}
        </div>

        {/* View All Link */}
        <div className="mt-10 text-center">
          <Link
            to="/market-prices"
            className="inline-flex items-center gap-3 rounded-xl bg-primary/10 px-6 py-4 text-lg font-semibold text-primary transition-colors hover:bg-primary/20"
          >
            <span className="flex flex-col leading-tight">
              <span>सबै भाउ हेर्नुहोस्</span>
              <span className="text-sm opacity-70">View all prices</span>
            </span>
            <TrendingUp className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default MarketPricesSection;
