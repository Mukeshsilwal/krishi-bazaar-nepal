package com.krishihub.order.service.strategy;

import com.krishihub.auth.entity.User;
import com.krishihub.order.dto.CreateOrderRequest;
import com.krishihub.order.dto.OrderSource;
import com.krishihub.order.entity.Order;

public interface OrderProcessingStrategy {
    OrderSource getOrderSource();
    Order createOrder(User buyer, CreateOrderRequest request);
    void handlePaymentCompletion(Order order);
    void handleOrderCancellation(Order order);
}
