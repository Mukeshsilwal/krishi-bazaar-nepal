package com.krishihub.config.properties;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;

/**
 * Weather configuration properties.
 * Centralized and strongly typed.
 * DO NOT use @Value for Weather configuration.
 */
@Getter
@Setter
@Validated
@ConfigurationProperties(prefix = "app.weather")
public class WeatherProperties {

    @Valid
    @NotNull
    private Ingestion ingestion = new Ingestion();

    @Valid
    @NotNull
    private OpenWeatherMap openweathermap = new OpenWeatherMap();

    @Getter
    @Setter
    public static class Ingestion {
        private String cron = "0 0 */6 * * *"; // Default: every 6 hours
    }

    @Getter
    @Setter
    public static class OpenWeatherMap {
        private String apiKey = "";

        private String baseUrl = "https://api.openweathermap.org/data/2.5";
    }
}
