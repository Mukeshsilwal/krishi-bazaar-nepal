package com.krishihub.advisory.controller;

import com.krishihub.advisory.dto.RuleSimulationRequest;
import com.krishihub.advisory.dto.RuleSimulationResponse;
import com.krishihub.advisory.service.RuleEngineService;
import com.krishihub.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/rules")
@RequiredArgsConstructor
public class RuleEngineController {

    private final RuleEngineService ruleService;

    @PostMapping("/simulate")
    public ResponseEntity<ApiResponse<RuleSimulationResponse>> simulateRule(
            @RequestBody RuleSimulationRequest request) {
        RuleSimulationResponse response = ruleService.simulateRule(request);
        return ResponseEntity.ok(ApiResponse.success("Simulation complete", response));
    }
}
