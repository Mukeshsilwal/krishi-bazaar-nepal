package com.krishihub.finance.controller;

import com.krishihub.finance.entity.Subsidy;
import com.krishihub.finance.service.SubsidyService;
import com.krishihub.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/subsidies")
@RequiredArgsConstructor
public class SubsidyController {

    private final SubsidyService subsidyService;

    @GetMapping
    public ResponseEntity<ApiResponse<com.krishihub.shared.dto.PaginatedResponse<Subsidy>>> getAllSubsidies(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,asc") String sort) {
        
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

        return ResponseEntity.ok(ApiResponse.success(
            com.krishihub.shared.dto.PaginatedResponse.from(subsidyService.getAllSubsidies(pageable))));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN:PANEL')")
    public ResponseEntity<ApiResponse<Subsidy>> createSubsidy(@RequestBody Subsidy subsidy) {
        return ResponseEntity.ok(ApiResponse.success("Subsidy created successfully", subsidyService.createSubsidy(subsidy)));
    }
}
