package com.krishihub.agristore.controller;

import com.krishihub.agristore.dto.AgriProductDTO;
import com.krishihub.agristore.service.AgriProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/agri-store/products")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('AGRISTORE:MANAGE')")
public class AdminAgriProductController {

    private final AgriProductService agriProductService;

    @PostMapping
    public ResponseEntity<AgriProductDTO> createProduct(@RequestBody AgriProductDTO dto) {
        return ResponseEntity.ok(agriProductService.createProduct(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AgriProductDTO> updateProduct(@PathVariable UUID id, @RequestBody AgriProductDTO dto) {
        return ResponseEntity.ok(agriProductService.updateProduct(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable UUID id) {
        agriProductService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
    
    @PatchMapping("/{id}/stock")
    public ResponseEntity<Void> updateStock(@PathVariable UUID id, @RequestParam Integer quantity) {
        agriProductService.updateStock(id, quantity);
        return ResponseEntity.ok().build();
    }
}
