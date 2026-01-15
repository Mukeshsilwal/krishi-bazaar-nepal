package com.krishihub.legal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateLegalDocumentRequest {

    @NotBlank(message = "Document type is required")
    private String type;

    @NotBlank(message = "Version is required")
    private String version;

    @NotBlank(message = "English title is required")
    private String titleEn;

    @NotBlank(message = "Nepali title is required")
    private String titleNe;

    @NotBlank(message = "English content is required")
    private String contentEn;

    @NotBlank(message = "Nepali content is required")
    private String contentNe;

    @NotNull(message = "Effective date is required")
    private LocalDate effectiveDate;

    private Boolean isActive;
}
