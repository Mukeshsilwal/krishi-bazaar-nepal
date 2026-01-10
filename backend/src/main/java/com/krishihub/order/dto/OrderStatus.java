package com.krishihub.order.dto;

public enum OrderStatus {
    PENDING, // Order placed, awaiting farmer confirmation
    CONFIRMED, // Farmer confirmed the order
    READY_FOR_HARVEST, // Waiting for harvest
    HARVESTED, // Crop harvested
    PAYMENT_PENDING, // Waiting for payment
    PAID, // Payment completed
    READY, // Ready for pickup
    SHIPPED, // Order is on the way
    DELIVERED, // Order delivered to buyer
    COMPLETED, // Order completed
    CANCELLED, // Order cancelled
    FAILED // Payment or system failure
}
