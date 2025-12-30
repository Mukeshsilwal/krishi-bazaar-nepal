package com.krishihub.marketprice.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class PriceScheduler {

    @Scheduled(cron = "0 0 10 * * *") // Run at 10 AM daily
    public void fetchDailyPrices() {
        log.info("Fetching daily market prices from external source...");
        // Logic to fetch prices from an external API (scraped or official)
        // and update the database, then trigger price alerts.
        log.info("Daily market prices updated successfully.");
    }
}
