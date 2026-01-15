package com.krishihub.marketprice.service;

import com.krishihub.marketprice.dto.MarketPriceDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class GovApiFetcherService implements MarketPriceDataSource {

    @Override
    public List<MarketPriceDto> fetchPrices() {
        log.info("Fetching prices from Gov API...");
        // Mock implementation for Gov API - returning empty list to rely on Scraper
        return new ArrayList<>();
    }

    @Override
    public String getSourceId() {
        return "GOV_API";
    }
}
