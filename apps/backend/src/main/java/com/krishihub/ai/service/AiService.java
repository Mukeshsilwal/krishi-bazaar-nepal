package com.krishihub.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.krishihub.ai.entity.AiRecommendation;
import com.krishihub.ai.repository.AiRecommendationRepository;
import com.krishihub.content.entity.Content;
import com.krishihub.content.enums.ContentStatus;
import com.krishihub.content.repository.ContentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
// import org.springframework.beans.factory.annotation.Value; removed
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiService {

        private final AiRecommendationRepository aiRecommendationRepository;
        private final WebClient openAiWebClient;
        private final ObjectMapper objectMapper;
        private final ContentRepository contentRepository;

        private final com.krishihub.diagnosis.repository.AIDiagnosisRepository aiDiagnosisRepository;

        private final com.krishihub.config.properties.OpenAiProperties openAiProperties;

        public AiRecommendation maximizeCropYield(
                        UUID farmerId,
                        String query,
                        String imageUrl) {
                log.info("Generating AI recommendation for farmer: {}", farmerId);

                // 1. Fetch Local Context (RAG)
                StringBuilder localContext = new StringBuilder();
                    try {
                        // Strategy: Fetch Recent Active Content (Context Stuffing)
                        java.util.List<com.krishihub.content.entity.Content> contents = contentRepository.findTop5ByStatusOrderByPublishedAtDesc(
                            com.krishihub.content.enums.ContentStatus.ACTIVE
                        );
                        
                        if (!contents.isEmpty()) {
                            localContext.append("\n\nRELEVANT LOCAL AGRICULTURAL KNOWLEDGE (Use this if applicable):\n");
                            for (com.krishihub.content.entity.Content c : contents) {
                                localContext.append("- Title: ").append(c.getTitle()).append("\n");
                                localContext.append("  Summary: ").append(c.getSummary()).append("\n");
                                if (c.getStructuredBody() != null) {
                                     localContext.append("  Details: ").append(c.getStructuredBody().toString()).append("\n");
                                }
                                localContext.append("\n");
                            }
                        }
                    } catch (Exception e) {
                        log.warn("Failed to fetch local content context", e);
                    }
                // End RAG logic

                String systemPrompt = """
                                You are an expert agriculturalist and plant pathologist assisting farmers in Nepal.

                                Analyze the provided input to:
                                - Identify the crop
                                - Detect diseases or issues
                                - Provide practical recommendations suitable for Nepal

                                Respond ONLY in valid JSON with:
                                {
                                  "crop_name": "String",
                                  "disease_detected": "String",
                                  "confidence_score": 0.0,
                                  "recommendation": "String"
                                }

                                If unsure, use "Unknown" and explain in recommendation.
                                """ + localContext.toString();

                String userInput = (query != null ? query : "")
                                + (imageUrl != null ? "\nImage URL: " + imageUrl : "");

                Map<String, Object> request = Map.of(
                                "model", openAiProperties.getModel(),
                                "messages", java.util.List.of(
                                                Map.of("role", "system", "content", systemPrompt),
                                                Map.of("role", "user", "content", userInput)),
                                "response_format", Map.of("type", "json_object"));

                try {
                        String rawResponse = openAiWebClient.post()
                                        .bodyValue(request)
                                        .retrieve()
                                        .bodyToMono(String.class)
                                        .block();

                        JsonNode root = objectMapper.readTree(rawResponse);

                        String content = root
                                        .path("choices")
                                        .get(0)
                                        .path("message")
                                        .path("content")
                                        .asText();

                        JsonNode json = objectMapper.readTree(content);

                        AiRecommendation recommendation = AiRecommendation.builder()
                                        .farmerId(farmerId)
                                        .queryText(query)
                                        .imageUrl(imageUrl)
                                        .cropName(json.path("crop_name").asText("Unknown"))
                                        .diseaseDetected(json.path("disease_detected").asText("Unknown"))
                                        .confidenceScore(json.path("confidence_score").asDouble(0.0))
                                        .recommendation(json.path("recommendation").asText())
                                        .build();

                        AiRecommendation savedRec = aiRecommendationRepository.save(recommendation);

                        // NEW: If Image exists, auto-create a Diagnosis for Admin Review
                        if (imageUrl != null && !imageUrl.isBlank()) {
                            try {
                                com.fasterxml.jackson.databind.node.ObjectNode refNode = objectMapper.createObjectNode();
                                refNode.put("imageUrl", imageUrl);
                                
                                com.fasterxml.jackson.databind.node.ObjectNode predNode = objectMapper.createObjectNode();
                                predNode.put("disease", savedRec.getDiseaseDetected());
                                predNode.put("score", savedRec.getConfidenceScore());
                                
                                com.fasterxml.jackson.databind.node.ArrayNode predsArray = objectMapper.createArrayNode();
                                predsArray.add(predNode);

                                com.krishihub.diagnosis.entity.AIDiagnosis diagnosis = com.krishihub.diagnosis.entity.AIDiagnosis.builder()
                                    .farmerId(farmerId)
                                    .cropType(savedRec.getCropName())
                                    .district("Unknown") // Chat doesn't strictly require district yet
                                    .inputType(com.krishihub.diagnosis.enums.DiagnosisInputType.IMAGE)
                                    .inputReferences(refNode)
                                    .aiPredictions(predsArray) // Needs to be array for frontend
                                    .aiExplanation(savedRec.getRecommendation())
                                    .reviewStatus(com.krishihub.diagnosis.enums.ReviewStatus.PENDING)
                                    .build();
                                
                                aiDiagnosisRepository.save(diagnosis);
                            } catch (Exception ex) {
                                log.error("Failed to auto-create diagnosis for review", ex);
                            }
                        }

                        return savedRec;

                } catch (Exception e) {
                        log.error("OpenAI API failure", e);
                }

                // Fallback
                return aiRecommendationRepository.save(
                                AiRecommendation.builder()
                                                .farmerId(farmerId)
                                                .queryText(query)
                                                .imageUrl(imageUrl)
                                                .cropName("Unknown")
                                                .diseaseDetected("Error")
                                                .confidenceScore(0.0)
                                                .recommendation(
                                                                "Unable to analyze your request at the moment. Please try again later.")
                                                .build());
        }
}
