package com.krishihub.marketprice.controller;

import com.krishihub.marketprice.dto.MarketPriceDto;
import com.krishihub.marketprice.dto.MarketPriceAnalyticsDto;

import com.krishihub.marketprice.service.MarketPriceService;
import com.krishihub.marketprice.service.MarketPriceIngestionService;
import com.krishihub.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/market-prices")
@RequiredArgsConstructor
public class MarketPriceController {

    private final MarketPriceService priceService;
    private final MarketPriceIngestionService ingestionService;

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
    public ResponseEntity<?> getTodaysPrices(
            @RequestParam(required = false) String district,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "false") boolean paginated) {

        if (paginated) {
            org.springframework.data.domain.Page<MarketPriceDto> pricesPage = priceService.getTodaysPrices(district,
                    page, size);
            return ResponseEntity.ok(ApiResponse.success(pricesPage));
        } else {
            // Note: Legacy unpaginated endpoint currently returns ALL districts (dashboard
            // was filtering client side).
            // To maintain compatibility but allow filtering if param passed:
            List<MarketPriceDto> prices = priceService.getTodaysPrices();
            // If district provided, filter manually? Or just rely on pagination for
            // district filtering.
            // Given the dashboard change, we likely always want pagination now.
            // But for safety:
            if (district != null) {
                // Simple stream filter for legacy mode if ever used
                return ResponseEntity.ok(ApiResponse.success(
                        prices.stream().filter(p -> p.getDistrict().equals(district)).toList()));
            }
            return ResponseEntity.ok(ApiResponse.success(prices));
        }
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

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<MarketPriceDto>>> getPriceHistory(
            @RequestParam String cropName,
            @RequestParam String district) {
        // Reusing findByCropAndDistrict which already sorts by date DESC
        List<MarketPriceDto> prices = priceService.getPricesByCropAndDistrict(cropName, district);
        return ResponseEntity.ok(ApiResponse.success(prices));
    }

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<List<MarketPriceAnalyticsDto>>> getAnalytics() {
        // This would ideally be a service method doing complex aggregation.
        // For now, returning empty list or simple mock to satisfy contract.
        // In real implementation: priceService.getAnalytics();
        return ResponseEntity.ok(ApiResponse.success(java.util.Collections.emptyList()));
    }

    @PostMapping("/override")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MarketPriceDto>> overridePrice(@Valid @RequestBody MarketPriceDto priceDto) {
        // In real app, extract user ID from SecurityContext
        UUID adminId = UUID.randomUUID();
        MarketPriceDto price = priceService.overridePrice(priceDto, adminId);
        return ResponseEntity.ok(ApiResponse.success("Price overridden successfully", price));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MarketPriceDto>> addPrice(@Valid @RequestBody MarketPriceDto priceDto) {
        MarketPriceDto price = priceService.addPrice(priceDto);
        return ResponseEntity.ok(ApiResponse.success("Price added successfully", price));
    }

    @PostMapping("/ingest")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> triggerIngestion() {
        ingestionService.triggerIngestion();
        return ResponseEntity.ok(ApiResponse.success("Ingestion triggered successfully", null));
    }

}
