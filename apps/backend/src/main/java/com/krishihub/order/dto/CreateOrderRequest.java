package com.krishihub.order.dto;

import jakarta.validation.constraints.DecimalMin;
import com.krishihub.order.enums.OrderSource;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOrderRequest {

    private UUID listingId; // Optional, for MARKETPLACE

    @DecimalMin(value = "0.01", message = "Quantity must be greater than 0")
    private BigDecimal quantity; // Optional, for MARKETPLACE (total quantity of listing)

    private String pickupDate; // Format: YYYY-MM-DD

    private String pickupLocation;

    private String notes;
    
    @Builder.Default
    private OrderSource orderSource = OrderSource.MARKETPLACE;
    
    private java.util.List<OrderItemDto> items;
}
