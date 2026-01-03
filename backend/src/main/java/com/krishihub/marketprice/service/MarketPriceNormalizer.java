package com.krishihub.marketprice.service;

import com.krishihub.marketprice.dto.MarketPriceDto;
import org.springframework.stereotype.Service;

@Service
public class MarketPriceNormalizer {

    public MarketPriceDto normalize(MarketPriceDto raw) {
        if (raw == null)
            return null;

        // 1. Standardize Crop Name (Basic example)
        String standardizedName = standardizeCropName(raw.getCropName());
        raw.setCropName(standardizedName);

        // 2. Standardize Unit
        String standardizedUnit = standardizeUnit(raw.getUnit());
        raw.setUnit(standardizedUnit);

        // 3. Generate Crop Code if missing
        if (raw.getCropCode() == null || raw.getCropCode().isEmpty()) {
            raw.setCropCode(generateCropCode(standardizedName));
        }

        return raw;
    }

    private String standardizeCropName(String name) {
        if (name == null)
            return "Unknown Crop";
        String trimmed = name.trim();
        // Add specific mappings here, e.g., "Tomato Big" -> "Tomato (Big)"
        return trimmed;
    }

    private String standardizeUnit(String unit) {
        if (unit == null)
            return "Kg";
        String lower = unit.toLowerCase().trim();
        if (lower.contains("kg") || lower.contains("kilo"))
            return "Kg";
        if (lower.contains("quintal"))
            return "Quintal";
        return unit; // Default fallback
    }

    private String generateCropCode(String name) {
        return name.toUpperCase().replaceAll("\\s+", "_").replaceAll("[^A-Z_]", "");
    }
}
