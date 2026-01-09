package com.krishihub.marketprice.service;

import com.krishihub.marketprice.dto.MarketPriceDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class HtmlScraperService implements MarketPriceDataSource {

    private static final String TARGET_URL = "https://ramropatro.com/vegetable";

    @Override
    public List<MarketPriceDto> fetchPrices() {
        log.info("Scraping prices from HTML source: {}", TARGET_URL);
        List<MarketPriceDto> prices = new ArrayList<>();

        try {
            Document doc = getDocument(TARGET_URL);

            // Select rows from the specific table ID identified
            Elements rows = doc.select("table#commodityDailyPrice tbody tr");

            if (rows.isEmpty()) {
                log.warn("No rows found with selector 'table#commodityDailyPrice tbody tr'. Trying generic selector.");
                rows = doc.select("table tr");
            }

            for (Element row : rows) {
                Elements cols = row.select("td");
                // We expect at least 5 columns: Name, Unit, Min, Max, Avg
                if (cols.size() >= 5) {
                    try {
                        String name = cols.get(0).text().trim(); // "Tomato Big(Nepali)"
                        String unit = cols.get(1).text().trim(); // "KG"
                        String minStr = cols.get(2).text().trim();
                        String maxStr = cols.get(3).text().trim();
                        String avgStr = cols.get(4).text().trim();

                        // Skip header rows if they somehow got in (usually wouldn't with tbody)
                        if (name.equalsIgnoreCase("Commodity"))
                            continue;

                        BigDecimal min = parsePrice(minStr);
                        BigDecimal max = parsePrice(maxStr);
                        BigDecimal avg = parsePrice(avgStr);

                        if (min != null) {
                            prices.add(MarketPriceDto.builder()
                                    .cropName(name)
                                    .unit(unit)
                                    .minPrice(min)
                                    .maxPrice(max)
                                    .avgPrice(avg)
                                    .district("Kathmandu") // RamroPatro usually defaults to Kalimati/Kathmandu
                                    .priceDate(LocalDate.now())
                                    .source(getSourceId())
                                    .build());
                        }
                    } catch (Exception e) {
                        log.debug("Skipping row due to parse error: {}", e.getMessage());
                    }
                }
            }

            log.info("Successfully fetched {} prices from RamroPatro", prices.size());

        } catch (IOException e) {
            log.error("Failed to scrape HTML from {}: {}", TARGET_URL, e.getMessage());
        }

        return prices;
    }

    protected Document getDocument(String url) throws IOException {
        return Jsoup.connect(url)
                .userAgent(
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
                .timeout(10000)
                .get();
    }

    // cleanName method removed to preserve raw data as per user request

    private BigDecimal parsePrice(String text) {
        try {
            // Remove Rs, comma, whitespace
            String clean = text.replaceAll("[^0-9.]", "");
            if (clean.isEmpty())
                return null;
            return new BigDecimal(clean);
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public String getSourceId() {
        return "RAMROPATRO_SCRAPER";
    }
}
