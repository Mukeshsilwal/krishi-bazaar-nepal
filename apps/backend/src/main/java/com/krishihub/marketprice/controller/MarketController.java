package com.krishihub.marketprice.controller;

import com.krishihub.marketprice.entity.Market;
import com.krishihub.marketprice.service.MarketService;
import com.krishihub.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/markets")
@RequiredArgsConstructor
public class MarketController {

    private final MarketService marketService;

    @GetMapping
    public ResponseEntity<ApiResponse<com.krishihub.shared.dto.PaginatedResponse<com.krishihub.marketprice.dto.MarketDto>>> getAllMarkets(
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
        
        return ResponseEntity.ok(ApiResponse.success(marketService.getAllMarkets(pageable)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Market>> createMarket(@RequestBody Market market) {
        return ResponseEntity.ok(ApiResponse.success("Market created successfully", marketService.createMarket(market)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Market>> getMarketById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(marketService.getMarketById(id)));
    }
}
