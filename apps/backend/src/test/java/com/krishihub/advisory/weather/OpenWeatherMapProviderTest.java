package com.krishihub.advisory.weather;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.krishihub.advisory.weather.model.WeatherData;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.lang.reflect.Method;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class OpenWeatherMapProviderTest {

    private OpenWeatherMapProvider provider;
    private RestTemplate restTemplate;
    private ObjectMapper objectMapper;
    private com.krishihub.config.properties.WeatherProperties weatherProperties;

    @BeforeEach
    void setUp() {
        restTemplate = mock(RestTemplate.class);
        objectMapper = new ObjectMapper();
        weatherProperties = mock(com.krishihub.config.properties.WeatherProperties.class);
        
        // Mock nested properties
        com.krishihub.config.properties.WeatherProperties.OpenWeatherMap owm = mock(com.krishihub.config.properties.WeatherProperties.OpenWeatherMap.class);
        when(weatherProperties.getOpenweathermap()).thenReturn(owm);
        when(owm.getApiKey()).thenReturn("test-api-key");
        when(owm.getBaseUrl()).thenReturn("http://api.openweathermap.org/data/2.5");

        provider = new OpenWeatherMapProvider(restTemplate, objectMapper, weatherProperties);
    }

    @Test
    void parseCurrentWeather_ShouldParseCorrectly() throws Exception {
        String json = "{\"coord\":{\"lon\":85.3167,\"lat\":27.7167},\"weather\":[{\"id\":804,\"main\":\"Clouds\",\"description\":\"overcast clouds\",\"icon\":\"04d\"}],\"base\":\"stations\",\"main\":{\"temp\":14.99,\"feels_like\":13.62,\"temp_min\":14.99,\"temp_max\":14.99,\"pressure\":1020,\"humidity\":41,\"sea_level\":1020,\"grnd_level\":856},\"visibility\":10000,\"wind\":{\"speed\":0.96,\"deg\":271,\"gust\":1.24},\"clouds\":{\"all\":87},\"dt\":1767936297,\"sys\":{\"country\":\"NP\",\"sunrise\":1767921042,\"sunset\":1767958813},\"timezone\":20700,\"id\":1283240,\"name\":\"Kathmandu\",\"cod\":200}";

        // Reflection to access private method if needed, OR mock the rest call to trigger public method logic
        // We'll mock the rest call to test via public method (fetchCurrentWeather -> wrapped in retry -> getCurrentWeather)
        // Wait, getCurrentWeather calls fetchCurrentWeather (private)
        // And fetchCurrentWeather calls parseCurrentWeather (private).
        // Best to use reflection to test the private parser directly OR mock the RestTemplate return.

        when(restTemplate.getForEntity(anyString(), eq(String.class)))
                .thenReturn(new ResponseEntity<>(json, HttpStatus.OK));

        // Use reflection to test private parse method directly to be precise, or test public method
        // Using public method:
        // Note: Coordinates must match the hardcoded map or be passed directly.
        // The JSON has Kathmandu coords: 27.7167, 85.3167.

        Method parseMethod = OpenWeatherMapProvider.class.getDeclaredMethod("parseCurrentWeather", String.class, Double.class, Double.class);
        parseMethod.setAccessible(true);
        
        WeatherData result = (WeatherData) parseMethod.invoke(provider, json, 27.7167, 85.3167);

        assertNotNull(result);
        assertEquals("Kathmandu", result.getLocation());
        assertEquals(14.99, result.getTemperature());
        assertEquals(13.62, result.getFeelsLike());
        assertEquals(41.0, result.getHumidity());
        assertEquals(1020.0, result.getPressure());
        assertEquals(87.0, result.getCloudCoverage());
        assertEquals("Clouds", result.getCondition());
        assertEquals("overcast clouds", result.getDescription());
        
        // Wind speed conversion: 0.96 * 3.6 = 3.456
        assertEquals(0.96 * 3.6, result.getWindSpeed(), 0.001);
    }
}
