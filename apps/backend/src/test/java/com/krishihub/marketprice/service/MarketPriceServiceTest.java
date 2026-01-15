package com.krishihub.marketprice.service;

import com.krishihub.marketprice.dto.MarketPriceDto;
import com.krishihub.marketprice.entity.MarketPrice;
import com.krishihub.marketprice.repository.MarketPriceAuditRepository;
import com.krishihub.marketprice.repository.MarketPriceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MarketPriceServiceTest {

    @Mock
    private MarketPriceRepository priceRepository;

    @Mock
    private MarketPriceAuditRepository auditRepository;

    @InjectMocks
    private MarketPriceService marketPriceService;

    private MarketPrice samplePrice;
    private MarketPriceDto sampleDto;

    @BeforeEach
    void setUp() {
        samplePrice = MarketPrice.builder()
                .id(UUID.randomUUID())
                .cropName("Tomato Big")
                .district("Kathmandu")
                .minPrice(new BigDecimal("50"))
                .maxPrice(new BigDecimal("60"))
                .avgPrice(new BigDecimal("55"))
                .unit("Kg")
                .priceDate(com.krishihub.common.util.DateUtil.startOfDay(com.krishihub.common.util.DateUtil.nowUtc()))
                .source("GOV")
                .build();

        sampleDto = MarketPriceDto.fromEntity(samplePrice);
    }

    @Test
    void getPricesByCropAndDistrict_ShouldReturnList() {
        when(priceRepository.findByCropAndDistrict("Tomato Big", "Kathmandu"))
                .thenReturn(Collections.singletonList(samplePrice));

        List<MarketPriceDto> result = marketPriceService.getPricesByCropAndDistrict("Tomato Big", "Kathmandu");

        assertFalse(result.isEmpty());
        assertEquals("Tomato Big", result.get(0).getCropName());
    }

    @Test
    void addPrice_ShouldSaveAndReturnDto() {
        when(priceRepository.findByCropDistrictAndDate(any(), any(), any()))
                .thenReturn(Collections.emptyList());
        when(priceRepository.save(any(MarketPrice.class))).thenReturn(samplePrice);

        MarketPriceDto result = marketPriceService.addPrice(sampleDto);

        assertNotNull(result);
        assertEquals("Tomato Big", result.getCropName());
        verify(priceRepository).save(any(MarketPrice.class));
    }
}
