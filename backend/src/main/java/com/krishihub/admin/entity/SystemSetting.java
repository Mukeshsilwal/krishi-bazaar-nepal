package com.krishihub.admin.entity;

import com.krishihub.shared.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "app_settings", indexes = {
        @Index(name = "idx_app_setting_key", columnList = "setting_key", unique = true)
})
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemSetting extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "setting_key", nullable = false, unique = true)
    private String key;

    @Column(name = "setting_value", columnDefinition = "TEXT")
    private String value;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private SettingType type;

    @Column(name = "is_public")
    private boolean isPublic;

    public enum SettingType {
        STRING,
        BOOLEAN,
        NUMBER,
        JSON
    }
}
