package com.krishihub.logistics.listener;

import com.krishihub.logistics.entity.Shipment;
import com.krishihub.logistics.service.ShipmentService;
import com.krishihub.order.event.OrderPlacedEvent;
import com.krishihub.order.event.OrderStatusChangedEvent;
import com.krishihub.order.event.OrderCancelledEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class ShipmentEventListener {

    private final ShipmentService shipmentService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleOrderPlaced(OrderPlacedEvent event) {
        // Create initial shipment record
        String source = "Unknown Source";
        if (event.getOrder().getFarmer() != null) {
            com.krishihub.auth.entity.User farmer = event.getOrder().getFarmer();
            source = farmer.getName() + " (" + (farmer.getDistrict() != null ? farmer.getDistrict() : "Nepal") + ")";
        }

        String destination = "Unknown Destination";
        if (event.getOrder().getPickupLocation() != null) {
            destination = event.getOrder().getPickupLocation();
        } else if (event.getOrder().getBuyer() != null) {
            com.krishihub.auth.entity.User buyer = event.getOrder().getBuyer();
            destination = buyer.getName() + " (" + (buyer.getDistrict() != null ? buyer.getDistrict() : "Nepal") + ")";
        }

        Shipment shipment = Shipment.builder()
                .orderId(event.getOrder().getId())
                .status(Shipment.ShipmentStatus.CREATED)
                .sourceLocation(source)
                .destinationLocation(destination)
                .build();
        
        shipmentService.createShipmentForOrder(shipment);
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleOrderStatusChanged(OrderStatusChangedEvent event) {
        try {
            Shipment shipment = shipmentService.getShipmentByOrderId(event.getOrder().getId());
            
            switch (event.getNewStatus()) {
                case SHIPPED:
                    shipmentService.updateStatus(shipment.getId(), Shipment.ShipmentStatus.IN_TRANSIT);
                    break;
                case DELIVERED:
                    shipmentService.updateStatus(shipment.getId(), Shipment.ShipmentStatus.DELIVERED);
                    break;
                case CANCELLED:
                    shipmentService.updateStatus(shipment.getId(), Shipment.ShipmentStatus.CANCELLED);
                    break;
                default:
                    // Other statuses might not affect shipment directly or handled elsewhere
                    break;
            }
        } catch (RuntimeException e) {
            // Shipment might not exist for some orders or error fetching it
            // Log error or ignore if shipment creation is optional
            System.err.println("Error updating shipment for order " + event.getOrder().getId() + ": " + e.getMessage());
        }
    }
    
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleOrderCancelled(OrderCancelledEvent event) {
         try {
            Shipment shipment = shipmentService.getShipmentByOrderId(event.getOrder().getId());
            shipmentService.updateStatus(shipment.getId(), Shipment.ShipmentStatus.CANCELLED);
         } catch (RuntimeException e) {
             // Ignore if no shipment
         }
    }
}
