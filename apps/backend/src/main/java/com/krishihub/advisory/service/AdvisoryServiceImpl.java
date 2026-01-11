package com.krishihub.advisory.service;

import com.krishihub.advisory.dto.AdvisoryResponse;
import com.krishihub.disease.service.DiseaseService;
import com.krishihub.knowledge.service.KnowledgeService;
import java.util.ArrayList;
import java.util.List;

import com.krishihub.auth.repository.UserRepository;
import com.krishihub.marketplace.repository.CropListingRepository;
import com.krishihub.advisory.service.RuleOrchestratorService;
import com.krishihub.advisory.entity.AdvisoryDeliveryLog;
import com.krishihub.advisory.repository.AdvisoryDeliveryLogRepository;
import com.krishihub.advisory.enums.Severity;
import com.krishihub.advisory.enums.DeliveryStatus;
import com.krishihub.advisory.enums.DeliveryChannel;
import com.krishihub.common.context.UserContextHolder;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdvisoryServiceImpl implements AdvisoryService {

    private final KnowledgeService knowledgeService;
    private final DiseaseService diseaseService;
    private final UserRepository userRepository;
    private final CropListingRepository cropListingRepository;
    private final RuleOrchestratorService ruleOrchestratorService;
    private final AdvisoryDeliveryLogRepository advisoryDeliveryLogRepository;

    @Override
    public List<AdvisoryResponse> getContextualAdvisory(com.krishihub.advisory.enums.AdvisoryContextType contextType,
            String parameter) {
        List<AdvisoryResponse> advisories = new ArrayList<>();
        java.util.UUID userId = null;
        try {
            userId = UserContextHolder.getUserId();
        } catch (Exception e) {
            // User might not be authenticated or context not set, proceed without logging
            // or log as anonymous
        }

        switch (contextType) {
            case CROP_LISTING:
                // 1. Fetch relevant Articles
                knowledgeService.getArticlesByTag(parameter)
                        .forEach(article -> advisories.add(AdvisoryResponse.builder()
                                .title(article.getTitleEn())
                                .snippet("Learn how to manage your " + parameter + " crop better.")
                                .type(com.krishihub.advisory.enums.AdvisoryType.POLICY) // Using POLICY as placeholder,
                                                                                        // should be generic ARTICLE if
                                                                                        // available or map to specific
                                .referenceId(article.getId().toString())
                                .actionLabel("Read Guide")
                                .build()));

                // 2. Fetch Disease Alerts
                java.util.UUID finalUserId = userId;
                diseaseService.getDiseasesByCrop(parameter).forEach(disease -> {
                    if (disease.getRiskLevel() == com.krishihub.disease.entity.RiskLevel.HIGH
                            || disease.getRiskLevel() == com.krishihub.disease.entity.RiskLevel.CRITICAL) {

                        AdvisoryResponse response = AdvisoryResponse.builder()
                                .title("⚠️ High Risk: " + disease.getDiseaseName())
                                .snippet("This disease is currently affecting " + parameter + " crops.")
                                .type(com.krishihub.advisory.enums.AdvisoryType.DISEASE)
                                .referenceId(null) // Or link to diagnoses
                                .actionLabel("View Precautions")
                                .build();
                        advisories.add(response);

                        // Log High Risk alerts
                        if (finalUserId != null) {
                            AdvisoryDeliveryLog log = AdvisoryDeliveryLog.builder()
                                    .farmerId(finalUserId)
                                    .advisoryType(com.krishihub.advisory.enums.AdvisoryType.DISEASE)
                                    .severity(disease.getRiskLevel() == com.krishihub.disease.entity.RiskLevel.CRITICAL
                                            ? Severity.EMERGENCY
                                            : Severity.WARNING)
                                    .diseaseCode(disease.getDiseaseName().toString()) // Using ID as code for now
                                    .cropType(parameter)
                                    .deliveryStatus(DeliveryStatus.DELIVERED)
                                    .channel(DeliveryChannel.IN_APP)
                                    .advisoryContent(response.getTitle() + " - " + response.getSnippet())
                                    .deliveredAt(LocalDateTime.now())
                                    .build();
                            advisoryDeliveryLogRepository.save(log);
                        }
                    }
                });
                break;

            case WEATHER_ALERT:
                // Placeholder for weather integration
                AdvisoryResponse weatherAdvisory = AdvisoryResponse.builder()
                        .title("Weather Alert: " + parameter)
                        .snippet("Protect your crops from incoming " + parameter)
                        .type(com.krishihub.advisory.enums.AdvisoryType.WEATHER)
                        .referenceId(null)
                        .actionLabel("See Tips")
                        .build();
                advisories.add(weatherAdvisory);

                if (userId != null) {
                    AdvisoryDeliveryLog log = AdvisoryDeliveryLog.builder()
                            .farmerId(userId)
                            .advisoryType(com.krishihub.advisory.enums.AdvisoryType.WEATHER)
                            .severity(Severity.WARNING) // Defaulting to WARNING for alerts
                            .weatherSignal(parameter)
                            .deliveryStatus(DeliveryStatus.DELIVERED)
                            .channel(DeliveryChannel.IN_APP)
                            .advisoryContent(weatherAdvisory.getTitle() + " - " + weatherAdvisory.getSnippet())
                            .deliveredAt(LocalDateTime.now())
                            .build();
                    advisoryDeliveryLogRepository.save(log);
                }
                break;

            default:
                break;
        }

        return advisories;
    }

    @Override
    public void generateAdvisoryRules(java.util.UUID userId) {
        com.krishihub.auth.entity.User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        java.util.Map<String, Object> context = new java.util.HashMap<>();
        context.put("user_id", user.getId().toString());
        context.put("district", user.getDistrict());
        context.put("role", user.getRole().toString());
        context.put("verified", user.getVerified());

        if (user.getLandSize() != null) {
            context.put("land_size", user.getLandSize());
        }

        List<String> userCrops = cropListingRepository.findDistinctCropNamesByFarmerId(userId);
        if (!userCrops.isEmpty()) {
            context.put("crops", userCrops);
        }

        ruleOrchestratorService.runRules(context);
    }
}
