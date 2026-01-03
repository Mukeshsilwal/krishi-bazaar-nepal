package com.krishihub.order.repository;

import com.krishihub.order.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findByBuyerId(UUID buyerId);

    List<Order> findByFarmerId(UUID farmerId);

    List<Order> findTop5ByBuyerIdOrderByCreatedAtDesc(UUID buyerId);

    long countByBuyerId(UUID buyerId);

    Page<Order> findByBuyerId(UUID buyerId, Pageable pageable);

    Page<Order> findByFarmerId(UUID farmerId, Pageable pageable);

    Page<Order> findByBuyerIdAndStatus(UUID buyerId, Order.OrderStatus status, Pageable pageable);

    Page<Order> findByFarmerIdAndStatus(UUID farmerId, Order.OrderStatus status, Pageable pageable);

    Page<Order> findByBuyerIdOrFarmerId(UUID buyerId, UUID farmerId, Pageable pageable);

    @Query("SELECT o FROM Order o WHERE o.listing.id = :listingId ORDER BY o.createdAt DESC")
    List<Order> findByListingId(@Param("listingId") UUID listingId);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.listing.id = :listingId AND o.status NOT IN ('CANCELLED')")
    long countActiveOrdersByListingId(@Param("listingId") UUID listingId);

    boolean existsByIdAndBuyerId(UUID id, UUID buyerId);

    boolean existsByIdAndFarmerId(UUID id, UUID farmerId);

    @Query("SELECT SUM(o.quantity) FROM Order o WHERE o.listing.id = :listingId AND o.pickupDate = :pickupDate AND o.status NOT IN ('CANCELLED')")
    BigDecimal sumQuantityByListingIdAndPickupDate(@Param("listingId") UUID listingId,
                                                   @Param("pickupDate") LocalDate pickupDate);
}
