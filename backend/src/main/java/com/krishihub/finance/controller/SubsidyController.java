package com.krishihub.finance.controller;

import com.krishihub.finance.entity.Subsidy;
import com.krishihub.finance.service.SubsidyService;
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
    public ResponseEntity<List<Subsidy>> getAllSubsidies() {
        return ResponseEntity.ok(subsidyService.getAllSubsidies());
    }

    @PostMapping
    public ResponseEntity<Subsidy> createSubsidy(@RequestBody Subsidy subsidy) {
        return ResponseEntity.ok(subsidyService.createSubsidy(subsidy));
    }
}
