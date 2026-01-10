package com.krishihub.order.dto;

import com.krishihub.agristore.dto.AgriProductDTO;
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
public class OrderItemDto {
    private UUID id;
    private UUID agriProductId;
    private AgriProductDTO agriProduct; // For response
    private BigDecimal quantity;
    private BigDecimal pricePerUnit;
    private BigDecimal totalPrice;
}
