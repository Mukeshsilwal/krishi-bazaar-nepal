package com.krishihub.masterdata.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "master_items", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "category_id", "code" })
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MasterItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private MasterCategory category;

    @Column(nullable = false)
    private String code;

    @Column(nullable = false)
    private String labelEn;

    private String labelNe;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Builder.Default
    private Integer sortOrder = 0;

    @Builder.Default
    private Boolean active = true;

    private LocalDate effectiveFrom;

    private LocalDate effectiveTo;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
