package com.krishihub.order.entity;

import com.krishihub.auth.entity.User;
import com.krishihub.shared.entity.AuditableEntity;
import com.krishihub.marketplace.entity.CropListing;
import com.krishihub.order.enums.OrderStatus;
import com.krishihub.order.enums.OrderSource;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.util.Date;
import java.util.UUID;

@Entity
@Table(name = "orders")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Determine the source of the order
    @Enumerated(EnumType.STRING)
    @Column(name = "order_source", nullable = false, length = 20)
    @Builder.Default
    private OrderSource orderSource = OrderSource.MARKETPLACE;

    // Nullable because AGRI_STORE orders don't have a single listing
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing_id")
    private CropListing listing;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer;

    // Nullable because AGRI_STORE orders might be fulfilled by system/admin, not a specific farmer user.
    // However, for Marketplace it's required. We'll enforce this in validation, not DB constraint if hybrid.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id")
    private User farmer;

    // Items for Agri Store orders. Marketplace orders might not use this (or could migrated later).
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private java.util.List<OrderItem> items = new java.util.ArrayList<>();

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal quantity;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;

    @Temporal(TemporalType.DATE)
    @Column(name = "pickup_date")
    private Date pickupDate;

    @Column(name = "pickup_location", length = 200)
    private String pickupLocation;

    @Column(columnDefinition = "TEXT")
    private String notes;
    
    // Helper to add items
    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }

    public void removeItem(OrderItem item) {
        items.remove(item);
        item.setOrder(null);
    }
}
