package com.krishihub.order.validator;

import com.krishihub.order.enums.OrderStatus;
import com.krishihub.shared.exception.BadRequestException;
import org.springframework.stereotype.Component;

import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

@Component
public class OrderStateValidator {

    private static final Map<OrderStatus, Set<OrderStatus>> ALLOWED_TRANSITIONS = Map.ofEntries(
            Map.entry(OrderStatus.PENDING, EnumSet.of(OrderStatus.CONFIRMED, OrderStatus.PAYMENT_PENDING, OrderStatus.CANCELLED, OrderStatus.FAILED)),
            Map.entry(OrderStatus.CONFIRMED, EnumSet.of(OrderStatus.READY_FOR_HARVEST, OrderStatus.READY, OrderStatus.PAYMENT_PENDING, OrderStatus.CANCELLED)),
            Map.entry(OrderStatus.READY_FOR_HARVEST, EnumSet.of(OrderStatus.HARVESTED, OrderStatus.CANCELLED)),
            Map.entry(OrderStatus.HARVESTED, EnumSet.of(OrderStatus.READY, OrderStatus.CANCELLED)),
            Map.entry(OrderStatus.READY, EnumSet.of(OrderStatus.PAYMENT_PENDING, OrderStatus.PAID, OrderStatus.COMPLETED, OrderStatus.SHIPPED, OrderStatus.CANCELLED)),
            Map.entry(OrderStatus.PAYMENT_PENDING, EnumSet.of(OrderStatus.PAID, OrderStatus.CANCELLED, OrderStatus.FAILED)),
            Map.entry(OrderStatus.PAID, EnumSet.of(OrderStatus.SHIPPED, OrderStatus.READY, OrderStatus.COMPLETED, OrderStatus.CANCELLED)),
            Map.entry(OrderStatus.SHIPPED, EnumSet.of(OrderStatus.DELIVERED, OrderStatus.COMPLETED, OrderStatus.CANCELLED)),
            Map.entry(OrderStatus.DELIVERED, EnumSet.of(OrderStatus.COMPLETED)),
            Map.entry(OrderStatus.COMPLETED, EnumSet.noneOf(OrderStatus.class)),
            Map.entry(OrderStatus.CANCELLED, EnumSet.noneOf(OrderStatus.class)),
            Map.entry(OrderStatus.FAILED, EnumSet.noneOf(OrderStatus.class))
    );

    public void validateTransition(OrderStatus currentStatus, OrderStatus newStatus) {
        if (currentStatus == newStatus) {
            return;
        }

        Set<OrderStatus> allowed = ALLOWED_TRANSITIONS.getOrDefault(currentStatus, EnumSet.noneOf(OrderStatus.class));
        if (!allowed.contains(newStatus)) {
            throw new BadRequestException(
                    String.format("Invalid order status transition from %s to %s", currentStatus, newStatus));
        }
    }
}
