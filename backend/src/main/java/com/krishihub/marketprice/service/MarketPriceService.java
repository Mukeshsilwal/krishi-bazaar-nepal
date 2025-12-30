package com.krishihub.marketprice.service;

import com.krishihub.marketprice.dto.MarketPriceDto;
import com.krishihub.marketprice.entity.MarketPrice;
import com.krishihub.marketprice.repository.MarketPriceRepository;
import com.krishihub.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MarketPriceService {

    private final MarketPriceRepository priceRepository;

    public List<MarketPriceDto> getPricesByCropAndDistrict(String cropName, String district) {
        List<MarketPrice> prices = priceRepository.findByCropAndDistrict(cropName, district);
        return prices.stream()
                .map(MarketPriceDto::fromEntity)
                .collect(Collectors.toList());
    }

    public MarketPriceDto getLatestPrice(String cropName, String district) {
        List<MarketPrice> prices = priceRepository.findByCropAndDistrict(cropName, district);

        if (prices.isEmpty()) {
            throw new ResourceNotFoundException(
                    "No price data found for " + cropName + " in " + district);
        }

        return MarketPriceDto.fromEntity(prices.get(0)); // Already sorted by date DESC
    }

    public List<MarketPriceDto> getPricesByDate(LocalDate date) {
        List<MarketPrice> prices = priceRepository.findByDate(date);
        return prices.stream()
                .map(MarketPriceDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<MarketPriceDto> getTodaysPrices() {
        return getPricesByDate(LocalDate.now());
    }

    public List<String> getAvailableCrops() {
        return priceRepository.findDistinctCropNames();
    }

    public List<String> getAvailableDistricts() {
        return priceRepository.findDistinctDistricts();
    }

    @Transactional
    public MarketPriceDto addPrice(MarketPriceDto priceDto) {
        // Check if price already exists for this crop, district, and date
        priceRepository.findByCropDistrictAndDate(
                priceDto.getCropName(),
                priceDto.getDistrict(),
                priceDto.getPriceDate()).ifPresent(existing -> {
                    // Update existing record
                    existing.setMinPrice(priceDto.getMinPrice());
                    existing.setMaxPrice(priceDto.getMaxPrice());
                    existing.setAvgPrice(priceDto.getAvgPrice());
                    existing.setUnit(priceDto.getUnit());
                    existing.setSource(priceDto.getSource());
                    priceRepository.save(existing);
                });

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

        return MarketPriceDto.fromEntity(saved);
    }
}
