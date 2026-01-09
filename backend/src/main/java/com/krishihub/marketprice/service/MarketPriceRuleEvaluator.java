package com.krishihub.marketprice.service;

import com.krishihub.marketprice.dto.MarketPriceDto;
import com.krishihub.marketprice.entity.PriceAlert;
import com.krishihub.marketprice.repository.PriceAlertRepository;
import com.krishihub.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MarketPriceRuleEvaluator {

    private final PriceAlertRepository priceAlertRepository;
    private final NotificationService notificationService;
    private final MarketPriceService marketPriceService;

    @Async
    public void evaluateRules(MarketPriceDto newPrice) {
        // 1. Check User Defined Alerts
        checkUserAlerts(newPrice);

        // 2. Check System Wide Trends (Surges)
        checkPriceSurge(newPrice);
    }

    private void checkUserAlerts(MarketPriceDto price) {
        try {
            List<PriceAlert> alerts = priceAlertRepository.findByCropNameAndActiveTrue(price.getCropName());
            for (PriceAlert alert : alerts) {
                boolean triggered = false;
                if (alert.getCondition() == PriceAlert.AlertCondition.ABOVE
                        && price.getAvgPrice().compareTo(alert.getTargetPrice()) > 0) {
                    triggered = true;
                } else if (alert.getCondition() == PriceAlert.AlertCondition.BELOW
                        && price.getAvgPrice().compareTo(alert.getTargetPrice()) < 0) {
                    triggered = true;
                }

                if (triggered) {
                    String message = String.format("Price Alert: %s is now %s Rs. %s (Target: Rs. %s)",
                            price.getCropName(),
                            alert.getCondition() == PriceAlert.AlertCondition.ABOVE ? "above" : "below",
                            price.getAvgPrice(), alert.getTargetPrice());

                    notificationService.createNotification(alert.getUserId(), "PRICE_ALERT", message);
                    log.info("Notification sent to user {}: {}", alert.getUserId(), message);
                }
            }
        } catch (Exception e) {
            log.error("Error checking user alerts for {}: {}", price.getCropName(), e.getMessage());
        }
    }

    private void checkPriceSurge(MarketPriceDto newPrice) {
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
