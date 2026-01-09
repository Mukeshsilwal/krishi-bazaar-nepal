package com.krishihub.notification.listener;

import com.krishihub.auth.service.SmsService;
import com.krishihub.order.dto.OrderStatus;
import com.krishihub.order.entity.Order;
import com.krishihub.order.event.OrderCancelledEvent;
import com.krishihub.order.event.OrderPlacedEvent;
import com.krishihub.order.event.OrderStatusChangedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventListener {

    private final SmsService smsService;

    @Async
    @EventListener
    public void handleOrderPlaced(OrderPlacedEvent event) {
        Order order = event.getOrder();
        String farmerMobile = order.getFarmer().getMobileNumber();
        String message = String.format(
                "New order received for %s (%.2f %s). Order ID: %s. Login to confirm.",
                order.getListing().getCropName(),
                order.getQuantity(),
                order.getListing().getUnit(),
                order.getId());
        
        sendSms(farmerMobile, message);
    }

    @Async
    @EventListener
    public void handleOrderStatusChanged(OrderStatusChangedEvent event) {
        Order order = event.getOrder();
        OrderStatus newStatus = event.getNewStatus();
        String recipient = null;
        String message = null;

        switch (newStatus) {
            case CONFIRMED:
                recipient = order.getBuyer().getMobileNumber();
                message = String.format("Your order %s has been confirmed by the farmer.", order.getId());
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
                recipient = order.getFarmer().getMobileNumber();
                message = String.format("Order %s has been completed.", order.getId());
                break;
            case CANCELLED:
                // Handled by specific event usually, but if state change happened via update:
                // Logic generic here might be tricky, relying on OrderCancelledEvent for explicit reasons
                break;
            default:
                break;
        }

        if (recipient != null && message != null) {
            sendSms(recipient, message);
        }
    }

    @Async
    @EventListener
    public void handleOrderCancelled(OrderCancelledEvent event) {
        Order order = event.getOrder();
        // Determine who cancelled? The event doesn't say "who", but usually we notify the *other* party.
        // Or we notify both/one. The service logic had:
        // "recipient = isBuyer ? farmer : buyer"
        // But here we don't know who initiated easily without adding usage context to event.
        // For now, simpler: Notify the one who *didn't* initiate? 
        // Or just notify the Farmer if Buyer cancelled, and Buyer if Farmer cancelled?
        // Let's rely on the fact that if status is cancelled, we notify the relevant party.
        // The Service logic was: 
        // String recipient = isBuyer ? order.getFarmer().getMobileNumber() : order.getBuyer().getMobileNumber();
        
        // Since we don't have 'isBuyer' in event, let's update the Event to include 'initiatorRole' or 'initiatorId' later?
        // Or just send to both for safety? 
        // "Order X has been cancelled."
        
        // BETTER: Update OrderCancelledEvent to include initiator.
        // For now, let's send to Farmer (since they lose business) and Buyer (confirmation).
        // To be safe and avoid complexity now, I will send to both.
        
        String message = String.format("Order %s has been cancelled. Reason: %s", order.getId(), event.getReason());
        sendSms(order.getFarmer().getMobileNumber(), message);
        sendSms(order.getBuyer().getMobileNumber(), message);
    }

    @Async
    @EventListener
    public void handlePaymentCompleted(com.krishihub.payment.event.PaymentCompletedEvent event) {
        Order order = event.getTransaction().getOrder();
        
        String buyerMsg = "Payment successful for order " + order.getId();
        sendSms(order.getBuyer().getMobileNumber(), buyerMsg);

        String farmerMsg = "Payment received for order " + order.getId() + ". Please prepare the order.";
        sendSms(order.getFarmer().getMobileNumber(), farmerMsg);
    }

    private void sendSms(String to, String message) {
        try {
            smsService.sendNotification(to, message);
            log.info("SMS sent to {}: {}", to, message);
        } catch (Exception e) {
            log.error("Failed to send SMS to {}", to, e);
        }
    }
}
