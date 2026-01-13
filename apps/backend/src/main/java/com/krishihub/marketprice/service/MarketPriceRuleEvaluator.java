package com.krishihub.marketprice.service;

import com.krishihub.marketprice.dto.MarketPriceDto;
import com.krishihub.marketprice.service.strategy.PriceEvaluationRule;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MarketPriceRuleEvaluator {

    private final List<PriceEvaluationRule> rules;

    @Async
    public void evaluateRules(MarketPriceDto newPrice) {
        log.debug("Evaluating {} rules for {} in {}", rules.size(), newPrice.getCropName(), newPrice.getDistrict());
        for (PriceEvaluationRule rule : rules) {
            try {
                rule.evaluate(newPrice);
            } catch (Exception e) {
                log.error("Error executing rule {}: {}", rule.getClass().getSimpleName(), e.getMessage());
            }
        }
    }
}
