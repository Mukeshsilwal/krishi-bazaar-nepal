package com.krishihub.masterdata.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

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

    @Temporal(TemporalType.DATE)
    private java.util.Date effectiveFrom;

    @Temporal(TemporalType.DATE)
    private java.util.Date effectiveTo;

    @CreationTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    private java.util.Date createdAt;

    @UpdateTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    private java.util.Date updatedAt;
}
