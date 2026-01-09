package com.krishihub.marketprice.scheduler;

import com.krishihub.marketprice.service.MarketPriceIngestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
@RequiredArgsConstructor
public class PriceScheduler {

    private final MarketPriceIngestionService ingestionService;

    @Scheduled(cron = "0 0 10 * * *") // Run at 10 AM daily
    public void fetchDailyPrices() {
        log.info("PriceScheduler: Triggering daily market price ingestion...");
        ingestionService.ingestPrices();
        log.info("PriceScheduler: Ingestion triggered.");
    }
}
