package com.krishihub.advisory.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "advisory_rules")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdvisoryRule {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "rule_group_id")
    private UUID ruleGroupId;

    @Column(nullable = false)
    private String name;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private com.krishihub.advisory.model.RuleDefinition definition;

    @Column(nullable = false)
    private String status; // "ACTIVE", "DRAFT", "ARCHIVED"

    @Column(name = "rule_type")
    private String ruleType; // "WEATHER", "DISEASE", "GENERAL"

    @Column(name = "is_active")
    private boolean isActive;

    @Column(nullable = false)
    private Integer version;

    private Integer priority;

    @Column(name = "effective_from")
    @Temporal(TemporalType.TIMESTAMP)
    private java.util.Date effectiveFrom;

    @Column(name = "effective_to")
    @Temporal(TemporalType.TIMESTAMP)
    private java.util.Date effectiveTo;

    @Column(name = "created_by")
    private UUID createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private java.util.Date createdAt;
}
