package com.krishihub.admin.controller;

import com.krishihub.admin.service.IntegrationHealthService;
import com.krishihub.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/health")
@RequiredArgsConstructor
public class IntegrationHealthController {

    private final IntegrationHealthService healthService;

    @GetMapping("/integrations")
    public ResponseEntity<ApiResponse<Map<String, IntegrationHealthService.IntegrationStatus>>> getIntegrationHealth() {
        return ResponseEntity
                .ok(ApiResponse.success("Integration status retrieved", healthService.checkIntegrations()));
    }
}
