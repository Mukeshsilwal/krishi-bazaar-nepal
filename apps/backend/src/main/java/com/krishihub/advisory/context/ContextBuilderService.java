package com.krishihub.advisory.context;

import com.krishihub.advisory.weather.WeatherIngestionService;
import com.krishihub.advisory.weather.WeatherSignalDetector;
import com.krishihub.advisory.weather.model.WeatherData;
import com.krishihub.advisory.weather.model.WeatherSignal;
import com.krishihub.auth.entity.User;
import com.krishihub.auth.repository.UserRepository;
import com.krishihub.marketplace.entity.CropListing;
import com.krishihub.marketplace.repository.CropListingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;


import java.util.*;
import java.util.stream.Collectors;

/**
 * Service to build Weather Advisory Context
 * Aggregates farmer profile, crop data, and weather information
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ContextBuilderService {

    private final UserRepository userRepository;
    private final CropListingRepository cropListingRepository;
    private final WeatherIngestionService weatherIngestionService;
    private final WeatherSignalDetector signalDetector;

    /**
     * Build context for a specific farmer
     */
    public Optional<WeatherAdvisoryContext> buildContextForFarmer(UUID farmerId) {
        log.debug("Building weather advisory context for farmer: {}", farmerId);

        // Get farmer information
        Optional<User> userOpt = userRepository.findById(farmerId);
        if (userOpt.isEmpty()) {
            log.warn("Farmer not found: {}", farmerId);
            return Optional.empty();
        }

        User farmer = userOpt.get();

        // Get farmer's crops
        List<CropListing> crops = cropListingRepository.findByFarmerId(farmerId);
        if (crops.isEmpty()) {
            log.debug("No crops found for farmer: {}. Building context with farmer data only.", farmerId);
        }

        // Get weather data for farmer's district
        String district = farmer.getDistrict();
        if (district == null || district.isBlank()) {
            log.warn("Farmer {} has no district information", farmerId);
            return Optional.empty();
        }

        Optional<WeatherData> currentWeather = weatherIngestionService.getCurrentWeather(district);
        if (currentWeather.isEmpty()) {
            log.warn("No weather data available for district: {}", district);
            return Optional.empty();
        }

        // Get forecast data
        List<WeatherData> forecast = weatherIngestionService.getForecast(district, 48);

        // Detect weather signals
        List<WeatherSignal> signals = signalDetector.detectSignals(currentWeather.get());
        WeatherSignal primarySignal = signalDetector.getHighestSeveritySignal(signals);

        // Build context for primary crop (or first crop)
        CropListing primaryCrop = crops.isEmpty() ? null : crops.get(0);

        WeatherAdvisoryContext context = WeatherAdvisoryContext.builder()
                .farmerId(farmerId)
                .farmerName(farmer.getName())
                .farmerPhone(farmer.getMobileNumber())
                .farmerDistrict(district)
                .landSize(farmer.getLandSize() != null ? farmer.getLandSize().doubleValue() : null)
                .cropType(primaryCrop != null ? primaryCrop.getCropName() : "GENERAL")
                .growthStage(determineGrowthStage(primaryCrop))
                .plantingDate(primaryCrop != null ? primaryCrop.getCreatedAt() : null)
                .daysAfterPlanting(primaryCrop != null ? calculateDaysAfterPlanting(primaryCrop.getCreatedAt()) : null)
                .currentWeather(currentWeather.get())
                .forecastData(forecast)
                .detectedSignals(signals)
                .primarySignal(primarySignal)
                .season(determineSeason())
                .isMonsoonsoon(isMonsoonsoon())
                .riskLevel(assessRiskLevel(signals, primarySignal))
                .identifiedRisks(identifyRisks(signals, primaryCrop))
                .contextCreatedAt(com.krishihub.common.util.DateUtil.nowUtc())
                .contextSource("ContextBuilderService")
                .build();

        log.info("Built context for farmer {}: {}", farmerId, context.getSummary());

        return Optional.of(context);
    }

    /**
     * Build contexts for all farmers in a district
     */
    public List<WeatherAdvisoryContext> buildContextsForDistrict(String district) {
        log.info("Building contexts for all farmers in district: {}", district);

        List<User> farmers = userRepository.findByDistrictAndRole(district,
                com.krishihub.auth.entity.User.UserRole.FARMER);

        return farmers.stream()
                .map(farmer -> buildContextForFarmer(farmer.getId()))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toList());
    }

    /**
     * Build contexts for farmers with specific crop
     */
    public List<WeatherAdvisoryContext> buildContextsForCrop(String cropName) {
        log.info("Building contexts for farmers growing: {}", cropName);

        List<CropListing> listings = cropListingRepository.findByCropNameIgnoreCase(cropName);

        return listings.stream()
                .map(listing -> buildContextForFarmer(listing.getFarmer().getId()))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toList());
    }

    /**
     * Build contexts for all farmers affected by weather signals
     */
    public List<WeatherAdvisoryContext> buildContextsForWeatherSignals(List<WeatherSignal> signals) {
        log.info("Building contexts for farmers affected by signals: {}", signals);

        // Get all districts with these signals
        Map<String, List<WeatherSignal>> districtSignals = weatherIngestionService.getAllWeatherSignals();

        List<WeatherAdvisoryContext> contexts = new ArrayList<>();

        for (Map.Entry<String, List<WeatherSignal>> entry : districtSignals.entrySet()) {
            String district = entry.getKey();
            List<WeatherSignal> districtSignalList = entry.getValue();

            // Check if any of the target signals are present
            boolean hasTargetSignal = districtSignalList.stream()
                    .anyMatch(signals::contains);

            if (hasTargetSignal) {
                contexts.addAll(buildContextsForDistrict(district));
            }
        }

        log.info("Built {} contexts for weather signals", contexts.size());

        return contexts;
    }

    /**
     * Determine growth stage from crop listing
     */
    private GrowthStage determineGrowthStage(CropListing crop) {
        if (crop == null) {
            return GrowthStage.UNKNOWN;
        }

        // Simple heuristic based on days after planting
        // In production, this should be based on actual crop data
        int daysAfterPlanting = calculateDaysAfterPlanting(crop.getCreatedAt());

        // Example for rice (adjust per crop type)
        if (daysAfterPlanting < 15) {
            return GrowthStage.SEEDLING;
        } else if (daysAfterPlanting < 60) {
            return GrowthStage.VEGETATIVE;
        } else if (daysAfterPlanting < 90) {
            return GrowthStage.FLOWERING;
        } else if (daysAfterPlanting < 120) {
            return GrowthStage.FRUITING;
        } else if (daysAfterPlanting < 140) {
            return GrowthStage.MATURATION;
        } else {
            return GrowthStage.HARVESTING;
        }
    }

    /**
     * Calculate days after planting
     */
    private int calculateDaysAfterPlanting(java.util.Date plantingDate) {
        if (plantingDate == null) {
            return 0;
        }
        long diffInMillies = Math.abs(com.krishihub.common.util.DateUtil.nowUtc().getTime() - plantingDate.getTime());
        return (int) java.util.concurrent.TimeUnit.DAYS.convert(diffInMillies, java.util.concurrent.TimeUnit.MILLISECONDS);
    }

    /**
     * Determine current season
     */
    private String determineSeason() {
        java.util.Calendar cal = java.util.Calendar.getInstance();
        cal.setTime(com.krishihub.common.util.DateUtil.nowUtc());
        int month = cal.get(java.util.Calendar.MONTH) + 1; // Calendar.MONTH is 0-indexed

        return switch (month) {
            case 3, 4, 5 -> "SPRING";
            case 6, 7, 8 -> "MONSOON";
            case 9, 10, 11 -> "AUTUMN";
            default -> "WINTER";
        };
    }

    /**
     * Check if currently in monsoon season
     */
    private boolean isMonsoonsoon() {
        java.util.Calendar cal = java.util.Calendar.getInstance();
        cal.setTime(com.krishihub.common.util.DateUtil.nowUtc());
        int month = cal.get(java.util.Calendar.MONTH) + 1; // Calendar.MONTH is 0-indexed
        return month >= 6 && month <= 8;
    }

    /**
     * Assess risk level based on signals
     */
    private String assessRiskLevel(List<WeatherSignal> signals, WeatherSignal primarySignal) {
        if (primarySignal == null) {
            return "LOW";
        }

        return switch (primarySignal.getSeverity()) {
            case EMERGENCY -> "CRITICAL";
            case WARNING -> "HIGH";
            case WATCH -> "MEDIUM";
            default -> "LOW";
        };
    }

    /**
     * Identify specific risks based on signals and crop
     */
    private List<String> identifyRisks(List<WeatherSignal> signals, CropListing crop) {
        List<String> risks = new ArrayList<>();

        for (WeatherSignal signal : signals) {
            switch (signal) {
                case HEAVY_RAIN_EXPECTED, FLOOD_RISK -> risks.add("Waterlogging and flood damage");
                case HEAT_WAVE_ALERT, HIGH_TEMPERATURE -> risks.add("Heat stress and crop wilting");
                case FROST_RISK, COLD_WAVE_ALERT -> risks.add("Frost damage to plants");
                case HIGH_HUMIDITY_RISK -> risks.add("Fungal disease outbreak");
                case STORM_ALERT, STRONG_WIND -> risks.add("Physical crop damage from wind");
                case DROUGHT_WARNING -> risks.add("Water stress and reduced yield");
                case THUNDERSTORM_ALERT -> risks.add("Lightning and hail damage");
                case HAIL_RISK -> risks.add("Hail damage to crops");
            }
        }

        // Add crop-specific risks
        if (crop != null) {
            GrowthStage stage = determineGrowthStage(crop);
            if (stage.isWeatherSensitive()) {
                risks.add("Critical growth stage - increased vulnerability");
            }
        }

        return risks;
    }
}
