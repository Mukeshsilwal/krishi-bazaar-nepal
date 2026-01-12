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
    public ResponseEntity<ApiResponse<List<Market>>> getAllMarkets() {
        return ResponseEntity.ok(ApiResponse.success(marketService.getAllMarkets()));
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
