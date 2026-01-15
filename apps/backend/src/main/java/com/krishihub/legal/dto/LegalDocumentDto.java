package com.krishihub.legal.dto;

import com.krishihub.legal.entity.LegalDocument;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Date;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LegalDocumentDto {

    private UUID id;
    private String type;
    private String version;
    private String titleEn;
    private String titleNe;
    private String contentEn;
    private String contentNe;
    private LocalDate effectiveDate;
    private Boolean isActive;
    private Date createdAt;
    private Date updatedAt;

    public static LegalDocumentDto fromEntity(LegalDocument entity) {
        return LegalDocumentDto.builder()
                .id(entity.getId())
                .type(entity.getType().name())
                .version(entity.getVersion())
                .titleEn(entity.getTitleEn())
                .titleNe(entity.getTitleNe())
                .contentEn(entity.getContentEn())
                .contentNe(entity.getContentNe())
                .effectiveDate(entity.getEffectiveDate())
                .isActive(entity.getIsActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
