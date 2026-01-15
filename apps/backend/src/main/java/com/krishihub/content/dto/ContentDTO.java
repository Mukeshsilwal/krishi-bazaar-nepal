package com.krishihub.content.dto;

import com.fasterxml.jackson.databind.JsonNode;
import com.krishihub.content.enums.ContentSeverity;
import com.krishihub.content.enums.ContentSourceType;
import com.krishihub.content.enums.ContentStatus;
import com.krishihub.content.enums.ContentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContentDTO {
    private UUID id;
    private ContentType contentType;
    private String title;
    private String summary;
    private JsonNode structuredBody;
    private List<String> supportedCrops;
    private List<String> supportedGrowthStages;
    private List<String> supportedRegions;
    private ContentSeverity severity;
    private String language;
    private ContentSourceType sourceType;
    private String sourceReference;
    private Integer version;
    private ContentStatus status;
    private List<String> tags;
    private List<UUID> linkedRuleIds;
    private UUID createdBy;
    private UUID reviewedBy;
    private java.util.Date publishedAt;
    private java.util.Date createdAt;
    private java.util.Date updatedAt;
}
