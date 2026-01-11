package com.krishihub.content.entity;

import com.fasterxml.jackson.databind.JsonNode;
import com.krishihub.content.enums.ContentSeverity;
import com.krishihub.content.enums.ContentSourceType;
import com.krishihub.content.enums.ContentStatus;
import com.krishihub.content.enums.ContentType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "contents", indexes = {
        @Index(name = "idx_content_type", columnList = "contentType"),
        @Index(name = "idx_content_status", columnList = "status"),
        @Index(name = "idx_content_region", columnList = "supportedRegions")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Content {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContentType contentType;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private JsonNode structuredBody;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(columnDefinition = "text[]")
    private List<String> supportedCrops;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(columnDefinition = "text[]")
    private List<String> supportedGrowthStages;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(columnDefinition = "text[]")
    private List<String> supportedRegions;

    @Enumerated(EnumType.STRING)
    private ContentSeverity severity;

    @Column(nullable = false)
    private String language; // e.g., "en", "ne"

    @Enumerated(EnumType.STRING)
    private ContentSourceType sourceType;

    private String sourceReference; // URL or Doc Ref

    @Column(nullable = false)
    private Integer version;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContentStatus status;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(columnDefinition = "text[]")
    private List<String> tags;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(columnDefinition = "uuid[]")
    private List<UUID> linkedRuleIds;

    private UUID createdBy;
    private UUID reviewedBy;

    private LocalDateTime publishedAt;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
