package com.krishihub.finance.controller;

import com.krishihub.finance.entity.GovernmentScheme;
import com.krishihub.finance.service.GovernmentSchemeService;
import com.krishihub.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/schemes")
@RequiredArgsConstructor
public class GovernmentSchemeController {

    private final GovernmentSchemeService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<GovernmentScheme>>> getAllSchemes() {
        return ResponseEntity.ok(ApiResponse.success("Schemes fetched", service.getAllSchemes()));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<GovernmentScheme>>> getActiveSchemes() {
        return ResponseEntity.ok(ApiResponse.success("Active schemes fetched", service.getActiveSchemes()));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('FINANCE:MANAGE')")
    public ResponseEntity<ApiResponse<GovernmentScheme>> createScheme(@RequestBody GovernmentScheme scheme) {
        return ResponseEntity.ok(ApiResponse.success("Scheme created", service.createScheme(scheme)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('FINANCE:MANAGE')")
    public ResponseEntity<ApiResponse<GovernmentScheme>> updateScheme(@PathVariable UUID id,
            @RequestBody GovernmentScheme scheme) {
        return ResponseEntity.ok(ApiResponse.success("Scheme updated", service.updateScheme(id, scheme)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('FINANCE:MANAGE')")
    public ResponseEntity<ApiResponse<Void>> deleteScheme(@PathVariable UUID id) {
        service.deleteScheme(id);
        return ResponseEntity.ok(ApiResponse.success("Scheme deleted", null));
    }
}
