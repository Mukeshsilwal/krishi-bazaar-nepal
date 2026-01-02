package com.krishihub.knowledge.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.krishihub.knowledge.ingestion.RawKnowledgeContent;
import com.krishihub.knowledge.ingestion.RawKnowledgeContentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiKnowledgeService {

    private final ProcessedKnowledgeRepository processedKnowledgeRepository;
    private final RawKnowledgeContentRepository rawKnowledgeContentRepository;
    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;

    private final com.krishihub.knowledge.moderation.ModerationService moderationService;

    @Value("${app.openai.api-key}")
    private String openAiApiKey;

    @Value("${app.openai.api-url}")
    private String openAiApiUrl;

    @Value("${app.openai.model}")
    private String openAiModel;

    @Async
    public void processContentAsync(UUID rawContentId) {
        log.info("Starting AI processing for raw content: {}", rawContentId);
        RawKnowledgeContent rawContent = rawKnowledgeContentRepository.findById(rawContentId)
                .orElseThrow(() -> new IllegalArgumentException("Raw content not found: " + rawContentId));

        try {
            ProcessedKnowledge processed = generateAdvisory(rawContent);
            processedKnowledgeRepository.save(processed);

            // Update raw content status
            rawContent.setStatus(RawKnowledgeContent.IngestionStatus.PROCESSED);
            rawKnowledgeContentRepository.save(rawContent);

            log.info("Successfully processed content: {}", processed.getTitle());

            // Trigger Moderation
            moderationService.createModerationRequest(processed);

        } catch (Exception e) {
            log.error("Failed to process content: " + rawContentId, e);
            rawContent.setStatus(RawKnowledgeContent.IngestionStatus.FAILED);
            rawKnowledgeContentRepository.save(rawContent);
        }
    }

    private ProcessedKnowledge generateAdvisory(RawKnowledgeContent rawContent) throws Exception {
        String systemPrompt = """
                You are a senior agricultural expert for Kisan Sarathi in Nepal.
                Your task is to convert raw agricultural text into a structured, simple, and actionable advisory for farmers.

                Rules:
                1. Simplify technical jargon.
                2. Focus on localized context for Nepal (seasons, crops, soil).
                3. Translate the advisory into Nepali (Devalnagari script) as the primary output.
                4. Extract metadata: tags, language, category.

                Input Text:
                %s

                Respond ONLY in valid JSON with:
                {
                  "title": "Short Nepali Title",
                  "content": "Full advisory text in Nepali (Markdown supported)",
                  "language": "ne",
                  "tags": ["tag1", "tag2"],
                  "category": "Crop/Disease/Market/General"
                }
                """
                .formatted(rawContent.getOriginalText());

        Map<String, Object> request = Map.of(
                "model", openAiModel,
                "messages", java.util.List.of(
                        Map.of("role", "system", "content", systemPrompt)),
                "response_format", Map.of("type", "json_object"));

        String rawResponse = webClientBuilder.build().post()
                .uri(openAiApiUrl)
                .header("Authorization", "Bearer " + openAiApiKey)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(String.class)
                .block(); // Block is okay in @Async method

        JsonNode root = objectMapper.readTree(rawResponse);
        String content = root.path("choices").get(0).path("message").path("content").asText();
        JsonNode json = objectMapper.readTree(content);

        return ProcessedKnowledge.builder()
                .rawContent(rawContent)
                .title(json.path("title").asText())
                .processedContent(json.path("content").asText())
                .language(json.path("language").asText("ne"))
                .tags(json.path("tags").toString())
                .aiModelUsed(openAiModel)
                .isObsolete(false)
                .build();
    }
}
