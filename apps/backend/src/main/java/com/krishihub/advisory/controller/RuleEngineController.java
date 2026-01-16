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
    public ResponseEntity<ApiResponse<java.util.List<com.krishihub.advisory.dto.RuleDTO>>> getAllRules() {
        return ResponseEntity.ok(ApiResponse.success("Rules fetched successfully", ruleService.getAllRules()));
    }

    @PostMapping("/simulate")
    public ResponseEntity<ApiResponse<RuleSimulationResponse>> simulateRule(
            @RequestBody RuleSimulationRequest request) {
        RuleSimulationResponse response = ruleService.simulateRule(request);
        return ResponseEntity.ok(ApiResponse.success("Simulation complete", response));
    }
}
