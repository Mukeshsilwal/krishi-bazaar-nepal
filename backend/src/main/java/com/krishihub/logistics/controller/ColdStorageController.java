package com.krishihub.logistics.controller;

import com.krishihub.logistics.entity.ColdStorage;
import com.krishihub.logistics.service.ColdStorageService;
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
    public ResponseEntity<List<ColdStorage>> getColdStorages(@RequestParam(required = false) String district) {
        if (district != null) {
            return ResponseEntity.ok(coldStorageService.getColdStorageByDistrict(district));
        }
        return ResponseEntity.ok(coldStorageService.getAllColdStorages());
    }

    @PostMapping
    public ResponseEntity<ColdStorage> createColdStorage(@RequestBody ColdStorage coldStorage) {
        return ResponseEntity.ok(coldStorageService.createColdStorage(coldStorage));
    }
}
