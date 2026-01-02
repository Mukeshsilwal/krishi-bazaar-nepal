package com.krishihub.logistics.service;

import com.krishihub.logistics.entity.LogisticsOrder;
import com.krishihub.logistics.repository.LogisticsOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LogisticsService {

    private final LogisticsOrderRepository logisticsOrderRepository;

    public LogisticsOrder bookLogistics(UUID userId, LogisticsOrder order) {
        order.setFarmerId(userId);
        order.setStatus(LogisticsOrder.LogisticsStatus.PENDING);
        // Mock auto-assignment logic
        assignDriver(order);
        return logisticsOrderRepository.save(order);
    }

    private void assignDriver(LogisticsOrder order) {
        // In a real system, this would find nearest driver
        order.setStatus(LogisticsOrder.LogisticsStatus.ASSIGNED);
        order.setDriverName("Ram Bahadur (Auto-Assigned)");
        order.setDriverMobile("9800000000");
        order.setPickupTime(LocalDateTime.now().plusHours(2));
    }

    public LogisticsOrder getLogisticsStatus(UUID orderId) {
        return logisticsOrderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Logistics order not found for order: " + orderId));
    }

    public void updateStatus(UUID id, LogisticsOrder.LogisticsStatus status) {
        LogisticsOrder order = logisticsOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Logistics order not found"));
        order.setStatus(status);
        if (status == LogisticsOrder.LogisticsStatus.DELIVERED) {
            order.setDeliveryTime(LocalDateTime.now());
        }
        logisticsOrderRepository.save(order);
    }
}
