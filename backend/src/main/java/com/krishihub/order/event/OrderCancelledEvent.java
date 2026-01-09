package com.krishihub.order.event;

import com.krishihub.order.entity.Order;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class OrderCancelledEvent extends ApplicationEvent {
    private final Order order;
    private final String reason;

    public OrderCancelledEvent(Object source, Order order, String reason) {
        super(source);
        this.order = order;
        this.reason = reason;
    }
}
