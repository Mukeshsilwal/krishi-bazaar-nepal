package com.krishihub.notification.listener;

import com.krishihub.notification.dto.MessageRequest;
import com.krishihub.notification.enums.MessageType;
import com.krishihub.notification.service.NotificationOrchestrator;
import com.krishihub.order.enums.OrderStatus;
import com.krishihub.order.event.OrderCancelledEvent;
import com.krishihub.order.event.OrderPlacedEvent;
import com.krishihub.order.event.OrderStatusChangedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventListener {

    private final NotificationOrchestrator notificationOrchestrator;
    private final com.krishihub.order.repository.OrderRepository orderRepository;

    @Async
    @EventListener
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public void handleOrderPlaced(OrderPlacedEvent event) {
        orderRepository.findById(event.getOrder().getId()).ifPresent(order -> {
            // Only send SMS to farmer if farmer exists (Marketplace order)
            if (order.getFarmer() != null && order.getListing() != null) {
                String farmerMobile = order.getFarmer().getMobileNumber();
                String message = String.format(
                        "New order received for %s (%.2f %s). Order ID: %s. Login to confirm.",
                        order.getListing().getCropName(),
                        order.getQuantity(),
                        order.getListing().getUnit(),
                        order.getId());
                
                sendSms(farmerMobile, message);
            }
        });
    }

    @Async
    @EventListener
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public void handleOrderStatusChanged(OrderStatusChangedEvent event) {
        orderRepository.findById(event.getOrder().getId()).ifPresent(order -> {
            OrderStatus newStatus = event.getNewStatus();
            String recipient = null;
            String message = null;

            switch (newStatus) {
                case CONFIRMED:
                    recipient = order.getBuyer().getMobileNumber();
                    message = String.format("Your order %s has been confirmed.", order.getId());
                    break;
                case READY_FOR_HARVEST:
                    recipient = order.getBuyer().getMobileNumber();
                    message = String.format("Your order %s is being prepared for harvest.", order.getId());
                    break;
                case HARVESTED:
                    recipient = order.getBuyer().getMobileNumber();
                    message = String.format("Your order %s has been harvested.", order.getId());
                    break;
                case READY:
                    recipient = order.getBuyer().getMobileNumber();
                    message = String.format("Your order %s is ready for pickup.", order.getId());
                    break;
                case COMPLETED:
                    if (order.getFarmer() != null) {
                        recipient = order.getFarmer().getMobileNumber();
                        message = String.format("Order %s has been completed.", order.getId());
                    }
                    break;
                case CANCELLED:
                    break;
                default:
                    break;
            }

            if (recipient != null && message != null) {
                sendSms(recipient, message);
            }
        });
    }

    @Async
    @EventListener
    @Transactional(readOnly = true)
    public void handleOrderCancelled(OrderCancelledEvent event) {
        orderRepository.findById(event.getOrder().getId()).ifPresent(order -> {
            String message = String.format("Order %s has been cancelled. Reason: %s", order.getId(), event.getReason());
            if (order.getFarmer() != null) {
                sendSms(order.getFarmer().getMobileNumber(), message);
            }
            sendSms(order.getBuyer().getMobileNumber(), message);
        });
    }

    @Async
    @EventListener
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public void handlePaymentCompleted(com.krishihub.payment.event.PaymentCompletedEvent event) {
        orderRepository.findById(event.getTransaction().getOrder().getId()).ifPresent(order -> {
            String buyerMsg = "Payment successful for order " + order.getId();
            sendSms(order.getBuyer().getMobileNumber(), buyerMsg);

            if (order.getFarmer() != null) {
                String farmerMsg = "Payment received for order " + order.getId() + ". Please prepare the order.";
                sendSms(order.getFarmer().getMobileNumber(), farmerMsg);
            }
        });
    }

    private void sendSms(String to, String message) {
        try {
            notificationOrchestrator.send(MessageRequest.builder()
                    .type(MessageType.SMS)
                    .recipient(to)
                    .content(message)
                    .build());
            log.info("SMS request sent to orchestrator for {}", to);
        } catch (Exception e) {
            log.error("Failed to send SMS to {}", to, e);
        }
    }
}
