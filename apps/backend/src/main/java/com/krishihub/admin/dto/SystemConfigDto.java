package com.krishihub.admin.dto;

import com.krishihub.entity.SystemConfig;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemConfigDto {
    private String key;
    private String value;
    private String description;
    private String type;
    private String category;
    private boolean editable;

    public static SystemConfigDto fromEntity(SystemConfig config) {
        return SystemConfigDto.builder()
                .key(config.getKey())
                .value(config.getValue())
                .description(config.getDescription())
                .type(config.getType().name())
                .category(config.getCategory().name())
                .editable(config.isEditable())
                .build();
    }
}
