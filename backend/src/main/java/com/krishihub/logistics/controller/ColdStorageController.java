package com.krishihub.logistics.controller;

import com.krishihub.logistics.entity.ColdStorage;
import com.krishihub.logistics.service.ColdStorageService;
import com.krishihub.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cold-storage")
@RequiredArgsConstructor
public class ColdStorageController {

    private final ColdStorageService coldStorageService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ColdStorage>>> getColdStorages(@RequestParam(required = false) String district) {
        if (district != null) {
            return ResponseEntity.ok(ApiResponse.success(coldStorageService.getColdStorageByDistrict(district)));
        }
        return ResponseEntity.ok(ApiResponse.success(coldStorageService.getAllColdStorages()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ColdStorage>> createColdStorage(@RequestBody ColdStorage coldStorage) {
        return ResponseEntity.ok(ApiResponse.success("Cold storage created successfully", coldStorageService.createColdStorage(coldStorage)));
    }
}
