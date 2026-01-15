package com.krishihub.advisory.weather.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;



/**
 * Normalized weather data model
 * Represents weather information from any provider in a standardized format
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeatherData {

    private String location;
    private String district;
    private Double latitude;
    private Double longitude;

    // Temperature data (in Celsius)
    private Double temperature;
    private Double minTemperature;
    private Double maxTemperature;
    private Double feelsLike;

    // Precipitation data (in mm)
    private Double rainfall;
    private Double rainfallForecast24h;
    private Double rainfallForecast48h;

    // Humidity (percentage)
    private Double humidity;

    // Wind data
    private Double windSpeed; // km/h
    private String windDirection;

    // Pressure (hPa)
    private Double pressure;

    // Cloud coverage (percentage)
    private Double cloudCoverage;

    // UV Index
    private Double uvIndex;

    // Weather condition
    private String condition; // Clear, Cloudy, Rain, Storm, etc.
    private String description;

    // Alert information
    private Boolean hasAlert;
    private String alertType;
    private String alertDescription;
    private String alertSeverity; // MINOR, MODERATE, SEVERE, EXTREME

    // Metadata
    private java.util.Date timestamp;
    private java.util.Date forecastTime;
    private String dataSource; // Provider name
    private Boolean isForecast;

    // Calculated fields
    private Double heatIndex;
    private Double dewPoint;
}
