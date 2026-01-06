package com.krishihub.marketprice;

import com.krishihub.marketprice.dto.MarketPriceDto;
import com.krishihub.marketprice.repository.MarketPriceRepository;
import com.krishihub.marketprice.service.MarketPriceService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class MarketPriceFallbackIntegrationTest {

    @Autowired
    private MarketPriceService marketPriceService;

    @Autowired
    private MarketPriceRepository priceRepository;

    @Test
    public void testFallbackToPreviousDate() {
        // 1. Setup - Clear existing data for a specific test district to ensure clean
        // state
        String testDistrict = "FallbackTestDistrict";
        // In a real env we might not be able to clear everything easily, but for this
        // test district we can assume clean or clean it.
        // Ideally we would use @Transactional, but we want to verify across service
        // boundaries if transaction propagation mattered (though here it's read only).
        // Let's just create unique data.

        LocalDate yesterday = LocalDate.now().minusDays(1);

        MarketPriceDto oldPrice = MarketPriceDto.builder()
                .cropName("Fallback Potato")
                .district(testDistrict)
                .minPrice(new BigDecimal("40"))
                .maxPrice(new BigDecimal("50"))
                .avgPrice(new BigDecimal("45"))
                .unit("KG")
                .priceDate(yesterday)
                .source("TEST_SOURCE")
                .build();

        marketPriceService.addPrice(oldPrice);

        // 2. Execute - requesting today's prices
        Page<MarketPriceDto> result = marketPriceService.getTodaysPrices(testDistrict, 0, 10);

        // 3. Verify
        assertNotNull(result);
        assertTrue(result.hasContent(), "Should return content even if today has no prices");

        MarketPriceDto fetched = result.getContent().get(0);
        assertEquals(yesterday, fetched.getPriceDate(), "Should return yesterday's price date");
        assertEquals("Fallback Potato", fetched.getCropName());

        // 4. Verify that if we add today's price, it takes precedence
        MarketPriceDto todayPrice = MarketPriceDto.builder()
                .cropName("Fallback Potato")
                .district(testDistrict)
                .minPrice(new BigDecimal("50"))
                .maxPrice(new BigDecimal("60"))
                .avgPrice(new BigDecimal("55"))
                .unit("KG")
                .priceDate(LocalDate.now())
                .source("TEST_SOURCE")
                .build();

        marketPriceService.addPrice(todayPrice);

        Page<MarketPriceDto> newResult = marketPriceService.getTodaysPrices(testDistrict, 0, 10);
        assertNotNull(newResult);
        assertEquals(LocalDate.now(), newResult.getContent().get(0).getPriceDate(),
                "Should return today's price when available");
        assertEquals(new BigDecimal("55"), newResult.getContent().get(0).getAvgPrice());
    }
}
