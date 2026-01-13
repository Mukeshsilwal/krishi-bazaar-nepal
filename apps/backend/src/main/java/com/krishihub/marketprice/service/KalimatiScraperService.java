package com.krishihub.marketprice.service;

import com.krishihub.marketprice.dto.MarketPriceDto;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * HTTP-based scraper for Kalimati Market Government website.
 * This is a server-rendered page, so JSoup can parse it directly without JavaScript.
 * 
 * Source: https://kalimatimarket.gov.np/daily-price
 * 
 * This is the primary scraper for production deployments where Chrome is not available.
 */
@Service
@Slf4j
public class KalimatiScraperService implements MarketPriceDataSource {

    private static final String KALIMATI_URL = "https://kalimatimarket.gov.np/daily-price";
    private static final String SOURCE_ID = "KALIMATI_GOV";
    private static final int TIMEOUT_MS = 15000;

    @Value("${market.scraper.kalimati.enabled:true}")
    private boolean enabled;

    @Override
    public List<MarketPriceDto> fetchPrices() {
        if (!enabled) {
            log.info("Kalimati scraper is disabled via configuration");
            return new ArrayList<>();
        }

        log.info("Fetching prices from Kalimati Market Government website: {}", KALIMATI_URL);
        List<MarketPriceDto> prices = new ArrayList<>();

        try {
            Document doc = Jsoup.connect(KALIMATI_URL)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                    .timeout(TIMEOUT_MS)
                    .followRedirects(true)
                    .get();

            // The Kalimati website uses a table with class "table" for price data
            Elements rows = doc.select("table.table tbody tr");
            
            if (rows.isEmpty()) {
                // Fallback selector
                rows = doc.select("table tbody tr");
                log.info("Using fallback table selector, found {} rows", rows.size());
            }

            for (Element row : rows) {
                try {
                    Elements cols = row.select("td");
                    
                    // Kalimati table structure: SN, Commodity, Unit, Minimum, Maximum, Average
                    if (cols.size() >= 6) {
                        String name = cols.get(1).text().trim();
                        String unit = cols.get(2).text().trim();
                        String minStr = cols.get(3).text().trim();
                        String maxStr = cols.get(4).text().trim();
                        String avgStr = cols.get(5).text().trim();

                        // Skip empty or header-like rows
                        if (name.isEmpty() || name.equalsIgnoreCase("Commodity") || name.equals("बस्तु")) {
                            continue;
                        }

                        BigDecimal min = parsePrice(minStr);
                        BigDecimal max = parsePrice(maxStr);
                        BigDecimal avg = parsePrice(avgStr);

                        if (min != null && !name.isEmpty()) {
                            prices.add(MarketPriceDto.builder()
                                    .cropName(name)
                                    .unit(unit.isEmpty() ? "KG" : unit)
                                    .minPrice(min)
                                    .maxPrice(max != null ? max : min)
                                    .avgPrice(avg != null ? avg : min)
                                    .district("Kathmandu")
                                    .priceDate(LocalDate.now())
                                    .source(SOURCE_ID)
                                    .build());
                        }
                    }
                } catch (Exception e) {
                    log.debug("Skipping row due to parse error: {}", e.getMessage());
                }
            }

            log.info("Successfully scraped {} vegetable prices from Kalimati Market", prices.size());

        } catch (IOException e) {
            log.error("Failed to fetch prices from Kalimati: {}", e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error scraping Kalimati: {}", e.getMessage(), e);
        }

        return prices;
    }

    private BigDecimal parsePrice(String text) {
        try {
            // Remove Rs, comma, whitespace, and any non-numeric characters
            String clean = text.replaceAll("[^0-9.]", "");
            if (clean.isEmpty()) return null;
            return new BigDecimal(clean);
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public String getSourceId() {
        return SOURCE_ID;
    }
}
