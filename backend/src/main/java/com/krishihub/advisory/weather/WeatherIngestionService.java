package com.krishihub.advisory.weather;

import com.krishihub.advisory.weather.model.WeatherData;
import com.krishihub.advisory.weather.model.WeatherSignal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service to ingest weather data from providers
 * Handles scheduled polling, caching, and signal detection
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class WeatherIngestionService {

    private final List<WeatherDataProvider> weatherProviders;
    private final WeatherSignalDetector signalDetector;

    // Cache for last known good weather data (fallback)
    private final Map<String, WeatherData> lastKnownWeatherData = new ConcurrentHashMap<>();

    // List of Nepal districts to monitor
    private static final List<String> MONITORED_DISTRICTS = Arrays.asList(
            "Kathmandu", "Pokhara", "Kaski", "Chitwan", "Lalitpur",
            "Bhaktapur", "Dhading", "Nuwakot", "Rasuwa", "Sindhupalchok");

    /**
     * Scheduled task to poll weather data
     * Runs every hour
     */
    @Scheduled(cron = "${weather.ingestion.cron:0 0 * * * *}")
    public void pollWeatherData() {
        log.info("Starting scheduled weather data polling for {} districts", MONITORED_DISTRICTS.size());

        for (String district : MONITORED_DISTRICTS) {
            try {
                ingestWeatherForDistrict(district);
            } catch (Exception e) {
                log.error("Error ingesting weather data for district {}: {}", district, e.getMessage());
            }
        }

        log.info("Completed weather data polling");
    }

    /**
     * Ingest weather data for a specific district
     */
    @CachePut(value = "weatherData_v3", key = "#district", unless = "#result == null || #result.isEmpty()")
    public Optional<WeatherData> ingestWeatherForDistrict(String district) {
        log.debug("Ingesting weather data for district: {}", district);

        // Try each provider until one succeeds
        for (WeatherDataProvider provider : weatherProviders) {
            try {
                if (!provider.isAvailable()) {
                    log.warn("Provider {} is not available, trying next", provider.getProviderName());
                    continue;
                }

                Optional<WeatherData> weatherData = provider.getCurrentWeather(district);

                if (weatherData.isPresent()) {
                    WeatherData data = weatherData.get();

                    // Store as last known good data
                    lastKnownWeatherData.put(district, data);

                    // Detect signals
                    List<WeatherSignal> signals = signalDetector.detectSignals(data);

                    log.info("Successfully ingested weather data for {} from {}: {} signals detected",
                            district, provider.getProviderName(), signals.size());

                    return Optional.of(data);
                }

            } catch (Exception e) {
                log.error("Error fetching weather from provider {}: {}",
                        provider.getProviderName(), e.getMessage());
            }
        }

        // Fallback to last known data
        WeatherData fallbackData = lastKnownWeatherData.get(district);
        if (fallbackData != null) {
            log.warn("All providers failed for {}. Using last known data from {}",
                    district, fallbackData.getTimestamp());
            return Optional.of(fallbackData);
        }

        log.error("Failed to ingest weather data for {} from all providers and no fallback available", district);
        return Optional.empty();
    }

    /**
     * Get current weather with caching
     */
    @Cacheable(value = "weatherData_v3", key = "#district", unless = "#result == null")
    public Optional<WeatherData> getCurrentWeather(String district) {
        return ingestWeatherForDistrict(district);
    }

    /**
     * Get weather forecast for a district
     */
    @Cacheable(value = "weatherForecast_v3", key = "#district + ',' + #hours", unless = "#result == null || #result.isEmpty()")
    public List<WeatherData> getForecast(String district, int hours) {
        for (WeatherDataProvider provider : weatherProviders) {
            try {
                if (!provider.isAvailable()) {
                    continue;
                }

                List<WeatherData> forecast = provider.getForecast(district, hours);

                if (!forecast.isEmpty()) {
                    log.info("Successfully fetched {}-hour forecast for {} from {}",
                            hours, district, provider.getProviderName());
                    return forecast;
                }

            } catch (Exception e) {
                log.error("Error fetching forecast from provider {}: {}",
                        provider.getProviderName(), e.getMessage());
            }
        }

        log.warn("Failed to fetch forecast for {} from all providers", district);
        return Collections.emptyList();
    }

    /**
     * Get weather signals for a district
     */
    public List<WeatherSignal> getWeatherSignals(String district) {
        Optional<WeatherData> weatherData = getCurrentWeather(district);

        if (weatherData.isPresent()) {
            return signalDetector.detectSignals(weatherData.get());
        }

        return Collections.emptyList();
    }

    /**
     * Get weather signals for all monitored districts
     */
    public Map<String, List<WeatherSignal>> getAllWeatherSignals() {
        Map<String, List<WeatherSignal>> signalsMap = new HashMap<>();

        for (String district : MONITORED_DISTRICTS) {
            List<WeatherSignal> signals = getWeatherSignals(district);
            if (!signals.isEmpty()) {
                signalsMap.put(district, signals);
            }
        }

        return signalsMap;
    }

    /**
     * Check if any provider is available
     */
    public boolean isAnyProviderAvailable() {
        return weatherProviders.stream().anyMatch(WeatherDataProvider::isAvailable);
    }

    /**
     * Get last known weather data (fallback)
     */
    public Optional<WeatherData> getLastKnownWeather(String district) {
        return Optional.ofNullable(lastKnownWeatherData.get(district));
    }

    /**
     * Clear cache for a district
     */
    public void clearCache(String district) {
        lastKnownWeatherData.remove(district);
        log.info("Cleared weather cache for district: {}", district);
    }

    /**
     * Get health status of weather ingestion
     */
    public Map<String, Object> getHealthStatus() {
        Map<String, Object> status = new HashMap<>();

        status.put("providersAvailable", weatherProviders.stream()
                .filter(WeatherDataProvider::isAvailable)
                .map(WeatherDataProvider::getProviderName)
                .toList());

        status.put("cachedDistricts", lastKnownWeatherData.keySet());
        status.put("monitoredDistricts", MONITORED_DISTRICTS);
        status.put("lastPollTime", LocalDateTime.now());

        return status;
    }
}
