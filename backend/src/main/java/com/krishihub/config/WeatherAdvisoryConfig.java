package com.krishihub.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Configuration properties for Weather Advisory system
 */
@Configuration
@ConfigurationProperties(prefix = "weather")
@Data
@Validated
public class WeatherAdvisoryConfig {

    /**
     * OpenWeatherMap configuration
     */
    private OpenWeatherMap openweathermap = new OpenWeatherMap();

    /**
     * Weather data ingestion configuration
     */
    private Ingestion ingestion = new Ingestion();

    /**
     * Advisory processing configuration
     */
    private Advisory advisory = new Advisory();

    @Data
    public static class OpenWeatherMap {
        @NotBlank(message = "OpenWeatherMap API key is required")
        private String apiKey = "demo";

        @NotBlank
        private String baseUrl = "https://api.openweathermap.org/data/2.5";

        private int timeout = 5000; // milliseconds
        private int maxRetries = 3;
    }

    @Data
    public static class Ingestion {
        /**
         * Cron expression for weather data polling
         * Default: Every hour at minute 0
         */
        @NotBlank
        private String cron = "0 0 * * * *";

        /**
         * Cache TTL in seconds
         */
        @NotNull
        private Integer cacheTtl = 3600; // 1 hour

        /**
         * Enable/disable scheduled ingestion
         */
        private boolean enabled = true;
    }

    @Data
    public static class Advisory {
        /**
         * Cron expression for advisory processing
         * Default: Every hour at minute 15 (after weather ingestion)
         */
        @NotBlank
        private String processingCron = "0 15 * * * *";

        /**
         * Enable/disable scheduled processing
         */
        private boolean enabled = true;

        /**
         * Deduplication window in hours
         */
        @NotNull
        private Integer deduplicationWindowHours = 1;

        /**
         * Maximum advisories per farmer per day
         */
        @NotNull
        private Integer maxAdvisoriesPerDay = 5;
    }
}
