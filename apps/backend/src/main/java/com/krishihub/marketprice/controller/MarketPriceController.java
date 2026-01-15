package com.krishihub.marketprice.controller;

import com.krishihub.marketprice.dto.MarketPriceDto;
import com.krishihub.marketprice.dto.MarketPriceAnalyticsDto;

import com.krishihub.marketprice.service.MarketPriceService;
import com.krishihub.marketprice.service.MarketPriceIngestionService;
import com.krishihub.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/market-prices")
@Slf4j
public class MarketPriceController {

    private final MarketPriceService priceService;
    private final MarketPriceIngestionService ingestionService;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;

    public MarketPriceController(MarketPriceService priceService, MarketPriceIngestionService ingestionService, org.springframework.context.ApplicationEventPublisher eventPublisher) {
        this.priceService = priceService;
        this.ingestionService = ingestionService;
        this.eventPublisher = eventPublisher;
        log.info("MarketPriceController initialized");
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<MarketPriceDto>>> getPrices(
            @RequestParam String cropName,
            @RequestParam String district) {
        List<MarketPriceDto> prices = priceService.getPricesByCropAndDistrict(cropName, district);
        eventPublisher.publishEvent(new com.krishihub.analytics.event.ActivityEvent(this, null, "VIEW_MARKET_PRICES", "Crop: " + cropName + ", District: " + district, null));
        return ResponseEntity.ok(ApiResponse.success(prices));
    }

    @GetMapping("/latest")
    public ResponseEntity<ApiResponse<MarketPriceDto>> getLatestPrice(
            @RequestParam String cropName,
            @RequestParam String district) {
        MarketPriceDto price = priceService.getLatestPrice(cropName, district);
        eventPublisher.publishEvent(new com.krishihub.analytics.event.ActivityEvent(this, null, "VIEW_LATEST_PRICE", "Crop: " + cropName + ", District: " + district, null));
        return ResponseEntity.ok(ApiResponse.success(price));
    }

    @GetMapping({"/today", "/today/"})
    public ResponseEntity<?> getTodaysPrices(
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String cropName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "false") boolean paginated) {

        if (paginated) {
            org.springframework.data.domain.Page<MarketPriceDto> pricesPage = priceService.getTodaysPrices(district, cropName,
                    page, size);
            return ResponseEntity.ok(ApiResponse.success(pricesPage));
        } else {
             // Legacy unpaginated endpoint
             // Delegating logic to service to avoid filtering in controller
             List<MarketPriceDto> prices = priceService.getTodaysPricesList(district);
             return ResponseEntity.ok(ApiResponse.success(prices));
        }
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<ApiResponse<List<MarketPriceDto>>> getPricesByDate(
            @PathVariable @DateTimeFormat(pattern = "yyyy-MM-dd") java.util.Date date) {
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
        List<MarketPriceAnalyticsDto> analytics = priceService.getAnalytics();
        return ResponseEntity.ok(ApiResponse.success(analytics));
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
