package com.krishihub.marketplace.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateListingRequest {
    private String cropName;
    private BigDecimal quantity;
    private String unit;
    private BigDecimal pricePerUnit;
    private String harvestDate;
    private Integer harvestWindow;
    private BigDecimal dailyQuantityLimit;
    private String orderCutoffTime;
    private String description;
    private String location;
    private String status; // ACTIVE, SOLD, EXPIRED
}
