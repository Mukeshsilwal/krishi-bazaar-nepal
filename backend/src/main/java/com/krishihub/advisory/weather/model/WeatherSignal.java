package com.krishihub.advisory.weather.model;

/**
 * Weather signals represent domain-specific weather conditions
 * that trigger advisory rules
 */
public enum WeatherSignal {

    // Rain-related signals
    HEAVY_RAIN_EXPECTED("Heavy rainfall expected (>100mm in 24h)"),
    MODERATE_RAIN_EXPECTED("Moderate rainfall expected (50-100mm in 24h)"),
    LIGHT_RAIN_EXPECTED("Light rainfall expected (<50mm in 24h)"),
    FLOOD_RISK("Flood risk due to continuous heavy rainfall"),
    DROUGHT_WARNING("Prolonged dry period detected"),

    // Temperature-related signals
    HEAT_WAVE_ALERT("Extreme high temperature (>40°C)"),
    HIGH_TEMPERATURE("High temperature (35-40°C)"),
    FROST_RISK("Frost risk (temperature <5°C)"),
    COLD_WAVE_ALERT("Extreme low temperature (<10°C)"),

    // Humidity-related signals
    HIGH_HUMIDITY_RISK("Very high humidity (>85%)"),
    LOW_HUMIDITY("Low humidity (<30%)"),

    // Wind-related signals
    STORM_ALERT("Storm or high wind alert (>60 km/h)"),
    STRONG_WIND("Strong wind conditions (40-60 km/h)"),

    // Combined conditions
    HAIL_RISK("Risk of hail"),
    THUNDERSTORM_ALERT("Thunderstorm expected"),

    // Special conditions
    EXTREME_WEATHER_ALERT("Extreme weather conditions"),
    NORMAL_CONDITIONS("Normal weather conditions");

    private final String description;

    WeatherSignal(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    /**
     * Get severity level for the signal
     */
    public SignalSeverity getSeverity() {
        return switch (this) {
            case EXTREME_WEATHER_ALERT, FLOOD_RISK, STORM_ALERT, HEAT_WAVE_ALERT -> SignalSeverity.EMERGENCY;
            case HEAVY_RAIN_EXPECTED, COLD_WAVE_ALERT, THUNDERSTORM_ALERT, HAIL_RISK -> SignalSeverity.WARNING;
            case MODERATE_RAIN_EXPECTED, HIGH_TEMPERATURE, FROST_RISK, HIGH_HUMIDITY_RISK, STRONG_WIND,
                    DROUGHT_WARNING ->
                SignalSeverity.WATCH;
            default -> SignalSeverity.INFO;
        };
    }

    public enum SignalSeverity {
        INFO, // Informational
        WATCH, // Be prepared
        WARNING, // Take action
        EMERGENCY // Immediate action required
    }
}
