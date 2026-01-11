package com.krishihub.advisory.context;

/**
 * Crop growth stages for advisory context
 */
public enum GrowthStage {

    LAND_PREPARATION("Land preparation and soil conditioning"),
    SEEDLING("Seedling stage - vulnerable to weather"),
    VEGETATIVE("Vegetative growth - requires consistent conditions"),
    FLOWERING("Flowering stage - critical for yield"),
    FRUITING("Fruiting/Grain filling stage"),
    MATURATION("Maturation stage - approaching harvest"),
    HARVESTING("Harvesting period"),
    POST_HARVEST("Post-harvest storage and processing"),
    UNKNOWN("Growth stage not specified");

    private final String description;

    GrowthStage(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    /**
     * Determine if this growth stage is weather-sensitive
     */
    public boolean isWeatherSensitive() {
        return this == SEEDLING || this == FLOWERING || this == FRUITING || this == HARVESTING;
    }

    /**
     * Get recommended actions for this growth stage during adverse weather
     */
    public String getWeatherProtectionAdvice() {
        return switch (this) {
            case SEEDLING -> "Protect young plants from extreme weather. Consider temporary shelter.";
            case FLOWERING -> "Critical stage - protect from heat, frost, and heavy rain to ensure pollination.";
            case FRUITING -> "Protect developing fruits/grains from weather damage.";
            case HARVESTING -> "Monitor weather closely. Delay harvest if heavy rain expected.";
            default -> "Monitor weather conditions and take appropriate precautions.";
        };
    }
}
