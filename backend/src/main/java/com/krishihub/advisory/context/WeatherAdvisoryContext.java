package com.krishihub.advisory.context;

import com.krishihub.advisory.weather.model.WeatherData;
import com.krishihub.advisory.weather.model.WeatherSignal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Weather Advisory Context
 * Aggregates all relevant information for weather advisory decision-making
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeatherAdvisoryContext {

    // Farmer information
    private UUID farmerId;
    private String farmerName;
    private String farmerPhone;
    private String farmerDistrict;
    private Double farmerLatitude;
    private Double farmerLongitude;
    private Double landSize;

    // Crop information
    private String cropType;
    private GrowthStage growthStage;
    private LocalDateTime plantingDate;
    private Integer daysAfterPlanting;

    // Weather information
    private WeatherData currentWeather;
    private List<WeatherData> forecastData;
    private List<WeatherSignal> detectedSignals;
    private WeatherSignal primarySignal;

    // Seasonal context
    private String season; // SPRING, SUMMER, MONSOON, AUTUMN, WINTER
    private Boolean isMonsoonsoon;

    // Historical patterns (for future enhancement)
    private Double averageRainfallThisMonth;
    private Double averageTemperatureThisMonth;

    // Risk assessment
    private String riskLevel; // LOW, MEDIUM, HIGH, CRITICAL
    private List<String> identifiedRisks;

    // Advisory metadata
    private LocalDateTime contextCreatedAt;
    private String contextSource;

    /**
     * Check if context is valid for advisory generation
     */
    public boolean isValid() {
        return farmerId != null
                && farmerDistrict != null
                && !detectedSignals.isEmpty()
                && currentWeather != null;
    }

    /**
     * Check if immediate action is required
     */
    public boolean requiresImmediateAction() {
        if (primarySignal == null) {
            return false;
        }

        return primarySignal.getSeverity() == WeatherSignal.SignalSeverity.EMERGENCY
                || primarySignal.getSeverity() == WeatherSignal.SignalSeverity.WARNING;
    }

    /**
     * Get context summary for logging
     */
    public String getSummary() {
        return String.format("Farmer: %s, District: %s, Crop: %s, Stage: %s, Signals: %d, Primary: %s",
                farmerName, farmerDistrict, cropType, growthStage,
                detectedSignals != null ? detectedSignals.size() : 0,
                primarySignal);
    }
}
