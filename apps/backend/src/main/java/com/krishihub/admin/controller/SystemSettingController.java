package com.krishihub.admin.controller;

import com.krishihub.admin.entity.SystemSetting;
import com.krishihub.admin.service.SystemSettingService;
import com.krishihub.shared.dto.ApiResponse;
import com.krishihub.shared.dto.PaginatedResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SystemSettingController {

    private final SystemSettingService service;

    @GetMapping("/public/settings")
    public ResponseEntity<ApiResponse<Map<String, String>>> getPublicSettings() {
        // Fetch public settings as a map
        return ResponseEntity.ok(ApiResponse.success(service.getPublicSettings()));
    }

    @GetMapping("/admin/settings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PaginatedResponse<SystemSetting>>> getAllSettings(
            @PageableDefault(size = 10, sort = "key") Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                PaginatedResponse.from(service.getSettings(pageable))
        ));
    }

    @PostMapping("/admin/settings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<SystemSetting>>> updateSettings(@RequestBody List<SystemSetting> settings) {
        return ResponseEntity.ok(ApiResponse.success(service.updateSettings(settings)));
    }
}
