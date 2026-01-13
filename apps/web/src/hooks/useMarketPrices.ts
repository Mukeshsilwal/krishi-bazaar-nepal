
import { useQuery } from "@tanstack/react-query";
import marketPriceService from "@/modules/marketplace/services/marketPriceService";

export const useMarketPrices = (district: string = 'Kathmandu', cropName?: string) => {
    return useQuery({
        queryKey: ["market-prices", district, cropName],
        queryFn: async () => {
            const data = await marketPriceService.getTodaysPrices(district, cropName, 0, 5);
            // Normalize response: if paginated, extraction content, if list, use it
            return data.content || data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1
    });
};
