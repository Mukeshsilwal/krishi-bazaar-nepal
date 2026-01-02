package com.krishihub.disease.model;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SignalPayload {
    private UUID sourceUserId;
    private SignalType type;

    private String cropName;
    private String growthStage; // e.g. SEEDLING, VEGETATIVE

    private List<String> symptomCodes; // e.g. ["leaf_spot", "yellowing"]

    private String district;
    private Double latitude;
    private Double longitude;

    private Double temperature;
    private Double humidity;

    // Extra context
    private Map<String, Object> metadata;

    private LocalDateTime timestamp;
}
