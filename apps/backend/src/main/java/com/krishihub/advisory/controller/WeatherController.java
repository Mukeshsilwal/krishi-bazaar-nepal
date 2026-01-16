package com.krishihub.advisory.controller;

import com.krishihub.advisory.service.WeatherAdvisoryOrchestrator;
import com.krishihub.advisory.weather.WeatherIngestionService;
import com.krishihub.advisory.weather.model.WeatherData;
import com.krishihub.advisory.weather.model.WeatherSignal;
import com.krishihub.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Controller for weather data and advisory operations
 */
@RestController
@RequestMapping("/api/weather")
@RequiredArgsConstructor
public class WeatherController {

    private final WeatherIngestionService weatherIngestionService;
    private final WeatherAdvisoryOrchestrator orchestrator;

    /**
     * Get current weather for a district
     */
    @GetMapping("/current/{district}")
    public ResponseEntity<ApiResponse<WeatherData>> getCurrentWeather(@PathVariable String district) {
        Optional<WeatherData> weather = weatherIngestionService.getCurrentWeather(district);

        return weather
                .map(data -> ResponseEntity.ok(ApiResponse.success("Weather data retrieved", data)))
                .orElse(ResponseEntity.ok(ApiResponse.error("No weather data available for district: " + district, null)));
    }

    /**
     * Get weather forecast for a district
     */
    @GetMapping("/forecast/{district}")
    public ResponseEntity<ApiResponse<List<WeatherData>>> getForecast(
            @PathVariable String district,
            @RequestParam(defaultValue = "48") int hours) {

        List<WeatherData> forecast = weatherIngestionService.getForecast(district, hours);

        return ResponseEntity.ok(ApiResponse.success("Forecast data retrieved", forecast));
    }

    /**
     * Get weather signals for a district
     */
    @GetMapping("/signals/{district}")
    public ResponseEntity<ApiResponse<List<WeatherSignal>>> getWeatherSignals(@PathVariable String district) {
        List<WeatherSignal> signals = weatherIngestionService.getWeatherSignals(district);

        return ResponseEntity.ok(ApiResponse.success("Weather signals retrieved", signals));
    }

    /**
     * Get all weather signals across districts
     */
    @GetMapping("/signals")
    @PreAuthorize("hasAuthority('ADMIN:PANEL')")
    public ResponseEntity<ApiResponse<Map<String, List<WeatherSignal>>>> getAllWeatherSignals() {
        Map<String, List<WeatherSignal>> signals = weatherIngestionService.getAllWeatherSignals();

        return ResponseEntity.ok(ApiResponse.success("All weather signals retrieved", signals));
    }

    /**
     * Trigger manual weather data ingestion
     */
    @PostMapping("/ingest")
    @PreAuthorize("hasAuthority('ADMIN:PANEL')")
    public ResponseEntity<ApiResponse<Void>> triggerIngestion() {
        weatherIngestionService.pollWeatherData();

        return ResponseEntity.ok(ApiResponse.success("Weather data ingestion triggered", null));
    }

    /**
     * Trigger manual advisory processing
     */
    @PostMapping("/process-advisories")
    @PreAuthorize("hasAuthority('ADMIN:PANEL')")
    public ResponseEntity<ApiResponse<Void>> processAdvisories() {
        orchestrator.processWeatherAdvisories();

        return ResponseEntity.ok(ApiResponse.success("Advisory processing triggered", null));
    }

    /**
     * Process advisory for a specific farmer
     */
    @PostMapping("/process-advisory/{farmerId}")
    @PreAuthorize("hasAuthority('ADMIN:PANEL')")
    public ResponseEntity<ApiResponse<Void>> processAdvisoryForFarmer(@PathVariable UUID farmerId) {
        orchestrator.processAdvisoryForFarmer(farmerId);

        return ResponseEntity.ok(ApiResponse.success("Advisory processing triggered for farmer", null));
    }

    /**
     * Get weather ingestion health status
     */
    @GetMapping("/health")
    @PreAuthorize("hasAuthority('ADMIN:PANEL')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHealthStatus() {
        Map<String, Object> status = weatherIngestionService.getHealthStatus();

        return ResponseEntity.ok(ApiResponse.success("Health status retrieved", status));
    }

    /**
     * Get orchestrator health status
     */
    @GetMapping("/orchestrator/health")
    @PreAuthorize("hasAuthority('ADMIN:PANEL')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOrchestratorHealth() {
        Map<String, Object> status = orchestrator.getHealthStatus();

        return ResponseEntity.ok(ApiResponse.success("Orchestrator health status retrieved", status));
    }
}
