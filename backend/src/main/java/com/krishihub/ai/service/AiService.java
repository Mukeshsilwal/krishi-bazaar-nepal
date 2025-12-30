package com.krishihub.ai.service;

import com.krishihub.ai.entity.AiRecommendation;
import com.krishihub.ai.repository.AiRecommendationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AiService {

    private final AiRecommendationRepository aiRecommendationRepository;

    public AiRecommendation maximizeCropYield(UUID farmerId, String query, String imageUrl) {
        // Mock AI Logic (Rule-based for MVP)
        String recommendation = "Analyzing...";
        String disease = "Unknown";
        Double confidence = 0.0;
        String crop = "Unknown";

        if (query != null && query.toLowerCase().contains("tomato")) {
            crop = "Tomato";
            if (query.toLowerCase().contains("spot") || query.toLowerCase().contains("black")) {
                disease = "Early Blight";
                confidence = 0.95;
                recommendation = "Use Mancozeb fungicide (2g/liter). Improve air circulation.";
            } else {
                 recommendation = "Ensure consistent watering to prevent splitting. Use calcium rich fertilizer.";
                 confidence = 0.85;
            }
        } else if (imageUrl != null) {
            // Mock image analysis
            crop = "Potato";
            disease = "Late Blight";
            confidence = 0.88;
            recommendation = "Apply Metalaxyl based fungicide immediately. Harvest mature tubers.";
        } else {
             recommendation = "Please provide more details about the crop or upload an image.";
        }

        AiRecommendation rec = AiRecommendation.builder()
                .farmerId(farmerId)
                .queryText(query)
                .imageUrl(imageUrl)
                .cropName(crop)
                .diseaseDetected(disease)
                .confidenceScore(confidence)
                .recommendation(recommendation)
                .build();

        return aiRecommendationRepository.save(rec);
    }
}
