package com.krishihub.advisory.controller;

import com.krishihub.advisory.dto.RuleSimulationRequest;
import com.krishihub.advisory.dto.RuleSimulationResponse;
import com.krishihub.advisory.service.RuleEngineService;
import com.krishihub.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/admin/rules")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ADMIN:PANEL')")
public class RuleEngineController {

    private final RuleEngineService ruleService;

    @PostMapping
    public ResponseEntity<ApiResponse<com.krishihub.advisory.dto.RuleDTO>> createRule(
            @RequestBody com.krishihub.advisory.dto.RuleDTO ruleDTO) {
        com.krishihub.advisory.dto.RuleDTO created = ruleService.createRule(ruleDTO);
        return ResponseEntity.ok(ApiResponse.success("Rule created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<com.krishihub.advisory.dto.RuleDTO>> updateRule(
            @PathVariable java.util.UUID id,
            @RequestBody com.krishihub.advisory.dto.RuleDTO ruleDTO) {
        com.krishihub.advisory.dto.RuleDTO updated = ruleService.updateRule(id, ruleDTO);
        return ResponseEntity.ok(ApiResponse.success("Rule updated successfully", updated));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<com.krishihub.shared.dto.PaginatedResponse<com.krishihub.advisory.dto.RuleDTO>>> getAllRules(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name,asc") String sort) {
        
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

        return ResponseEntity.ok(ApiResponse.success("Rules fetched successfully", 
            com.krishihub.shared.dto.PaginatedResponse.from(ruleService.getAllRules(pageable))));
    }

    @PostMapping("/simulate")
    public ResponseEntity<ApiResponse<RuleSimulationResponse>> simulateRule(
            @RequestBody RuleSimulationRequest request) {
        RuleSimulationResponse response = ruleService.simulateRule(request);
        return ResponseEntity.ok(ApiResponse.success("Simulation complete", response));
    }
}
