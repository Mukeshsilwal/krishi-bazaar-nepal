package com.krishihub.marketprice.service;

import com.krishihub.marketprice.dto.MarketPriceDto;
import com.krishihub.marketprice.entity.MarketPrice;
import com.krishihub.marketprice.entity.MarketPriceAudit;
import com.krishihub.marketprice.repository.MarketPriceAuditRepository;
import com.krishihub.marketprice.repository.MarketPriceRepository;
import com.krishihub.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import com.krishihub.marketprice.dto.PriceStats;


@Service
@RequiredArgsConstructor
@Slf4j
public class MarketPriceService {

    private final MarketPriceRepository priceRepository;
    private final MarketPriceAuditRepository auditRepository;
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

    public org.springframework.data.domain.Page<MarketPriceDto> getPricesByDate(LocalDate date,
            org.springframework.data.domain.Pageable pageable) {
        org.springframework.data.domain.Page<MarketPrice> pricesPage = priceRepository.findByDate(date, pageable);
        return pricesPage.map(this::mapToDto);
    }

    public List<MarketPriceDto> getPricesByDate(LocalDate date) {
        // Fallback for non-paginated legacy calls - get all (using unpaged if necessary
        // or large default)
        // For backwards compatibility, we might just call the repository with unpaged
        // However, the repository signature changed. We need to overloading in
        // repository or adapt here.
        // Easiest is to call repo with Pageable.unpaged()
        return priceRepository.findByDate(date, org.springframework.data.domain.Pageable.unpaged())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "todaysPrices", key = "{#district, #cropName, #page, #size}")
    public org.springframework.data.domain.Page<MarketPriceDto> getTodaysPrices(String district, String cropName, int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);

        // 1. Try to get today's prices
        if (district != null && !district.isEmpty()) {
            org.springframework.data.domain.Page<MarketPrice> todaysPrices;
            
            if (cropName != null && !cropName.trim().isEmpty()) {
                 todaysPrices = priceRepository.findByDistrictAndCropNameContainingIgnoreCaseAndPriceDate(
                        district, cropName.trim(), LocalDate.now(), pageable);
            } else {
                 todaysPrices = priceRepository.findByDistrictAndPriceDate(district, LocalDate.now(), pageable);
            }

            if (todaysPrices.hasContent()) {
                return todaysPrices.map(this::mapToDto);
            }

            // 2. If no prices for today, try fallback to latest available date
            // (Only do this complex fallback if NOT searching, or keep it simple? 
            // User said "don't overcomplicate". Let's skip complex fallback for search for now unless critical.)
            if (page == 0 && (cropName == null || cropName.trim().isEmpty())) {
                LocalDate latestDate = priceRepository.findMaxDateByDistrict(district);
                if (latestDate != null) {
                    log.info("No prices found for today in {}. Falling back to latest date: {}", district, latestDate);
                    return priceRepository.findByDistrictAndPriceDate(district, latestDate, pageable)
                            .map(this::mapToDto);
                }
            }
            
            return todaysPrices.map(this::mapToDto); // Empty page
        }

        // Fallback for all districts
        return getPricesByDate(LocalDate.now(), pageable);
    }

    public org.springframework.data.domain.Page<MarketPriceDto> getTodaysPrices(String district, int page, int size) {
        return getTodaysPrices(district, null, page, size);
    }

    public org.springframework.data.domain.Page<MarketPriceDto> getTodaysPrices(int page, int size) {
        return getTodaysPrices(null, null, page, size);
    }

    public List<MarketPriceDto> getTodaysPrices() {
        return getPricesByDate(LocalDate.now());
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
                .priceDate(priceDto.getPriceDate() != null ? priceDto.getPriceDate() : LocalDate.now())
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
                .createdAt(java.time.LocalDateTime.now())
                .build();

        auditRepository.save(audit);
        log.info("Audit log created for override by {}", executedBy);

        return saved;
    }

    public MarketPriceDto getPreviousPrice(String cropName, String district, LocalDate date) {
        MarketPrice previous = priceRepository.findFirstByCropNameAndDistrictAndPriceDateBeforeOrderByPriceDateDesc(
                cropName, district, date);
        return previous != null ? mapToDto(previous) : null;
    }

    public List<PriceStats> getPriceHistory(String cropName, String district, LocalDate startDate, LocalDate endDate) {
        return priceRepository.findPriceHistory(cropName, district, startDate, endDate);
    }
}
