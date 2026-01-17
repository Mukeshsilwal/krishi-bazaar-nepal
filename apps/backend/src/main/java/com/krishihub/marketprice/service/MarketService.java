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

    public com.krishihub.shared.dto.PaginatedResponse<com.krishihub.marketprice.dto.MarketDto> getAllMarkets(org.springframework.data.domain.Pageable pageable) {
        org.springframework.data.domain.Page<Market> page = marketRepository.findAll(pageable);
        java.util.List<com.krishihub.marketprice.dto.MarketDto> dtos = page.getContent().stream()
                .map(com.krishihub.marketprice.dto.MarketDto::fromEntity)
                .toList();
        
        return com.krishihub.shared.dto.PaginatedResponse.of(
                dtos,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages()
        );
    }

    public Market createMarket(Market market) {
        return marketRepository.save(market);
    }

    public Market getMarketById(UUID id) {
        return marketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Market not found"));
    }
}
