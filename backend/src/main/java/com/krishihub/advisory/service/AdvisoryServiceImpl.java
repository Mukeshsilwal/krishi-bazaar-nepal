package com.krishihub.advisory.service;

import com.krishihub.advisory.dto.AdvisoryResponse;
import com.krishihub.disease.service.DiseaseService;
import com.krishihub.knowledge.service.KnowledgeService;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdvisoryServiceImpl implements AdvisoryService {

    private final KnowledgeService knowledgeService;
    private final DiseaseService diseaseService;

    @Override
    public List<AdvisoryResponse> getContextualAdvisory(String contextType, String parameter) {
        List<AdvisoryResponse> advisories = new ArrayList<>();

        switch (contextType) {
            case "CROP_LISTING":
                // 1. Fetch relevant Articles
                knowledgeService.getArticlesByTag(parameter)
                        .forEach(article -> advisories.add(AdvisoryResponse.builder()
                                .title(article.getTitleEn())
                                .snippet("Learn how to manage your " + parameter + " crop better.")
                                .type("ARTICLE")
                                .referenceId(article.getId().toString())
                                .actionLabel("Read Guide")
                                .build()));

                // 2. Fetch Disease Alerts
                diseaseService.getDiseasesByCrop(parameter).forEach(disease -> {
                    if (disease.getRiskLevel().toString().equals("HIGH")
                            || disease.getRiskLevel().toString().equals("CRITICAL")) {
                        advisories.add(AdvisoryResponse.builder()
                                .title("⚠️ High Risk: " + disease.getDiseaseName())
                                .snippet("This disease is currently affecting " + parameter + " crops.")
                                .type("DISEASE_ALERT")
                                .referenceId(null) // Or link to diagnoses
                                .actionLabel("View Precautions")
                                .build());
                    }
                });
                break;

            case "WEATHER_ALERT":
                // Placeholder for weather integration
                advisories.add(AdvisoryResponse.builder()
                        .title("Weather Alert: " + parameter)
                        .snippet("Protect your crops from incoming " + parameter)
                        .type("WEATHER_WARN")
                        .referenceId(null)
                        .actionLabel("See Tips")
                        .build());
                break;
        }

        return advisories;
    }
}
