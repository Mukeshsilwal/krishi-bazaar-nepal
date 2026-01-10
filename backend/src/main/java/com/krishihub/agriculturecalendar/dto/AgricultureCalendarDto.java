package com.krishihub.agriculturecalendar.dto;

import com.krishihub.agriculturecalendar.model.ActivityType;
import com.krishihub.agriculturecalendar.model.CropType;
import com.krishihub.agriculturecalendar.model.NepaliMonth;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgricultureCalendarDto {
    private UUID id;
    private CropType crop;
    private NepaliMonth nepaliMonth;
    private ActivityType activityType;
    private String region;
    private String advisory;
    private boolean active;
    
    // Additional helpers for localized display if needed by frontend, 
    // but Enums already carry english/nepali names which can be exposed if serializing the whole Enum,
    // or frontend can map based on Enum name.
    // For simplicity, we send Enum names (Strings) by default.
}
