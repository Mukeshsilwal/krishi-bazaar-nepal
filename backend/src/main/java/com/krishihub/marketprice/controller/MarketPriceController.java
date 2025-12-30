package com.krishihub.marketprice.controller;

import com.krishihub.marketprice.dto.MarketPriceDto;
import com.krishihub.marketprice.service.MarketPriceService;
import com.krishihub.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/market-prices")
@RequiredArgsConstructor
public class MarketPriceController {

    private final MarketPriceService priceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MarketPriceDto>>> getPrices(
            @RequestParam String cropName,
            @RequestParam String district) {
        List<MarketPriceDto> prices = priceService.getPricesByCropAndDistrict(cropName, district);
        return ResponseEntity.ok(ApiResponse.success(prices));
    }

    @GetMapping("/latest")
    public ResponseEntity<ApiResponse<MarketPriceDto>> getLatestPrice(
            @RequestParam String cropName,
            @RequestParam String district) {
        MarketPriceDto price = priceService.getLatestPrice(cropName, district);
        return ResponseEntity.ok(ApiResponse.success(price));
    }

    @GetMapping("/today")
    public ResponseEntity<ApiResponse<List<MarketPriceDto>>> getTodaysPrices() {
        List<MarketPriceDto> prices = priceService.getTodaysPrices();
        return ResponseEntity.ok(ApiResponse.success(prices));
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<ApiResponse<List<MarketPriceDto>>> getPricesByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<MarketPriceDto> prices = priceService.getPricesByDate(date);
        return ResponseEntity.ok(ApiResponse.success(prices));
    }

    @GetMapping("/crops")
    public ResponseEntity<ApiResponse<List<String>>> getAvailableCrops() {
        List<String> crops = priceService.getAvailableCrops();
        return ResponseEntity.ok(ApiResponse.success(crops));
    }

    @GetMapping("/districts")
    public ResponseEntity<ApiResponse<List<String>>> getAvailableDistricts() {
        List<String> districts = priceService.getAvailableDistricts();
        return ResponseEntity.ok(ApiResponse.success(districts));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MarketPriceDto>> addPrice(@RequestBody MarketPriceDto priceDto) {
        MarketPriceDto price = priceService.addPrice(priceDto);
        return ResponseEntity.ok(ApiResponse.success("Price added successfully", price));
    }
}
