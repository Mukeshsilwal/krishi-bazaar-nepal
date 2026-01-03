package com.krishihub.marketprice.service;

import com.krishihub.marketprice.dto.MarketPriceDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@Slf4j
public class PriceValidatorService {

    public boolean isValid(MarketPriceDto price) {
        if (price == null)
            return false;

        // 1. Check for negative or zero prices
        if (isInvalidPrice(price.getMinPrice()) ||
                isInvalidPrice(price.getMaxPrice()) ||
                isInvalidPrice(price.getAvgPrice())) {
            log.warn("Invalid price detected for crop: {}", price.getCropName());
            return false;
        }

        // 2. Check logical consistency (min <= avg <= max)
        // Use compareTo for BigDecimal
        if (price.getMinPrice().compareTo(price.getMaxPrice()) > 0) {
            log.warn("Min price greater than max price for crop: {}", price.getCropName());
            return false;
        }

        return true;
    }

    private boolean isInvalidPrice(BigDecimal price) {
        return price == null || price.compareTo(BigDecimal.ZERO) <= 0;
    }
}
