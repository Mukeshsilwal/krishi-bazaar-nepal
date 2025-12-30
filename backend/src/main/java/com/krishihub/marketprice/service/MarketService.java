package com.krishihub.marketprice.service;

import com.krishihub.marketprice.entity.Market;
import com.krishihub.marketprice.repository.MarketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MarketService {

    private final MarketRepository marketRepository;

    public List<Market> getAllMarkets() {
        return marketRepository.findAll();
    }

    public Market createMarket(Market market) {
        return marketRepository.save(market);
    }

    public Market getMarketById(UUID id) {
        return marketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Market not found"));
    }
}
