package com.krishihub.marketprice.dto;

import com.krishihub.marketprice.entity.MarketPrice;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketPriceDto {
    private UUID id;
    private String cropName;
    private String cropCode;
    private String district;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private BigDecimal avgPrice;
    private String unit;
    private LocalDate priceDate;
    private String source;
    private String imageUrl;

    public static MarketPriceDto fromEntity(MarketPrice price) {
        return MarketPriceDto.builder()
                .id(price.getId())
                .cropName(price.getCropName())
                .cropCode(price.getCropCode())
                .district(price.getDistrict())
                .minPrice(price.getMinPrice())
                .maxPrice(price.getMaxPrice())
                .avgPrice(price.getAvgPrice())
                .unit(price.getUnit())
                .priceDate(price.getPriceDate())
                .source(price.getSource())
                .build();
    }
}
