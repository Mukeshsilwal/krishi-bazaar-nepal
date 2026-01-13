package com.krishihub.marketprice.service.strategy;

import com.krishihub.marketprice.dto.MarketPriceDto;

public interface PriceEvaluationRule {
    void evaluate(MarketPriceDto newPrice);
}
