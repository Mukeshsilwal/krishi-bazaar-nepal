package com.krishihub.knowledge.ingestion;

import com.krishihub.knowledge.source.KnowledgeSource;
import com.krishihub.knowledge.source.KnowledgeSourceRepository;
import com.krishihub.knowledge.source.KnowledgeSourceService;
import com.rometools.rome.io.SyndFeedInput;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
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
        log.info("Fetching RSS feed from: {}", source.getUrl());
        try {
            java.net.URL feedUrl = new java.net.URL(source.getUrl());
            SyndFeedInput input = new SyndFeedInput();
            com.rometools.rome.feed.synd.SyndFeed feed = input.build(new com.rometools.rome.io.XmlReader(feedUrl));

            log.info("Parsed RSS feed: {} with {} entries", feed.getTitle(), feed.getEntries().size());

            for (com.rometools.rome.feed.synd.SyndEntry entry : feed.getEntries()) {
                String title = entry.getTitle();
                String body = entry.getDescription() != null ? entry.getDescription().getValue() : "";
                
                // If body is empty, try contents
                if (body.isEmpty() && entry.getContents() != null && !entry.getContents().isEmpty()) {
                    body = entry.getContents().get(0).getValue();
                }

                String url = entry.getLink();
                String author = entry.getAuthor();
                String hash = calculateHash(title + body + url);
                
                java.util.Date publishedDate = entry.getPublishedDate();

                saveRawContent(source, title, body, url, author, hash, publishedDate);
            }
        } catch (Exception e) {
            log.error("Failed to fetch RSS feed from " + source.getUrl(), e);
        }
    }

    private void saveRawContent(KnowledgeSource source, String title, String body, String url, String author,
            String hash, java.util.Date publishedAt) {
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
                .publishedAtSource(publishedAt)
                .fetchedAt(com.krishihub.common.util.DateUtil.nowUtc())
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
