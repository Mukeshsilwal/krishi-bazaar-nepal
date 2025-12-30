package com.krishihub.marketprice.service;

import com.krishihub.marketprice.entity.PriceAlert;
import com.krishihub.marketprice.repository.PriceAlertRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PriceAlertService {

    private final PriceAlertRepository priceAlertRepository;

    public PriceAlert createAlert(PriceAlert alert) {
        return priceAlertRepository.save(alert);
    }

    public List<PriceAlert> getUserAlerts(UUID userId) {
        return priceAlertRepository.findByUserId(userId);
    }

    public void deleteAlert(UUID id) {
        priceAlertRepository.deleteById(id);
    }
    
    // Logic to check alerts would typically be called by the scheduler when fetching new prices
}
