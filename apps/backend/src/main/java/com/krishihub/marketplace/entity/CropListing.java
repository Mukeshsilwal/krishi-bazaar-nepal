package com.krishihub.marketplace.entity;

import com.krishihub.auth.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.util.Date;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "crop_listings")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CropListing {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", nullable = false)
    private User farmer;

    @Column(name = "crop_name", nullable = false, length = 100)
    private String cropName;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal quantity;

    @Column(nullable = false, length = 20)
    private String unit;

    @Column(name = "price_per_unit", nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerUnit;

    @Temporal(TemporalType.DATE)
    @Column(name = "harvest_date")
    private Date harvestDate;

    @Column(name = "harvest_window")
    private Integer harvestWindow; // Number of days the crop is harvestable

    @Column(name = "daily_quantity_limit", precision = 10, scale = 2)
    private BigDecimal dailyQuantityLimit;

    @Temporal(TemporalType.TIME)
    @Column(name = "order_cutoff_time")
    private java.util.Date orderCutoffTime;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ListingStatus status = ListingStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private CropCategory category;

    @OneToMany(mappedBy = "listing", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CropImage> images = new ArrayList<>();

    @CreatedDate
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "created_at", nullable = false, updatable = false)
    private Date createdAt;

    @LastModifiedDate
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "updated_at")
    private Date updatedAt;

    public enum ListingStatus {
        ACTIVE,
        SOLD,
        EXPIRED,
        DELETED
    }

    public enum CropCategory {
        VEGETABLES,
        FRUITS,
        GRAINS,
        OTHERS,
        LIVESTOCK,
        DAIRY
    }

    public void addImage(CropImage image) {
        images.add(image);
        image.setListing(this);
    }

    public void removeImage(CropImage image) {
        images.remove(image);
        image.setListing(null);
    }
}
