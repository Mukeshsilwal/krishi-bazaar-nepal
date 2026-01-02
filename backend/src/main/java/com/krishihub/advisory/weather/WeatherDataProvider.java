package com.krishihub.advisory.weather;

import com.krishihub.advisory.weather.model.WeatherData;

import java.util.List;
import java.util.Optional;

/**
 * Interface for weather data providers
 * Allows integration with multiple weather APIs
 */
public interface WeatherDataProvider {

    /**
     * Get current weather data for a location
     * 
     * @param district District name
     * @return Weather data if available
     */
    Optional<WeatherData> getCurrentWeather(String district);

    /**
     * Get current weather data by coordinates
     * 
     * @param latitude  Latitude
     * @param longitude Longitude
     * @return Weather data if available
     */
    Optional<WeatherData> getCurrentWeather(Double latitude, Double longitude);

    /**
     * Get weather forecast for a location
     * 
     * @param district District name
     * @param hours    Number of hours to forecast (24, 48, 72, etc.)
     * @return List of forecast data
     */
    List<WeatherData> getForecast(String district, int hours);

    /**
     * Get weather forecast by coordinates
     * 
     * @param latitude  Latitude
     * @param longitude Longitude
     * @param hours     Number of hours to forecast
     * @return List of forecast data
     */
    List<WeatherData> getForecast(Double latitude, Double longitude, int hours);

    /**
     * Get weather alerts for a location
     * 
     * @param district District name
     * @return List of weather alerts
     */
    List<WeatherData> getAlerts(String district);

    /**
     * Check if the provider is available
     * 
     * @return true if provider can be reached
     */
    boolean isAvailable();

    /**
     * Get provider name
     * 
     * @return Provider name
     */
    String getProviderName();
}
