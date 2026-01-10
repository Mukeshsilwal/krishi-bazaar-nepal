package com.krishihub.agriculturecalendar.model;

import com.krishihub.shared.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "agriculture_calendar", indexes = {
    @Index(name = "idx_calendar_crop_month", columnList = "crop, nepali_month")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgricultureCalendarEntry extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CropType crop;

    @Enumerated(EnumType.STRING)
    @Column(name = "nepali_month", nullable = false)
    private NepaliMonth nepaliMonth;

    @Enumerated(EnumType.STRING)
    @Column(name = "activity_type", nullable = false)
    private ActivityType activityType;

    @Column(name = "region") // Optional: TERAI, HILL, MOUNTAIN, or ALL (if null/empty)
    private String region;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String advisory;

    @Column(name = "active")
    @Builder.Default
    private boolean active = true;
}
