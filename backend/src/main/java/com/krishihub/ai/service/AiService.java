package com.krishihub.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.krishihub.ai.entity.AiRecommendation;
import com.krishihub.ai.repository.AiRecommendationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiService {

        private final AiRecommendationRepository aiRecommendationRepository;
        private final WebClient openAiWebClient;
        private final ObjectMapper objectMapper;

        @Value("${app.openai.model}")
        private String openAiModel;

        public AiRecommendation maximizeCropYield(
                        UUID farmerId,
                        String query,
                        String imageUrl) {
                log.info("Generating AI recommendation for farmer: {}", farmerId);

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
                                """;

                String userInput = (query != null ? query : "")
                                + (imageUrl != null ? "\nImage URL: " + imageUrl : "");

                Map<String, Object> request = Map.of(
                                "model", openAiModel,
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

                        return aiRecommendationRepository.save(recommendation);

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
