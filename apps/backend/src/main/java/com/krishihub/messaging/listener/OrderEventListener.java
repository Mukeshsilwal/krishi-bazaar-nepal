package com.krishihub.messaging.listener;

import com.krishihub.messaging.service.MessagingService;
import com.krishihub.order.entity.Order;
import com.krishihub.order.event.OrderPlacedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderEventListener {

    private final MessagingService messagingService;

    @Async
    @EventListener
    public void handleOrderPlaced(OrderPlacedEvent event) {
        Order order = event.getOrder();
        if (order.getFarmer() != null) {
            log.info("Creating conversation for Order {} between Buyer {} and Farmer {}", 
                    order.getId(), order.getBuyer().getId(), order.getFarmer().getId());
            messagingService.getOrCreateDirectConversation(order.getBuyer(), order.getFarmer());
        }
    }
}
