package com.krishihub.marketprice.service;

import com.krishihub.marketprice.dto.MarketPriceDto;
import java.util.List;

public interface MarketPriceDataSource {
    List<MarketPriceDto> fetchPrices();

    String getSourceId();
}
