package com.krishihub.knowledge.ingestion;

import com.krishihub.knowledge.source.KnowledgeSource;
import com.krishihub.knowledge.source.KnowledgeSourceRepository;
import com.krishihub.knowledge.source.KnowledgeSourceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class IngestionService {

    private final KnowledgeSourceRepository sourceRepository; // Use Repo directly for batch ops if needed
    private final KnowledgeSourceService sourceService;
    private final RawKnowledgeContentRepository rawContentRepository;
    private final com.krishihub.knowledge.ai.AiKnowledgeService aiKnowledgeService;

    // Run every hour
    @Scheduled(fixedRate = 3600000)
    public void runIngestionJob() {
        log.info("Starting knowledge ingestion job");
        List<KnowledgeSource> activeSources = sourceRepository.findByStatus(KnowledgeSource.SourceStatus.ACTIVE);

        for (KnowledgeSource source : activeSources) {
            try {
                processSource(source);
                sourceService.updateLastSyncedAt(source.getId());
            } catch (Exception e) {
                log.error("Failed to ingest from source: " + source.getName(), e);
            }
        }
        log.info("Completed knowledge ingestion job");
    }

    private void processSource(KnowledgeSource source) {
        log.info("Processing source: {}", source.getName());
        if (source.getType() == KnowledgeSource.SourceType.RSS_FEED) {
            fetchRssFeed(source);
        } else {
            log.warn("Source type {} not yet supported for automated ingestion", source.getType());
        }
    }

    private void fetchRssFeed(KnowledgeSource source) {
        // TODO: Implement actual RSS parsing logic using Rome or java.net.http
        // For POC, we will simulate fetching
        log.info("Fetching RSS feed from: {}", source.getUrl());

        // Simulation of fetched item
        String simulatedTitle = "Simulated Article from " + source.getName() + " at " + LocalDateTime.now();
        String simulatedBody = "This is the raw content of the article relevant to farming.";
        String simulatedUrl = source.getUrl() + "/article/1";
        String contentHash = calculateHash(simulatedTitle + simulatedBody);

        saveRawContent(source, simulatedTitle, simulatedBody, simulatedUrl, "Unknown Author", contentHash);
    }

    private void saveRawContent(KnowledgeSource source, String title, String body, String url, String author,
            String hash) {
        if (rawContentRepository.existsByContentHash(hash)) {
            log.info("Content already exists, skipping: {}", title);
            return;
        }

        RawKnowledgeContent content = RawKnowledgeContent.builder()
                .source(source)
                .title(title)
                .originalText(body) // Store full body
                .sourceUrl(url)
                .author(author)
                .contentHash(hash)
                .fetchedAt(LocalDateTime.now())
                .status(RawKnowledgeContent.IngestionStatus.PENDING_PROCESSING)
                .build();

        rawContentRepository.save(content);
        log.info("Ingested new content: {}", title);

        try {
            aiKnowledgeService.processContentAsync(content.getId());
        } catch (Exception e) {
            log.error("Failed to trigger AI processing", e);
        }
    }

    private String calculateHash(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedhash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(encodedhash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not found", e);
        }
    }
}
