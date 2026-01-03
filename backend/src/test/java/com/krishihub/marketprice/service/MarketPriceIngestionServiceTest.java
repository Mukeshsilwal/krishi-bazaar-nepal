package com.krishihub.marketprice.service;

import com.krishihub.marketprice.dto.MarketPriceDto;
import com.krishihub.marketprice.repository.MarketPriceAuditRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MarketPriceIngestionServiceTest {

    @Mock
    private List<MarketPriceDataSource> dataSources;

    @Mock
    private MarketPriceService marketPriceService;

    @Mock
    private MarketPriceRuleEvaluator ruleEvaluator;

    @Mock
    private MarketPriceNormalizer normalizer;

    @Mock
    private PriceValidatorService validator;

    @InjectMocks
    private MarketPriceIngestionService ingestionService;

    @Test
    void ingestPrices_ShouldProcessDataAndSave() {
        // Setup mock data source
        MarketPriceDataSource mockSource = mock(MarketPriceDataSource.class);
        MarketPriceDto rawPrice = MarketPriceDto.builder()
                .cropName("Tomato")
                .minPrice(BigDecimal.TEN)
                .build();

        // Fix: Use iterator or list behavior correctly since we mock the List injection
        // in constructor
        // But InjectMocks with List is tricky. Better to manually create instance or
        // assume dataSources is iterable
        // However, Mockito's @InjectMocks handles List injection if @Spy is used or
        // specific setup.
        // Let's rely on standard loop behavior, but since List<DataSource> is mocked,
        // iterating it requires stubbing iterator.
        // EASIER: Change test to not use @InjectMocks for the list, but constructor.

        // Re-setup with constructor for clarity
        ingestionService = new MarketPriceIngestionService(
                Collections.singletonList(mockSource),
                marketPriceService,
                ruleEvaluator,
                normalizer,
                validator,
                null // Audit repository
        );

        when(mockSource.fetchPrices()).thenReturn(Collections.singletonList(rawPrice));
        when(mockSource.getSourceId()).thenReturn("MOCK_SOURCE");
        when(normalizer.normalize(any())).thenReturn(rawPrice);
        when(validator.isValid(any())).thenReturn(true);
        when(marketPriceService.addPrice(any())).thenReturn(rawPrice);

        ingestionService.ingestPrices();

        verify(mockSource).fetchPrices();
        verify(marketPriceService).addPrice(any());
        verify(ruleEvaluator).evaluateRules(any());
    }
}
