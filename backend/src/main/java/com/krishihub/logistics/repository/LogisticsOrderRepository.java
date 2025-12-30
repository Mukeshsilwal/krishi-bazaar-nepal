package com.krishihub.logistics.repository;

import com.krishihub.logistics.entity.LogisticsOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LogisticsOrderRepository extends JpaRepository<LogisticsOrder, UUID> {
    Optional<LogisticsOrder> findByOrderId(UUID orderId);
    List<LogisticsOrder> findByStatus(LogisticsOrder.LogisticsStatus status);
}
