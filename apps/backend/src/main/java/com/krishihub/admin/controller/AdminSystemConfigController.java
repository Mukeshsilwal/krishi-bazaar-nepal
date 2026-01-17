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
    @PreAuthorize("hasAuthority('ADMIN:SETTINGS')")
    public ResponseEntity<ApiResponse<com.krishihub.shared.dto.PaginatedResponse<com.krishihub.admin.dto.SystemConfigDto>>> getAllConfigs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "key,asc") String sort) {
            
        String[] sortParams = sort.split(",");
        String sortField = sortParams[0];
        String sortDirection = sortParams.length > 1 ? sortParams[1] : "asc";
        
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(
            page, 
            size, 
            org.springframework.data.domain.Sort.by(
                org.springframework.data.domain.Sort.Direction.fromString(sortDirection), 
                sortField
            )
        );
        
        return ResponseEntity.ok(ApiResponse.success("System configurations fetched", 
            systemConfigService.getAllConfigs(pageable)));
    }

    @PutMapping("/{key}")
    @PreAuthorize("hasAuthority('ADMIN:SETTINGS')")
    public ResponseEntity<ApiResponse<SystemConfig>> updateConfig(
            @PathVariable String key,
            @RequestBody SystemConfigUpdateRequest request) {
        
        SystemConfig updatedConfig = systemConfigService.updateConfig(key, request.getValue());
        return ResponseEntity.ok(ApiResponse.success("Configuration updated successfully", updatedConfig));
    }
}
