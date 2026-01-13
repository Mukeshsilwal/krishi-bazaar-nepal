package com.krishihub.marketprice.service.strategy;

import com.krishihub.marketprice.dto.MarketPriceDto;
import com.krishihub.marketprice.service.MarketPriceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
@Slf4j
public class PriceSurgeRule implements PriceEvaluationRule {

    private final MarketPriceService marketPriceService;

    @Override
    public void evaluate(MarketPriceDto newPrice) {
        try {
            MarketPriceDto previousPrice = marketPriceService.getPreviousPrice(
                    newPrice.getCropName(), newPrice.getDistrict(), newPrice.getPriceDate());

            if (previousPrice != null) {
                BigDecimal oldVal = previousPrice.getAvgPrice();
                BigDecimal newVal = newPrice.getAvgPrice();

                if (oldVal.compareTo(BigDecimal.ZERO) == 0)
                    return;

                BigDecimal change = newVal.subtract(oldVal);
                BigDecimal percentageChange = change.divide(oldVal, 4, BigDecimal.ROUND_HALF_UP)
                        .multiply(BigDecimal.valueOf(100));

                if (percentageChange.abs().compareTo(BigDecimal.valueOf(20)) > 0) {
                    String type = percentageChange.compareTo(BigDecimal.ZERO) > 0 ? "PRICE_SURGE" : "PRICE_DROP";
                    String message = String.format(
                            "Significant market movement! %s in %s has %s by %.2f%%. Current: Rs. %s",
                            newPrice.getCropName(), newPrice.getDistrict(),
                            type.equals("PRICE_SURGE") ? "jumped" : "dropped",
                            percentageChange.abs(), newPrice.getAvgPrice());

                    log.info("System Alert: {}", message);
                    // In a real system, we might broadcast this to all users interested in this
                    // crop
                    // notificationService.broadcast(type, message);
                }
            }
        } catch (Exception e) {
            log.error("Error evaluating surge rules for {}: {}", newPrice.getCropName(), e.getMessage());
        }
    }
}
