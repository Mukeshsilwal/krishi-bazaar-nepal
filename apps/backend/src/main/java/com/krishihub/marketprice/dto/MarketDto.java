package com.krishihub.marketprice.dto;

import com.krishihub.marketprice.entity.Market;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarketDto {
    private UUID id;
    private String name;
    private String district;
    private String location;

    public static MarketDto fromEntity(Market market) {
        return MarketDto.builder()
                .id(market.getId())
                .name(market.getName())
                .district(market.getDistrict())
                .location(market.getLocation())
                .build();
    }
}
