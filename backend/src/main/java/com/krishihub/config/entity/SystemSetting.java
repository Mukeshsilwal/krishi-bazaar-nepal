package com.krishihub.config.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "system_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemSetting {

    @Id
    @Column(name = "setting_key", nullable = false, unique = true)
    private String key;

    @Column(name = "setting_value")
    private String value;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SettingType type;

    public enum SettingType {
        STRING,
        BOOLEAN,
        NUMBER
    }
}
