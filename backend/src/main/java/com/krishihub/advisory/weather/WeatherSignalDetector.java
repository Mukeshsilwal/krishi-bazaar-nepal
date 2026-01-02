package com.krishihub.advisory.weather;

import com.krishihub.advisory.weather.model.WeatherData;
import com.krishihub.advisory.weather.model.WeatherSignal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Service to detect weather signals from weather data
 * Converts raw weather data into domain-specific signals
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class WeatherSignalDetector {

    /**
     * Detect all applicable weather signals from weather data
     * 
     * @param weatherData Weather data to analyze
     * @return List of detected signals
     */
    public List<WeatherSignal> detectSignals(WeatherData weatherData) {
        List<WeatherSignal> signals = new ArrayList<>();

        if (weatherData == null) {
            log.warn("Cannot detect signals from null weather data");
            return signals;
        }

        // Check rainfall signals
        signals.addAll(detectRainfallSignals(weatherData));

        // Check temperature signals
        signals.addAll(detectTemperatureSignals(weatherData));

        // Check humidity signals
        signals.addAll(detectHumiditySignals(weatherData));

        // Check wind signals
        signals.addAll(detectWindSignals(weatherData));

        // Check for extreme weather alerts from provider
        if (Boolean.TRUE.equals(weatherData.getHasAlert())) {
            signals.add(detectAlertSignal(weatherData));
        }

        // If no signals detected, mark as normal
        if (signals.isEmpty()) {
            signals.add(WeatherSignal.NORMAL_CONDITIONS);
        }

        log.info("Detected {} signals for location {}: {}",
                signals.size(), weatherData.getDistrict(), signals);

        return signals;
    }

    /**
     * Detect rainfall-related signals
     */
    private List<WeatherSignal> detectRainfallSignals(WeatherData data) {
        List<WeatherSignal> signals = new ArrayList<>();

        Double rainfall24h = data.getRainfallForecast24h();
        if (rainfall24h == null) {
            rainfall24h = data.getRainfall();
        }

        if (rainfall24h != null) {
            if (rainfall24h > 100) {
                signals.add(WeatherSignal.HEAVY_RAIN_EXPECTED);
                // Check for flood risk with continuous heavy rain
                if (rainfall24h > 150) {
                    signals.add(WeatherSignal.FLOOD_RISK);
                }
            } else if (rainfall24h > 50) {
                signals.add(WeatherSignal.MODERATE_RAIN_EXPECTED);
            } else if (rainfall24h > 10) {
                signals.add(WeatherSignal.LIGHT_RAIN_EXPECTED);
            } else if (rainfall24h < 1) {
                // Check for drought conditions (would need historical data)
                // For now, just check if it's been dry
                signals.add(WeatherSignal.DROUGHT_WARNING);
            }
        }

        return signals;
    }

    /**
     * Detect temperature-related signals
     */
    private List<WeatherSignal> detectTemperatureSignals(WeatherData data) {
        List<WeatherSignal> signals = new ArrayList<>();

        Double maxTemp = data.getMaxTemperature();
        if (maxTemp == null) {
            maxTemp = data.getTemperature();
        }

        Double minTemp = data.getMinTemperature();
        if (minTemp == null) {
            minTemp = data.getTemperature();
        }

        // High temperature signals
        if (maxTemp != null) {
            if (maxTemp > 40) {
                signals.add(WeatherSignal.HEAT_WAVE_ALERT);
            } else if (maxTemp > 35) {
                signals.add(WeatherSignal.HIGH_TEMPERATURE);
            }
        }

        // Low temperature signals
        if (minTemp != null) {
            if (minTemp < 5) {
                signals.add(WeatherSignal.FROST_RISK);
            }
            if (minTemp < 10) {
                signals.add(WeatherSignal.COLD_WAVE_ALERT);
            }
        }

        return signals;
    }

    /**
     * Detect humidity-related signals
     */
    private List<WeatherSignal> detectHumiditySignals(WeatherData data) {
        List<WeatherSignal> signals = new ArrayList<>();

        Double humidity = data.getHumidity();
        if (humidity != null) {
            if (humidity > 85) {
                signals.add(WeatherSignal.HIGH_HUMIDITY_RISK);
            } else if (humidity < 30) {
                signals.add(WeatherSignal.LOW_HUMIDITY);
            }
        }

        return signals;
    }

    /**
     * Detect wind-related signals
     */
    private List<WeatherSignal> detectWindSignals(WeatherData data) {
        List<WeatherSignal> signals = new ArrayList<>();

        Double windSpeed = data.getWindSpeed();
        if (windSpeed != null) {
            if (windSpeed > 60) {
                signals.add(WeatherSignal.STORM_ALERT);
            } else if (windSpeed > 40) {
                signals.add(WeatherSignal.STRONG_WIND);
            }
        }

        return signals;
    }

    /**
     * Detect signal from weather alert
     */
    private WeatherSignal detectAlertSignal(WeatherData data) {
        String alertType = data.getAlertType();
        String severity = data.getAlertSeverity();

        if (alertType != null) {
            String type = alertType.toLowerCase();
            if (type.contains("thunderstorm")) {
                return WeatherSignal.THUNDERSTORM_ALERT;
            } else if (type.contains("hail")) {
                return WeatherSignal.HAIL_RISK;
            } else if (type.contains("flood")) {
                return WeatherSignal.FLOOD_RISK;
            } else if (type.contains("storm") || type.contains("wind")) {
                return WeatherSignal.STORM_ALERT;
            }
        }

        // Default to extreme weather for severe alerts
        if ("EXTREME".equalsIgnoreCase(severity) || "SEVERE".equalsIgnoreCase(severity)) {
            return WeatherSignal.EXTREME_WEATHER_ALERT;
        }

        return WeatherSignal.EXTREME_WEATHER_ALERT;
    }

    /**
     * Get the highest severity signal from a list
     */
    public WeatherSignal getHighestSeveritySignal(List<WeatherSignal> signals) {
        return signals.stream()
                .max((s1, s2) -> s1.getSeverity().compareTo(s2.getSeverity()))
                .orElse(WeatherSignal.NORMAL_CONDITIONS);
    }
}
