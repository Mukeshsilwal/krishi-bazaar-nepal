package com.krishihub.order.event;

import com.krishihub.order.entity.Order;
import com.krishihub.order.dto.OrderStatus;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class OrderStatusChangedEvent extends ApplicationEvent {
    private final Order order;
    private final OrderStatus oldStatus;
    private final OrderStatus newStatus;

    public OrderStatusChangedEvent(Object source, Order order, OrderStatus oldStatus, OrderStatus newStatus) {
        super(source);
        this.order = order;
        this.oldStatus = oldStatus;
        this.newStatus = newStatus;
    }
}
