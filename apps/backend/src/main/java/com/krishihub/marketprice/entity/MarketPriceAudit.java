package com.krishihub.marketprice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "market_price_audit")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketPriceAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "price_id")
    private UUID priceId;

    @Column(name = "action", length = 50)
    private String action; // INGEST, UPDATE, DELETE, OVERRIDE

    @Column(name = "old_value", precision = 10, scale = 2)
    private BigDecimal oldValue;

    @Column(name = "new_value", precision = 10, scale = 2)
    private BigDecimal newValue;

    @Column(name = "user_id")
    private UUID userId; // Null for system actions

    @CreatedDate
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "created_at", nullable = false, updatable = false)
    private java.util.Date createdAt;
}
