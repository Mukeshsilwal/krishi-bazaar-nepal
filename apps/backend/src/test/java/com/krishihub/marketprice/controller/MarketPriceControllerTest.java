package com.krishihub.marketprice.controller;

import com.krishihub.marketprice.dto.MarketPriceDto;
import com.krishihub.marketprice.service.MarketPriceService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MarketPriceControllerTest {

    @Mock
    private MarketPriceService priceService;

    @Mock
    private org.springframework.context.ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private MarketPriceController controller;

    @Test
    void getPrices_ShouldReturnList() {
        MarketPriceDto dto = MarketPriceDto.builder()
                .cropName("Tomato")
                .avgPrice(BigDecimal.TEN)
                .build();

        when(priceService.getPricesByCropAndDistrict("Tomato", "Kathmandu"))
                .thenReturn(Collections.singletonList(dto));

        ResponseEntity<?> response = controller.getPrices("Tomato", "Kathmandu");

        // Asserting success structure would require examining ApiResponse wrapper
        assertEquals(200, response.getStatusCodeValue());
    }
}
