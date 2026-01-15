package com.krishihub.marketprice.service;

import com.krishihub.marketprice.dto.MarketPriceDto;
import com.krishihub.service.SystemConfigService;
import io.github.bonigarcia.wdm.WebDriverManager;
import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

/**
 * Selenium-based scraper for JavaScript-rendered vegetable price pages.
 * Uses headless Chrome to render dynamic content from RamroPatro.
 * 
 * IMPORTANT: This service requires Chrome/Chromium to be installed on the server.
 * For serverless or container deployments without Chrome, disable via:
 *   market.scraper.selenium.enabled=false
 * 
 * The system will fallback to KalimatiScraperService (HTTP-based) when this is disabled.
 */
@Service
@Slf4j
@ConditionalOnProperty(name = "market.scraper.selenium.enabled", havingValue = "true", matchIfMissing = false)
public class SeleniumScraperService implements MarketPriceDataSource {

    @Autowired
    private SystemConfigService systemConfigService;
    
    private static final String DEFAULT_URL = "https://ramropatro.com/vegetable";
    private static final String SOURCE_ID = "RAMROPATRO_SCRAPER";
    
    private boolean chromeAvailable = false;

    @PostConstruct
    public void init() {
        try {
            // Setup ChromeDriver automatically
            WebDriverManager.chromedriver().setup();
            chromeAvailable = true;
            log.info("ChromeDriver initialized via WebDriverManager");
        } catch (Exception e) {
            log.warn("ChromeDriver setup failed - Selenium scraper will be inactive: {}", e.getMessage());
            chromeAvailable = false;
        }
    }

    @Override
    public List<MarketPriceDto> fetchPrices() {
        if (!chromeAvailable) {
            log.info("Selenium scraper skipped - Chrome not available. Use KalimatiScraperService instead.");
            return new ArrayList<>();
        }
        
        String targetUrl = systemConfigService.getString("market.scraper.url", DEFAULT_URL);
        log.info("Fetching prices from {} using Selenium headless browser", targetUrl);
        
        List<MarketPriceDto> prices = new ArrayList<>();
        WebDriver driver = null;

        try {
            // Configure headless Chrome
            ChromeOptions options = new ChromeOptions();
            options.addArguments("--headless=new");
            options.addArguments("--disable-gpu");
            options.addArguments("--no-sandbox");
            options.addArguments("--disable-dev-shm-usage");
            options.addArguments("--window-size=1920,1080");
            options.addArguments("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

            driver = new ChromeDriver(options);
            driver.get(targetUrl);

            // Wait for the table to load (JavaScript rendering)
            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));
            
            // Try RamroPatro's table selector first
            try {
                wait.until(ExpectedConditions.presenceOfElementLocated(By.cssSelector("table tbody tr")));
            } catch (Exception e) {
                log.warn("Primary table selector not found, trying alternative...");
            }

            // Find all table rows
            List<WebElement> rows = driver.findElements(By.cssSelector("table tbody tr"));
            
            if (rows.isEmpty()) {
                // Fallback: try finding any table rows
                rows = driver.findElements(By.tagName("tr"));
                log.info("Using fallback selector, found {} rows", rows.size());
            }

            for (WebElement row : rows) {
                try {
                    List<WebElement> cols = row.findElements(By.tagName("td"));
                    
                    // Expect at least 5 columns: Name, Unit, Min, Max, Avg
                    if (cols.size() >= 5) {
                        String name = cols.get(0).getText().trim();
                        String unit = cols.get(1).getText().trim();
                        String minStr = cols.get(2).getText().trim();
                        String maxStr = cols.get(3).getText().trim();
                        String avgStr = cols.get(4).getText().trim();

                        // Skip header rows
                        if (name.equalsIgnoreCase("Commodity") || name.equalsIgnoreCase("बस्तु") || name.isEmpty()) {
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
                                    .priceDate(com.krishihub.common.util.DateUtil.startOfDay(com.krishihub.common.util.DateUtil.nowUtc()))
                                    .source(SOURCE_ID)
                                    .build());
                        }
                    }
                } catch (Exception e) {
                    log.debug("Skipping row due to parse error: {}", e.getMessage());
                }
            }

            log.info("Successfully scraped {} vegetable prices using Selenium", prices.size());

        } catch (Exception e) {
            log.error("Selenium scraping failed: {}", e.getMessage());
            // Don't log full stack trace - it's verbose and expected in serverless environments
        } finally {
            if (driver != null) {
                try {
                    driver.quit();
                } catch (Exception e) {
                    log.warn("Error closing WebDriver: {}", e.getMessage());
                }
            }
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

