package com.krishihub.logistics.service;

import com.krishihub.logistics.entity.Shipment;
import com.krishihub.logistics.repository.ShipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final com.krishihub.order.repository.OrderRepository orderRepository;

    public Shipment createShipmentForOrder(Shipment shipment) {
        if (shipment.getTrackingCode() == null) {
            shipment.setTrackingCode(generateTrackingCode());
        }
        return shipmentRepository.save(shipment);
    }

    public org.springframework.data.domain.Page<Shipment> getAllShipments(org.springframework.data.domain.Pageable pageable) {
        return shipmentRepository.findAll(pageable);
    }

    public Shipment getShipmentByOrderId(UUID orderId) {
        Shipment shipment = shipmentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Shipment not found for order: " + orderId));
        
        validateShipmentAccess(shipment);
        return shipment;
    }

    public Shipment getShipmentByTrackingCode(String trackingCode) {
        // Public access via tracking code is allowed (or could be restricted, but usually tracking code is the key)
        return shipmentRepository.findByTrackingCode(trackingCode)
                .orElseThrow(() -> new RuntimeException("Shipment not found with tracking code: " + trackingCode));
    }

    @Transactional
    public void updateStatus(UUID shipmentId, Shipment.ShipmentStatus status) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new RuntimeException("Shipment not found"));
        
        shipment.setStatus(status);
        shipment.setLastUpdated(com.krishihub.common.util.DateUtil.nowUtc());

        if (status == Shipment.ShipmentStatus.DELIVERED) {
            shipment.setDeliveryTime(com.krishihub.common.util.DateUtil.nowUtc());
        }
        
        shipmentRepository.save(shipment);
    }

    private void validateShipmentAccess(Shipment shipment) {
        UUID currentUserId = com.krishihub.common.context.UserContextHolder.getUserId();
        // Skip validation if admin or system internal call (UserContext might be empty or specific role)
        // For simplicity, we assume generic UserContextHolder provides methods to check roles or we rely on explicit user ID check.
        // If currentUserId is null (maybe internal system call), we might allow. But for API calls it shouldn't be null if secured.
        if (currentUserId == null) return; 

        // Check if user is Admin (Need a way to check role from context, or assume Service is behind Controller @PreAuthorize for Admin)
        // But this method is called by getShipmentByOrderId which is open to users.
        // We defer to SecurityContext or helper.
        // Assuming simple ID check for now. Secure enough for basic constraints.
        
        // Fetch order to check participants
        com.krishihub.order.entity.Order order = orderRepository.findById(shipment.getOrderId())
            .orElseThrow(() -> new RuntimeException("Order not found"));

        boolean isBuyer = order.getBuyer().getId().equals(currentUserId);
        boolean isFarmer = order.getFarmer() != null && order.getFarmer().getId().equals(currentUserId);
        
        // Authorization Note: Admin role check removed - now handled at controller level via @PreAuthorize
        // Controller endpoints use LOGISTICS:READ or LOGISTICS:MANAGE permissions
        // boolean isAdmin = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication()
        //     .getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isBuyer && !isFarmer) {
             throw new org.springframework.security.access.AccessDeniedException("You are not authorized to view this shipment");
        }
    }

    private String generateTrackingCode() {
        return "TRK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
