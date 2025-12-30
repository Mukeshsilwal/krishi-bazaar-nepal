package com.krishihub.order.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateOrderRequest {
    private String status; // CONFIRMED, PAYMENT_PENDING, PAID, READY, COMPLETED, CANCELLED
    private String pickupDate;
    private String pickupLocation;
    private String notes;
}
