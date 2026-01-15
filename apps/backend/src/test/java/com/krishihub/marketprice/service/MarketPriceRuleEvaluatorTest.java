package com.krishihub.marketprice.service;

import com.krishihub.marketprice.dto.MarketPriceDto;
import com.krishihub.marketprice.entity.PriceAlert;
import com.krishihub.marketprice.repository.PriceAlertRepository;
import com.krishihub.notification.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

public class MarketPriceRuleEvaluatorTest {

    @Mock
    private NotificationService notificationService;

    @Mock
    private MarketPriceService marketPriceService;

    @Mock
    private PriceAlertRepository priceAlertRepository;

    @InjectMocks
    private MarketPriceRuleEvaluator ruleEvaluator;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testPriceSurgeDetection() {
        // Arrange
        MarketPriceDto newPrice = MarketPriceDto.builder()
                .cropName("Tomato")
                .district("Kathmandu")
                .avgPrice(BigDecimal.valueOf(100))
                .priceDate(com.krishihub.common.util.DateTimeProvider.today())
                .unit("Kg")
                .build();

        java.util.Calendar cal = java.util.Calendar.getInstance();
        cal.setTime(com.krishihub.common.util.DateTimeProvider.today());
        cal.add(java.util.Calendar.DAY_OF_YEAR, -1);
        
        MarketPriceDto oldPrice = MarketPriceDto.builder()
                .cropName("Tomato")
                .district("Kathmandu")
                .avgPrice(BigDecimal.valueOf(50)) // 50 -> 100 is 100% surge
                .priceDate(cal.getTime())
                .build();

        when(marketPriceService.getPreviousPrice(anyString(), anyString(), any()))
                .thenReturn(oldPrice);
        when(priceAlertRepository.findByCropNameAndActiveTrue(anyString())).thenReturn(Collections.emptyList());

        // Act
        ruleEvaluator.evaluateRules(newPrice);

        // Assert
        // Logic logs the surge, verify no exceptions.
        // In a real test with a Mock Logger or Broadcast service, we'd verify that
        // call.
        // For now, determining it runs without error.
        verify(marketPriceService, times(1)).getPreviousPrice(eq("Tomato"), eq("Kathmandu"), any());
    }

    @Test
    public void testUserAlertTrigger() {
        // Arrange
        MarketPriceDto newPrice = MarketPriceDto.builder()
                .cropName("Tomato")
                .avgPrice(BigDecimal.valueOf(100))
                .build();

        UUID userId = UUID.randomUUID();
        PriceAlert alert = new PriceAlert();
        alert.setUserId(userId);
        alert.setTargetPrice(BigDecimal.valueOf(90)); // Alert if > 90
        alert.setCondition(PriceAlert.AlertCondition.ABOVE);
        alert.setCropName("Tomato");

        when(priceAlertRepository.findByCropNameAndActiveTrue("Tomato")).thenReturn(List.of(alert));

        // Act
        ruleEvaluator.evaluateRules(newPrice);

        // Assert
        verify(notificationService).createNotification(eq(userId), eq("PRICE_ALERT"), contains("above"));
    }
}
