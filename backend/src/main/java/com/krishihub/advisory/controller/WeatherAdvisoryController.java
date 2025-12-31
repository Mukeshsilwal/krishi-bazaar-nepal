package com.krishihub.advisory.controller;

import com.krishihub.advisory.entity.WeatherAdvisory;
import com.krishihub.advisory.service.WeatherAdvisoryService;
import com.krishihub.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/weather-advisories")
@RequiredArgsConstructor
public class WeatherAdvisoryController {

    private final WeatherAdvisoryService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<WeatherAdvisory>>> getAllAdvisories() {
        return ResponseEntity.ok(ApiResponse.success("Advisories fetched", service.getAllAdvisories()));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<WeatherAdvisory>>> getActiveAdvisories() {
        return ResponseEntity.ok(ApiResponse.success("Active advisories fetched", service.getActiveAdvisories()));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<WeatherAdvisory>> createAdvisory(@RequestBody WeatherAdvisory advisory) {
        return ResponseEntity.ok(ApiResponse.success("Advisory created", service.createAdvisory(advisory)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteAdvisory(@PathVariable UUID id) {
        service.deleteAdvisory(id);
        return ResponseEntity.ok(ApiResponse.success("Advisory deleted", null));
    }
}
