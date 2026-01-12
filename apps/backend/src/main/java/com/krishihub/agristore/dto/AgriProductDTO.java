package com.krishihub.agristore.dto;

import com.krishihub.agristore.entity.AgriProduct.AgriProductCategory;
import com.krishihub.agristore.entity.AgriProduct.AgriProductUnit;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgriProductDTO {
    private UUID id;
    private String name;
    private AgriProductCategory category;
    private String description;
    private String brand;
    private BigDecimal price;
    private AgriProductUnit unit;
    private Integer stockQuantity;
    private Boolean isActive;
    private String imageUrl;
}
