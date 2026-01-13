package com.krishihub.marketprice.service.strategy;

import com.krishihub.marketprice.dto.MarketPriceDto;
import com.krishihub.marketprice.entity.PriceAlert;
import com.krishihub.marketprice.repository.PriceAlertRepository;
import com.krishihub.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserAlertRule implements PriceEvaluationRule {

    private final PriceAlertRepository priceAlertRepository;
    private final NotificationService notificationService;

    @Override
    public void evaluate(MarketPriceDto price) {
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
}
