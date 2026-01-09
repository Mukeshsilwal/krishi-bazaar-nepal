package com.krishihub.marketprice.service;

import com.krishihub.marketprice.dto.MarketPriceDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import com.krishihub.marketprice.service.MarketPriceService;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MarketPriceIngestionService {

    private final List<MarketPriceDataSource> dataSources;
    private final MarketPriceService marketPriceService;
    private final MarketPriceRuleEvaluator ruleEvaluator;
    private final MarketPriceNormalizer normalizer;
    private final PriceValidatorService validator;
    private final com.krishihub.marketprice.repository.MarketPriceAuditRepository auditRepository;

    /**
     * Scheduled to run every hour.
     * Cron expression: second, minute, hour, day of month, month, day(s) of week
     */
    /**
     * Ingestion triggered by scheduler or event
     */
    @Async
    public void ingestPrices() {
        log.info("Starting market price ingestion on thread: {}", Thread.currentThread().getName());
        triggerInternalIngestion();
    }

    @EventListener(org.springframework.boot.context.event.ApplicationReadyEvent.class)
    @Async
    public void onStartup() {
        log.info("Triggering initial market price ingestion on startup...");
        triggerInternalIngestion();
    }

    @Async
    public void triggerInternalIngestion() {
        for (MarketPriceDataSource source : dataSources) {
            long successCount = 0;
            try {
                log.info("Fetching prices from source: {}", source.getSourceId());
                List<MarketPriceDto> rawPrices = source.fetchPrices();

                for (MarketPriceDto raw : rawPrices) {
                    try {
                        // 1. Skip Normalization (User request: Use raw data as is)
                        // MarketPriceDto normalized = normalizer.normalize(raw);

                        // 2. Save Raw Data directly
                        MarketPriceDto savedPrice = marketPriceService.addPrice(raw);

                        // 4. Evaluate Rules (Alerts)
                        ruleEvaluator.evaluateRules(savedPrice);

                        successCount++;
                    } catch (Exception e) {
                        log.error("Failed to process price for {}: {}", raw != null ? raw.getCropName() : "unknown",
                                e.getMessage());
                    }
                }

                // Audit the ingestion event (simplified)
                log.info("Successfully ingested {} prices from {}", successCount, source.getSourceId());

            } catch (Exception e) {
                log.error("Error fetching from source {}: {}", source.getSourceId(), e.getMessage());
            }
        }
        log.info("Market price ingestion completed.");
    }

    // Manual trigger for testing
    @Async
    public void triggerIngestion() {
        ingestPrices();
    }
}
