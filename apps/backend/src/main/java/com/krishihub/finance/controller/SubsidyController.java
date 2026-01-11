package com.krishihub.finance.controller;

import com.krishihub.finance.entity.Subsidy;
import com.krishihub.finance.service.SubsidyService;
import com.krishihub.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subsidies")
@RequiredArgsConstructor
public class SubsidyController {

    private final SubsidyService subsidyService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Subsidy>>> getAllSubsidies() {
        return ResponseEntity.ok(ApiResponse.success(subsidyService.getAllSubsidies()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Subsidy>> createSubsidy(@RequestBody Subsidy subsidy) {
        return ResponseEntity.ok(ApiResponse.success("Subsidy created successfully", subsidyService.createSubsidy(subsidy)));
    }
}
