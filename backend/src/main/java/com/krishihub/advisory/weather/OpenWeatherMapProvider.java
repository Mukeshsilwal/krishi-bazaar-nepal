package com.krishihub.advisory.weather;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.krishihub.advisory.weather.model.WeatherData;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.function.Supplier;

/**
 * OpenWeatherMap API implementation
 * Provides weather data with retry logic and fallback mechanisms
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OpenWeatherMapProvider implements WeatherDataProvider {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${weather.openweathermap.api-key:cc1f6ee6c3d30d4276544a101c0607ad}")
    private String apiKey;

    @Value("${weather.openweathermap.base-url:https://api.openweathermap.org/data/2.5}")
    private String baseUrl;

    // Nepal district coordinates mapping (sample - can be expanded)
    private static final Map<String, double[]> DISTRICT_COORDINATES = Map.ofEntries(
            Map.entry("Kathmandu", new double[] { 27.7172, 85.3240 }),
            Map.entry("Pokhara", new double[] { 28.2096, 83.9856 }),
            Map.entry("Kaski", new double[] { 28.2096, 83.9856 }),
            Map.entry("Chitwan", new double[] { 27.5291, 84.3542 }),
            Map.entry("Lalitpur", new double[] { 27.6667, 85.3167 }),
            Map.entry("Bhaktapur", new double[] { 27.6710, 85.4298 }),
            Map.entry("Dhading", new double[] { 27.8667, 84.9000 }),
            Map.entry("Nuwakot", new double[] { 27.9167, 85.1667 }),
            Map.entry("Rasuwa", new double[] { 28.1667, 85.3333 }),
            Map.entry("Sindhupalchok", new double[] { 27.9500, 85.6833 }));

    @Override
    public Optional<WeatherData> getCurrentWeather(String district) {
        double[] coords = DISTRICT_COORDINATES.get(district);
        if (coords == null) {
            log.warn("No coordinates found for district: {}", district);
            return Optional.empty();
        }

        return getCurrentWeather(coords[0], coords[1]);
    }

    @Override
    @Cacheable(value = "currentWeather_v3", key = "#latitude + ',' + #longitude", unless = "#result == null")
    public Optional<WeatherData> getCurrentWeather(Double latitude, Double longitude) {
        return retryOperation(() -> fetchCurrentWeather(latitude, longitude), 3);
    }

    /**
     * Fetch current weather with retry logic
     */
    private Optional<WeatherData> fetchCurrentWeather(Double latitude, Double longitude) {
        try {
            String url = String.format("%s/weather?lat=%s&lon=%s&appid=%s&units=metric",
                    baseUrl, latitude, longitude, apiKey);

            log.debug("Fetching current weather from: {}", url.replace(apiKey, "***"));

            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return Optional.of(parseCurrentWeather(response.getBody(), latitude, longitude));
            }

            log.warn("Failed to fetch weather data: {}", response.getStatusCode());
            return Optional.empty();

        } catch (Exception e) {
            log.error("Error fetching current weather for coordinates {},{}: {}",
                    latitude, longitude, e.getMessage());
            throw new RuntimeException(e);
        }
    }

    @Override
    public List<WeatherData> getForecast(String district, int hours) {
        double[] coords = DISTRICT_COORDINATES.get(district);
        if (coords == null) {
            log.warn("No coordinates found for district: {}", district);
            return Collections.emptyList();
        }

        return getForecast(coords[0], coords[1], hours);
    }

    @Override
    @Cacheable(value = "weatherForecast_v3", key = "#latitude + ',' + #longitude + ',' + #hours", unless = "#result == null || #result.isEmpty()")
    public List<WeatherData> getForecast(Double latitude, Double longitude, int hours) {
        return retryOperation(() -> fetchForecast(latitude, longitude, hours), 3);
    }

    /**
     * Fetch forecast with retry logic
     */
    private List<WeatherData> fetchForecast(Double latitude, Double longitude, int hours) {
        try {
            String url = String.format("%s/forecast?lat=%s&lon=%s&appid=%s&units=metric",
                    baseUrl, latitude, longitude, apiKey);

            log.debug("Fetching weather forecast from: {}", url.replace(apiKey, "***"));

            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return parseForecast(response.getBody(), latitude, longitude, hours);
            }

            log.warn("Failed to fetch forecast data: {}", response.getStatusCode());
            return Collections.emptyList();

        } catch (Exception e) {
            log.error("Error fetching forecast for coordinates {},{}: {}",
                    latitude, longitude, e.getMessage());
            throw new RuntimeException(e);
        }
    }

    /**
     * Generic retry operation with exponential backoff
     */
    private <T> T retryOperation(Supplier<T> operation, int maxAttempts) {
        int attempt = 0;
        long delay = 1000; // Start with 1 second

        while (attempt < maxAttempts) {
            try {
                return operation.get();
            } catch (Exception e) {
                attempt++;
                if (attempt >= maxAttempts) {
                    log.error("Max retry attempts ({}) reached", maxAttempts);
                    throw e;
                }

                log.warn("Attempt {} failed, retrying in {}ms: {}", attempt, delay, e.getMessage());

                try {
                    Thread.sleep(delay);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("Retry interrupted", ie);
                }

                delay *= 2; // Exponential backoff
            }
        }

        throw new RuntimeException("Should not reach here");
    }

    @Override
    public List<WeatherData> getAlerts(String district) {
        // OpenWeatherMap One Call API 3.0 provides alerts
        // For now, return empty list - can be implemented with premium API
        log.debug("Weather alerts not implemented for OpenWeatherMap free tier");
        return Collections.emptyList();
    }

    @Override
    public boolean isAvailable() {
        try {
            // Test with Kathmandu coordinates
            String url = String.format("%s/weather?lat=27.7172&lon=85.3240&appid=%s",
                    baseUrl, apiKey);
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            log.error("OpenWeatherMap provider is not available: {}", e.getMessage());
            return false;
        }
    }

    @Override
    public String getProviderName() {
        return "OpenWeatherMap";
    }

    /**
     * Parse current weather response
     */
    private WeatherData parseCurrentWeather(String jsonResponse, Double latitude, Double longitude) throws Exception {
        JsonNode root = objectMapper.readTree(jsonResponse);

        JsonNode main = root.get("main");
        JsonNode weather = root.get("weather").get(0);
        JsonNode wind = root.get("wind");
        JsonNode clouds = root.get("clouds");

        String locationName = root.get("name").asText();

        return WeatherData.builder()
                .location(locationName)
                .district(findDistrictByCoordinates(latitude, longitude))
                .latitude(latitude)
                .longitude(longitude)
                .temperature(main.get("temp").asDouble())
                .minTemperature(main.get("temp_min").asDouble())
                .maxTemperature(main.get("temp_max").asDouble())
                .feelsLike(main.get("feels_like").asDouble())
                .humidity(main.get("humidity").asDouble())
                .pressure(main.get("pressure").asDouble())
                .windSpeed(wind.get("speed").asDouble() * 3.6) // Convert m/s to km/h
                .windDirection(getWindDirection(wind.get("deg").asInt()))
                .cloudCoverage(clouds.get("all").asDouble())
                .condition(weather.get("main").asText())
                .description(weather.get("description").asText())
                .timestamp(LocalDateTime.now())
                .dataSource("OpenWeatherMap")
                .isForecast(false)
                .hasAlert(false)
                .build();
    }

    /**
     * Parse forecast response
     */
    private List<WeatherData> parseForecast(String jsonResponse, Double latitude, Double longitude, int hours)
            throws Exception {
        JsonNode root = objectMapper.readTree(jsonResponse);
        JsonNode list = root.get("list");

        List<WeatherData> forecasts = new ArrayList<>();
        int maxForecasts = hours / 3; // OpenWeatherMap provides 3-hour intervals

        for (int i = 0; i < Math.min(list.size(), maxForecasts); i++) {
            JsonNode item = list.get(i);
            JsonNode main = item.get("main");
            JsonNode weather = item.get("weather").get(0);
            JsonNode wind = item.get("wind");
            JsonNode clouds = item.get("clouds");

            long timestamp = item.get("dt").asLong();
            LocalDateTime forecastTime = LocalDateTime.ofInstant(
                    Instant.ofEpochSecond(timestamp), ZoneId.systemDefault());

            // Calculate rainfall from rain object if present
            Double rainfall = 0.0;
            if (item.has("rain") && item.get("rain").has("3h")) {
                rainfall = item.get("rain").get("3h").asDouble();
            }

            WeatherData forecast = WeatherData.builder()
                    .location(root.get("city").get("name").asText())
                    .district(findDistrictByCoordinates(latitude, longitude))
                    .latitude(latitude)
                    .longitude(longitude)
                    .temperature(main.get("temp").asDouble())
                    .minTemperature(main.get("temp_min").asDouble())
                    .maxTemperature(main.get("temp_max").asDouble())
                    .feelsLike(main.get("feels_like").asDouble())
                    .humidity(main.get("humidity").asDouble())
                    .pressure(main.get("pressure").asDouble())
                    .windSpeed(wind.get("speed").asDouble() * 3.6)
                    .windDirection(getWindDirection(wind.get("deg").asInt()))
                    .cloudCoverage(clouds.get("all").asDouble())
                    .condition(weather.get("main").asText())
                    .description(weather.get("description").asText())
                    .rainfall(rainfall)
                    .timestamp(LocalDateTime.now())
                    .forecastTime(forecastTime)
                    .dataSource("OpenWeatherMap")
                    .isForecast(true)
                    .hasAlert(false)
                    .build();

            forecasts.add(forecast);
        }

        // Calculate 24h and 48h rainfall forecasts
        calculateRainfallForecasts(forecasts);

        return forecasts;
    }

    /**
     * Calculate cumulative rainfall forecasts
     */
    private void calculateRainfallForecasts(List<WeatherData> forecasts) {
        if (forecasts.isEmpty())
            return;

        double rainfall24h = 0.0;
        double rainfall48h = 0.0;

        for (int i = 0; i < forecasts.size(); i++) {
            WeatherData forecast = forecasts.get(i);
            double rain = forecast.getRainfall() != null ? forecast.getRainfall() : 0.0;

            if (i < 8) { // First 24 hours (8 * 3-hour intervals)
                rainfall24h += rain;
            }
            if (i < 16) { // First 48 hours
                rainfall48h += rain;
            }

            // Set cumulative values
            forecast.setRainfallForecast24h(rainfall24h);
            forecast.setRainfallForecast48h(rainfall48h);
        }
    }

    /**
     * Find district name by coordinates
     */
    private String findDistrictByCoordinates(Double latitude, Double longitude) {
        // Simple reverse lookup - in production, use proper geocoding
        for (Map.Entry<String, double[]> entry : DISTRICT_COORDINATES.entrySet()) {
            double[] coords = entry.getValue();
            if (Math.abs(coords[0] - latitude) < 0.1 && Math.abs(coords[1] - longitude) < 0.1) {
                return entry.getKey();
            }
        }
        return "Unknown";
    }

    /**
     * Convert wind degree to direction
     */
    private String getWindDirection(int degrees) {
        String[] directions = { "N", "NE", "E", "SE", "S", "SW", "W", "NW" };
        int index = (int) Math.round(((degrees % 360) / 45.0)) % 8;
        return directions[index];
    }
}
