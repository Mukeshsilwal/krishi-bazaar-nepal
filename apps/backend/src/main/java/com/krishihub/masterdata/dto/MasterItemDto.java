package com.krishihub.masterdata.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MasterItemDto {
    private UUID id;
    private UUID categoryId;
    private String code;
    private String labelEn;
    private String labelNe;
    private String description;
    private Integer sortOrder;
    private Boolean active;
    private java.util.Date effectiveFrom;
    private java.util.Date effectiveTo;
}
