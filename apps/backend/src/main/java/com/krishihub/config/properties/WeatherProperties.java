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
        @NotBlank(message = "Cron expression must not be blank")
        private String cron;
    }

    @Getter
    @Setter
    public static class OpenWeatherMap {
        @NotBlank(message = "API key must not be blank")
        private String apiKey;

        @NotBlank(message = "Base URL must not be blank")
        private String baseUrl;
    }
}
