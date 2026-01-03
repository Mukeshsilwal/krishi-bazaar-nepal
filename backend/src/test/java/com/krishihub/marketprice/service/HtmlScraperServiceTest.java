package com.krishihub.marketprice.service;

import com.krishihub.marketprice.dto.MarketPriceDto;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class HtmlScraperServiceTest {

    @Test
    void fetchPrices_ShouldParseRamroPatroHtmlCorrectly() {
        String html = "<html><body>" +
                "<table id='commodityDailyPrice'>" +
                "<tbody>" +
                "<tr>" +
                "<td>Tomato Big(Nepali)</td>" +
                "<td>KG</td>" +
                "<td>Rs. 40</td>" +
                "<td>Rs. 50</td>" +
                "<td>Rs. 45</td>" +
                "</tr>" +
                "<tr>" +
                "<td>Potato Red</td>" +
                "<td>KG</td>" +
                "<td>Rs. 30</td>" +
                "<td>Rs. 35</td>" +
                "<td>Rs. 32.5</td>" +
                "</tr>" +
                "</tbody>" +
                "</table>" +
                "</body></html>";

        Document doc = Jsoup.parse(html);

        // Anonymous subclass to override getDocument explicitly
        HtmlScraperService scraperService = new HtmlScraperService() {
            @Override
            protected Document getDocument(String url) throws IOException {
                return doc;
            }
        };

        List<MarketPriceDto> prices = scraperService.fetchPrices();

        assertEquals(2, prices.size());

        MarketPriceDto tomato = prices.get(0);
        assertEquals("Tomato Big", tomato.getCropName()); // Check cleaning
        assertEquals("KG", tomato.getUnit());
        assertEquals(new BigDecimal("40"), tomato.getMinPrice());
        assertEquals(new BigDecimal("50"), tomato.getMaxPrice());

        MarketPriceDto potato = prices.get(1);
        assertEquals("Potato Red", potato.getCropName());
    }
}
