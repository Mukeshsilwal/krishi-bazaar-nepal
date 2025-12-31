package com.krishihub.config.controller;

import com.krishihub.config.entity.SystemSetting;
import com.krishihub.config.service.SystemSettingService;
import com.krishihub.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/settings")
@RequiredArgsConstructor
public class SystemSettingController {

    private final SystemSettingService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SystemSetting>>> getAllSettings() {
        return ResponseEntity.ok(ApiResponse.success("Settings retrieved", service.getAllSettings()));
    }

    @PatchMapping("/{key}")
    public ResponseEntity<ApiResponse<SystemSetting>> updateSetting(
            @PathVariable String key,
            @RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(ApiResponse.success("Setting updated",
                service.updateSetting(key, payload.get("value"))));
    }
}
