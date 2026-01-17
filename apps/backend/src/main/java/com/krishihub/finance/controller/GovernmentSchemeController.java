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
    public ResponseEntity<ApiResponse<com.krishihub.shared.dto.PaginatedResponse<GovernmentScheme>>> getAllSchemes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "title,asc") String sort) {
        
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

        return ResponseEntity.ok(ApiResponse.success("Schemes fetched", 
            com.krishihub.shared.dto.PaginatedResponse.from(service.getAllSchemes(pageable))));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<com.krishihub.shared.dto.PaginatedResponse<GovernmentScheme>>> getActiveSchemes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "title,asc") String sort) {
        
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

        return ResponseEntity.ok(ApiResponse.success("Active schemes fetched", 
            com.krishihub.shared.dto.PaginatedResponse.from(service.getActiveSchemes(pageable))));
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
