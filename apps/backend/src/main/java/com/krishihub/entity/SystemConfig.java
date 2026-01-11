package com.krishihub.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "system_configs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemConfig {

    @Id
    @Column(name = "config_key", unique = true, nullable = false)
    private String key;

    @Column(name = "config_value", nullable = false)
    private String value;

    @Column(name = "description")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "data_type", nullable = false)
    private ConfigType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private ConfigCategory category;

    @Column(name = "is_editable")
    @Builder.Default
    private boolean editable = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum ConfigType {
        STRING, NUMBER, BOOLEAN, JSON
    }

    public enum ConfigCategory {
        AUTH, MARKET, LOGISTICS, SYSTEM, NOTIFICATION, UI
    }
}
