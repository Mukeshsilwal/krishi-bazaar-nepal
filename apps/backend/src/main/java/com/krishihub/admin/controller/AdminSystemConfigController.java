package com.krishihub.admin.controller;

import com.krishihub.admin.dto.SystemConfigUpdateRequest;
import com.krishihub.shared.dto.ApiResponse;
import com.krishihub.entity.SystemConfig;
import com.krishihub.service.SystemConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/system-config")
@RequiredArgsConstructor
public class AdminSystemConfigController {

    private final SystemConfigService systemConfigService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<SystemConfig>>> getAllConfigs() {
        return ResponseEntity.ok(new ApiResponse<>(true, "System configurations fetched", systemConfigService.getAllConfigs()));
    }

    @PutMapping("/{key}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SystemConfig>> updateConfig(
            @PathVariable String key,
            @RequestBody SystemConfigUpdateRequest request) {
        
        SystemConfig updatedConfig = systemConfigService.updateConfig(key, request.getValue());
        return ResponseEntity.ok(new ApiResponse<>(true, "Configuration updated successfully", updatedConfig));
    }
}
