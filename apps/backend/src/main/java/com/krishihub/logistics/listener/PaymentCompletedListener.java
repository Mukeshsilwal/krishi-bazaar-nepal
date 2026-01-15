package com.krishihub.logistics.listener;

import com.krishihub.logistics.entity.Shipment;
import com.krishihub.logistics.repository.ShipmentRepository;
import com.krishihub.order.entity.Order;
import com.krishihub.order.repository.OrderRepository;
import com.krishihub.payment.entity.Transaction;
import com.krishihub.payment.event.PaymentCompletedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Listens for payment completion events and creates shipments automatically.
 *
 * Design Notes:
 * - This is the ONLY entry point for post-payment shipment creation.
 * - Event-driven approach ensures payment and shipment domains are decoupled.
 * - Idempotent: checks for existing shipment before creating new one.
 *
 * Business Rules:
 * - Shipment is created ONLY after payment status is COMPLETED.
 * - One shipment per order (enforced by unique constraint on orderId).
 * - Pickup/drop locations are copied from Order entity at creation time.
 *
 * Important:
 * - This listener runs AFTER payment transaction commits (TransactionPhase.AFTER_COMMIT).
 * - Failures here are logged but do NOT rollback payment transaction.
 * - Shipment creation errors are handled gracefully (buyer can retry via support).
 * - Future: Can be moved to @Async for better performance.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentCompletedListener {

    private final ShipmentRepository shipmentRepository;
    private final OrderRepository orderRepository;

    /**
     * Creates shipment automatically after successful payment.
     *
     * Idempotency:
     * - Checks if shipment already exists for orderId before creating.
     * - This prevents duplicate shipments from payment retries or duplicate events.
     * - Unique constraint on orderId provides database-level protection.
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onPaymentCompleted(PaymentCompletedEvent event) {
        try {
            Transaction transaction = event.getTransaction();
            
            // Only create shipment if payment is actually completed
            if (transaction.getPaymentStatus() != Transaction.PaymentStatus.COMPLETED) {
                log.warn("Payment not completed, skipping shipment creation for transaction: {}", transaction.getId());
                return;
            }

            Order order = transaction.getOrder();
            
            // Idempotency check: Skip if shipment already exists
            if (shipmentRepository.findByOrderId(order.getId()).isPresent()) {
                log.info("Shipment already exists for order: {}, skipping creation", order.getId());
                return;
            }

            // Extract pickup and drop locations from order
            String sourceLocation = extractSourceLocation(order);
            String destinationLocation = extractDestinationLocation(order);

            // Create shipment with CREATED status
            Shipment shipment = Shipment.builder()
                    .orderId(order.getId())
                    .buyerId(order.getBuyer().getId())
                    .sourceLocation(sourceLocation)
                    .destinationLocation(destinationLocation)
                    .status(Shipment.ShipmentStatus.CREATED)
                    .trackingCode(generateTrackingCode())
                    .build();

            shipmentRepository.save(shipment);
            
            log.info("Shipment created successfully for order: {}, tracking code: {}", 
                     order.getId(), shipment.getTrackingCode());

        } catch (Exception e) {
            // Log error but don't throw - we don't want to rollback payment
            log.error("Failed to create shipment for payment event: {}", event.getTransaction().getId(), e);
        }
    }

    /**
     * Extracts source location from order (farmer's location or listing location).
     */
    private String extractSourceLocation(Order order) {
        if (order.getFarmer() != null) {
            com.krishihub.auth.entity.User farmer = order.getFarmer();
            String district = farmer.getDistrict() != null ? farmer.getDistrict() : "Nepal";
            String ward = farmer.getWard() != null ? ", Ward " + farmer.getWard() : "";
            return farmer.getName() + " (" + district + ward + ")";
        }
        
        if (order.getListing() != null && order.getListing().getLocation() != null) {
            return order.getListing().getLocation();
        }
        
        return "Source Location Not Specified";
    }

    /**
     * Extracts destination location from order (buyer's pickup location or address).
     */
    private String extractDestinationLocation(Order order) {
        // First priority: pickup location specified in order
        if (order.getPickupLocation() != null && !order.getPickupLocation().isEmpty()) {
            return order.getPickupLocation();
        }
        
        // Second priority: buyer's address
        if (order.getBuyer() != null) {
            com.krishihub.auth.entity.User buyer = order.getBuyer();
            String district = buyer.getDistrict() != null ? buyer.getDistrict() : "Nepal";
            String ward = buyer.getWard() != null ? ", Ward " + buyer.getWard() : "";
            return buyer.getName() + " (" + district + ward + ")";
        }
        
        return "Destination Location Not Specified";
    }

    /**
     * Generates unique tracking code for customer tracking.
     *
     * Format: TRK-XXXXXXXX (8 random uppercase alphanumeric characters)
     */
    private String generateTrackingCode() {
        return "TRK-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
