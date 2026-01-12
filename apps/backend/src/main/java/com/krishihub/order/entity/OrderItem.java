package com.krishihub.order.entity;

import com.krishihub.agristore.entity.AgriProduct;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "order_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    // For Agri Store, we link to AgriProduct. 
    // For Marketplace, the link is actually on the Order itself (Order -> CropListing) for now, 
    // OR we could potentially move CropListing here too if we wanted multi-item marketplace orders, 
    // but the strict rules say ONLY AgriStore reuse order system. Marketplace is 1:1 listing.
    // So this is nullable.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agri_product_id")
    private AgriProduct agriProduct;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal quantity;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerUnit;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;
}
