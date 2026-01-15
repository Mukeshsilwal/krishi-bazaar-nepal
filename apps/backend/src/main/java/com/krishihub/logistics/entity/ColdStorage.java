package com.krishihub.logistics.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.util.Date;
import java.util.UUID;

@Entity
@Table(name = "cold_storage")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ColdStorage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 255)
    private String location;

    @Column(nullable = false, length = 50)
    private String district;

    @Column(nullable = false)
    private Double capacity; // in kg

    @Column(name = "available_capacity", nullable = false)
    private Double availableCapacity;

    @Column(name = "contact_number", length = 15)
    private String contactNumber;

    @Column(name = "price_per_kg_per_day", precision = 10, scale = 2)
    private BigDecimal pricePerKgPerDay;

    @Column(name = "temperature_range", length = 50)
    private String temperatureRange;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreatedDate
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "created_at", nullable = false, updatable = false)
    private Date createdAt;
}
