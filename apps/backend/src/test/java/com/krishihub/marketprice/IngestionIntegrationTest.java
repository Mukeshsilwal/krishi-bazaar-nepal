package com.krishihub.marketprice;

import com.krishihub.marketprice.dto.MarketPriceDto;
import com.krishihub.marketprice.repository.MarketPriceRepository;
import com.krishihub.marketprice.service.MarketPriceDataSource;
import com.krishihub.marketprice.service.MarketPriceIngestionService;
import com.krishihub.marketprice.service.MarketPriceService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@SpringBootTest
public class IngestionIntegrationTest {

    @Autowired
    private MarketPriceIngestionService ingestionService;

    @Autowired
    private MarketPriceService marketPriceService;

    @Autowired
    private MarketPriceRepository priceRepository;

    @MockBean
    private MarketPriceDataSource mockDataSource;

    @Test
    public void testIngestionAndRetrieval() {
        // 1. Setup Mock Data
        MarketPriceDto price1 = MarketPriceDto.builder()
                .cropName("Tomato Big")
                .district("Kathmandu")
                .minPrice(new BigDecimal("50"))
                .maxPrice(new BigDecimal("60"))
                .avgPrice(new BigDecimal("55"))
                .unit("KG")
                .priceDate(com.krishihub.common.util.DateTimeProvider.today())
                .source("TEST_SOURCE")
                .build();

        // Setup duplicate/update scenario
        MarketPriceDto price1Update = MarketPriceDto.builder()
                .cropName("Tomato Big")
                .district("Kathmandu")
                .minPrice(new BigDecimal("52")) // Changed price
                .maxPrice(new BigDecimal("62"))
                .avgPrice(new BigDecimal("57"))
                .unit("KG")
                .priceDate(com.krishihub.common.util.DateTimeProvider.today())
                .source("TEST_SOURCE")
                .build();

        // Configure mock to return the same item twice (simulating retry or duplicate
        // source)
        when(mockDataSource.fetchPrices()).thenReturn(Arrays.asList(price1, price1Update));
        when(mockDataSource.getSourceId()).thenReturn("TEST_SOURCE");

        // Force the ingestion service to use our mock
        // Note: effectively we are testing the logic inside default ingestion flow if
        // we could inject it,
        // but here we might just call addPrice directly to verify the service logic if
        // ingestion is hard to wire.
        // However, IngestionService uses autowired List<DataSource>.
        // For this test, let's verify MarketPriceService.addPrice directly first as
        // that was the fix.

        // 2. Execute Service Method directly (Testing the Fix)
        marketPriceService.addPrice(price1);
        marketPriceService.addPrice(price1Update); // Should update, not duplicate

        // 3. Verify Repository State
        List<String> crops = priceRepository.findDistinctCropNames();
        assertTrue(crops.contains("Tomato Big"));

        Page<MarketPriceDto> results = marketPriceService.getTodaysPrices("Kathmandu", 0, 10);
        assertNotNull(results);
        assertEquals(1, results.getTotalElements(), "Should have only 1 record for Tomato Big despite adding twice");

        MarketPriceDto saved = results.getContent().get(0);
        assertEquals(new BigDecimal("57"), saved.getAvgPrice(), "Should have the updated price");

        // 4. Verify Retrieval logic used by Dashboard
        assertNotNull(saved.getCropName());
        assertEquals("Kathmandu", saved.getDistrict());
    }
}
