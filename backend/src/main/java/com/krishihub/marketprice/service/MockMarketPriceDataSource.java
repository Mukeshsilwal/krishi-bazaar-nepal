package com.krishihub.marketprice.service;

import com.krishihub.marketprice.dto.MarketPriceDto;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
public class MockMarketPriceDataSource implements MarketPriceDataSource {

    private final Random random = new Random();

    @Override
    public List<MarketPriceDto> fetchPrices() {
        List<MarketPriceDto> prices = new ArrayList<>();

        // Mock data for Kalimati Market
        prices.add(createMockPrice("Tomato Big", "Kathmandu", 40, 50, "Kg"));
        prices.add(createMockPrice("Tomato Small", "Kathmandu", 30, 40, "Kg"));
        prices.add(createMockPrice("Potato Red", "Kathmandu", 55, 65, "Kg"));
        prices.add(createMockPrice("Onion Dry", "Kathmandu", 70, 80, "Kg"));
        prices.add(createMockPrice("Carrot", "Kathmandu", 90, 110, "Kg"));
        prices.add(createMockPrice("Cabbage", "Kathmandu", 20, 30, "Kg"));
        prices.add(createMockPrice("Cauliflower", "Kathmandu", 40, 60, "Kg"));

        // Mock data for Chitwan
        prices.add(createMockPrice("Tomato Big", "Chitwan", 35, 45, "Kg"));
        prices.add(createMockPrice("Potato Red", "Chitwan", 50, 60, "Kg"));

        return prices;
    }

    @Override
    public String getSourceId() {
        return "MOCK_SOURCE";
    }

    private MarketPriceDto createMockPrice(String crop, String district, double minBase, double maxBase, String unit) {
        // Add some random variation
        double variation = random.nextDouble() * 5 - 2.5; // +/- 2.5
        BigDecimal min = BigDecimal.valueOf(minBase + variation).setScale(2, BigDecimal.ROUND_HALF_UP);
        BigDecimal max = BigDecimal.valueOf(maxBase + variation).setScale(2, BigDecimal.ROUND_HALF_UP);
        BigDecimal avg = min.add(max).divide(BigDecimal.valueOf(2), 2, BigDecimal.ROUND_HALF_UP);

        return MarketPriceDto.builder()
                .cropName(crop)
                .district(district)
                .minPrice(min)
                .maxPrice(max)
                .avgPrice(avg)
                .unit(unit)
                .priceDate(LocalDate.now())
                .source("Kalimati Market (Mock)")
                .build();
    }
}
