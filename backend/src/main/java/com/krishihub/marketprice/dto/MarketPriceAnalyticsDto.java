package com.krishihub.marketprice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketPriceAnalyticsDto {
    private String cropName;
    private BigDecimal averagePrice;
    private BigDecimal maxPrice;
    private BigDecimal minPrice;
    private String trend; // "UP", "DOWN", "STABLE"
}
