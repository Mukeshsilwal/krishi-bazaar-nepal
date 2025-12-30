package com.krishihub.marketprice.controller;

import com.krishihub.marketprice.entity.Market;
import com.krishihub.marketprice.service.MarketService;
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
    public ResponseEntity<List<Market>> getAllMarkets() {
        return ResponseEntity.ok(marketService.getAllMarkets());
    }

    @PostMapping
    public ResponseEntity<Market> createMarket(@RequestBody Market market) {
        return ResponseEntity.ok(marketService.createMarket(market));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Market> getMarketById(@PathVariable UUID id) {
        return ResponseEntity.ok(marketService.getMarketById(id));
    }
}
