package com.krishihub.knowledge.source;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "knowledge_sources")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KnowledgeSource {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private String organization;

    @Column(nullable = false)
    private String url;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SourceType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SourceStatus status;

    @Column(nullable = false)
    private int trustScore; // 1-100

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "license_type")
    private String licenseType;

    @Column(name = "allowed_usage")
    private String allowedUsage;

    // JSON configuration for specific fetching logic (e.g. RSS URL, API keys)
    @Column(columnDefinition = "TEXT")
    private String configJson;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Column(name = "last_synced_at")
    private LocalDateTime lastSyncedAt;

    public enum SourceType {
        RSS_FEED,
        REST_API,
        MANUAL_UPLOAD
    }

    public enum SourceStatus {
        ACTIVE,
        SUSPENDED,
        PENDING_APPROVAL
    }
}
