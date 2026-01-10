package com.krishihub.agristore.controller;

import com.krishihub.agristore.dto.AgriProductDTO;
import com.krishihub.agristore.entity.AgriProduct.AgriProductCategory;
import com.krishihub.agristore.service.AgriProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/agri-store/products")
@RequiredArgsConstructor
public class AgriProductController {

    private final AgriProductService agriProductService;

    @GetMapping
    public ResponseEntity<Page<AgriProductDTO>> getAllProducts(
            @RequestParam(required = false) AgriProductCategory category,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(agriProductService.getAllProducts(category, search, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AgriProductDTO> getProductById(@PathVariable UUID id) {
        return ResponseEntity.ok(agriProductService.getProductById(id));
    }
}
