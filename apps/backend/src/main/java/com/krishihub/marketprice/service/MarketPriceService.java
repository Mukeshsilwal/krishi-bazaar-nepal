package com.krishihub.marketprice.service;

import com.krishihub.common.util.DateUtil;
import com.krishihub.marketprice.dto.MarketPriceDto;
import com.krishihub.marketprice.dto.PriceStats;
import com.krishihub.marketprice.entity.MarketPrice;
import com.krishihub.marketprice.entity.MarketPriceAudit;
import com.krishihub.marketprice.repository.MarketPriceRepository;
import com.krishihub.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Slf4j
public class MarketPriceService {

    private final MarketPriceRepository priceRepository;
    private final com.krishihub.marketprice.repository.MarketPriceAuditRepository auditRepository;
    private final VegetableImageProvider imageProvider;

    private MarketPriceDto mapToDto(MarketPrice price) {
        MarketPriceDto dto = MarketPriceDto.fromEntity(price);
        dto.setImageUrl(imageProvider.getImageUrl(price.getCropName()));
        return dto;
    }

    public List<MarketPriceDto> getPricesByCropAndDistrict(String cropName, String district) {
        List<MarketPrice> prices = priceRepository.findByCropAndDistrict(cropName, district);
        return prices.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public MarketPriceDto getLatestPrice(String cropName, String district) {
        List<MarketPrice> prices = priceRepository.findByCropAndDistrict(cropName, district);

        if (prices.isEmpty()) {
            throw new ResourceNotFoundException(
                    "No price data found for " + cropName + " in " + district);
        }

        return mapToDto(prices.get(0)); // Already sorted by date DESC
    }

    public org.springframework.data.domain.Page<MarketPriceDto> getPricesByDate(java.util.Date date,
            org.springframework.data.domain.Pageable pageable) {
        org.springframework.data.domain.Page<MarketPrice> pricesPage = priceRepository.findByDate(date, pageable);
        return pricesPage.map(this::mapToDto);
    }

    public List<MarketPriceDto> getPricesByDate(java.util.Date date) {
        // Fallback for non-paginated legacy calls
        return priceRepository.findByDate(date, org.springframework.data.domain.Pageable.unpaged())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "todaysPrices", key = "{#district, #cropName, #page, #size}")
    public org.springframework.data.domain.Page<MarketPriceDto> getTodaysPrices(String district, String cropName, int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        java.util.Date today = DateUtil.startOfDay(DateUtil.nowUtc());

        // 1. Try to get today's prices
        if (district != null && !district.isEmpty()) {
            org.springframework.data.domain.Page<MarketPrice> todaysPrices;
            
            if (cropName != null && !cropName.trim().isEmpty()) {
                 todaysPrices = priceRepository.findByDistrictAndCropNameContainingIgnoreCaseAndPriceDate(
                        district, cropName.trim(), today, pageable);
            } else {
                 todaysPrices = priceRepository.findByDistrictAndPriceDate(district, today, pageable);
            }

            if (todaysPrices.hasContent()) {
                return todaysPrices.map(this::mapToDto);
            }

            // 2. If no prices for today, try fallback to latest available date
            if (page == 0 && (cropName == null || cropName.trim().isEmpty())) {
                java.util.Date latestDate = priceRepository.findMaxDateByDistrict(district);
                if (latestDate != null) {
                    log.info("No prices found for today in {}. Falling back to latest date: {}", district, latestDate);
                    return priceRepository.findByDistrictAndPriceDate(district, latestDate, pageable)
                            .map(this::mapToDto);
                }
            }
            
            return todaysPrices.map(this::mapToDto); // Empty page
        }

        // Fallback for all districts
        return getPricesByDate(today, pageable);
    }

    public org.springframework.data.domain.Page<MarketPriceDto> getTodaysPrices(String district, int page, int size) {
        return getTodaysPrices(district, null, page, size);
    }

    public org.springframework.data.domain.Page<MarketPriceDto> getTodaysPrices(int page, int size) {
        return getTodaysPrices(null, null, page, size);
    }

    public List<MarketPriceDto> getTodaysPrices() {
        return getPricesByDate(DateUtil.startOfDay(DateUtil.nowUtc()));
    }

    public List<MarketPriceDto> getTodaysPricesList(String district) {
        if (district == null || district.isEmpty()) {
             return getTodaysPrices();
        }
        return priceRepository.findByDistrictAndPriceDate(district, DateUtil.startOfDay(DateUtil.nowUtc()), org.springframework.data.domain.Pageable.unpaged())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "availableCrops")
    public List<String> getAvailableCrops() {
        return priceRepository.findDistinctCropNames();
    }

    @Cacheable(value = "availableDistricts")
    public List<String> getAvailableDistricts() {
        return priceRepository.findDistinctDistricts();
    }

    @Transactional
    @CacheEvict(value = {"todaysPrices", "availableCrops", "availableDistricts"}, allEntries = true)
    public MarketPriceDto addPrice(MarketPriceDto priceDto) {
        // Check if price already exists for this crop, district, and date
        List<MarketPrice> existingPrices = priceRepository.findByCropDistrictAndDate(
                priceDto.getCropName(),
                priceDto.getDistrict(),
                priceDto.getPriceDate());

        if (!existingPrices.isEmpty()) {
            // Update the first one
            MarketPrice existing = existingPrices.get(0);
            existing.setMinPrice(priceDto.getMinPrice());
            existing.setMaxPrice(priceDto.getMaxPrice());
            existing.setAvgPrice(priceDto.getAvgPrice());
            existing.setUnit(priceDto.getUnit());
            existing.setSource(priceDto.getSource());

            MarketPrice saved = priceRepository.save(existing);

            // Clean up duplicates if any
            if (existingPrices.size() > 1) {
                log.warn("Found {} duplicate prices for {} in {} on {}. Cleaning up.",
                        existingPrices.size(), priceDto.getCropName(), priceDto.getDistrict(), priceDto.getPriceDate());
                for (int i = 1; i < existingPrices.size(); i++) {
                    priceRepository.delete(existingPrices.get(i));
                }
            }

            log.info("Market price updated: {} in {} on {}",
                    saved.getCropName(), saved.getDistrict(), saved.getPriceDate());
            return mapToDto(saved);
        }

        MarketPrice price = MarketPrice.builder()
                .cropName(priceDto.getCropName())
                .district(priceDto.getDistrict())
                .minPrice(priceDto.getMinPrice())
                .maxPrice(priceDto.getMaxPrice())
                .avgPrice(priceDto.getAvgPrice())
                .unit(priceDto.getUnit())
                .priceDate(priceDto.getPriceDate() != null ? priceDto.getPriceDate() : DateUtil.startOfDay(DateUtil.nowUtc()))
                .source(priceDto.getSource())
                .build();

        MarketPrice saved = priceRepository.save(price);
        log.info("Market price added: {} in {} on {}",
                saved.getCropName(), saved.getDistrict(), saved.getPriceDate());

        return mapToDto(saved);
    }

    @Transactional
    public MarketPriceDto overridePrice(MarketPriceDto priceDto, UUID executedBy) {
        MarketPriceDto saved = addPrice(priceDto);

        // Create audit record
        MarketPriceAudit audit = MarketPriceAudit.builder()
                .priceId(saved.getId())
                .action("OVERRIDE")
                .newValue(saved.getAvgPrice())
                .userId(executedBy)
                .createdAt(DateUtil.nowUtc())
                .build();

        auditRepository.save(audit);
        log.info("Audit log created for override by {}", executedBy);

        return saved;
    }

    public MarketPriceDto getPreviousPrice(String cropName, String district, java.util.Date date) {
        MarketPrice previous = priceRepository.findFirstByCropNameAndDistrictAndPriceDateBeforeOrderByPriceDateDesc(
                cropName, district, date);
        return previous != null ? mapToDto(previous) : null;
    }

    public List<PriceStats> getPriceHistory(String cropName, String district, java.util.Date startDate, java.util.Date endDate) {
        return priceRepository.findPriceHistory(cropName, district, startDate, endDate);
    }

    @Cacheable(value = "marketPriceAnalytics")
    public List<com.krishihub.marketprice.dto.MarketPriceAnalyticsDto> getAnalytics() {
        List<String> crops = priceRepository.findDistinctCropNames();
        List<String> districts = priceRepository.findDistinctDistricts(); 
        
        String benchmarkDistrict = districts.contains("Kathmandu") ? "Kathmandu" : (districts.isEmpty() ? "Unknown" : districts.get(0));

        java.util.Date endDate = DateUtil.startOfDay(DateUtil.nowUtc());
        java.util.Date startDate = DateUtil.addDays(endDate, -30);

        return crops.stream().map(crop -> {
            List<PriceStats> history = priceRepository.findPriceHistory(crop, benchmarkDistrict, startDate, endDate);
            
            if (history.isEmpty()) return null;

            double min = history.stream().mapToDouble(PriceStats::getMin).min().orElse(0.0);
            double max = history.stream().mapToDouble(PriceStats::getMax).max().orElse(0.0);
            double avg = history.stream().mapToDouble(PriceStats::getAvg).average().orElse(0.0);

            // Trend Calculation (Last 7 days vs Previous 7 days)
            String trend = "STABLE";
            if (history.size() >= 2) {
                java.util.Date sevenDaysAgo = DateUtil.addDays(endDate, -7);
                
                double recentAvg = history.stream()
                        .filter(s -> s.getDate().after(sevenDaysAgo))
                        .mapToDouble(PriceStats::getAvg).average().orElse(0.0);
                
                double oldAvg = history.stream()
                        .filter(s -> s.getDate().before(sevenDaysAgo))
                        .mapToDouble(PriceStats::getAvg).average().orElse(0.0);

                if (oldAvg > 0) {
                    double change = (recentAvg - oldAvg) / oldAvg;
                    if (change > 0.05) trend = "UP";
                    else if (change < -0.05) trend = "DOWN";
                }
            }

            return com.krishihub.marketprice.dto.MarketPriceAnalyticsDto.builder()
                    .cropName(crop)
                    .minPrice(java.math.BigDecimal.valueOf(min))
                    .maxPrice(java.math.BigDecimal.valueOf(max))
                    .averagePrice(java.math.BigDecimal.valueOf(avg))
                    .trend(trend)
                    .build();
        }).filter(java.util.Objects::nonNull).collect(Collectors.toList());
    }
}
