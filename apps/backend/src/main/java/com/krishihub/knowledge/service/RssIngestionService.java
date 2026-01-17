package com.krishihub.knowledge.service;

import com.krishihub.knowledge.entity.Article;
import com.krishihub.knowledge.entity.ArticleStatus;
import com.krishihub.knowledge.repository.ArticleRepository;
import com.rometools.rome.feed.synd.SyndEntry;
import com.rometools.rome.feed.synd.SyndFeed;
import com.rometools.rome.io.SyndFeedInput;
import com.rometools.rome.io.XmlReader;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.net.URL;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RssIngestionService {

    private final ArticleRepository articleRepository;

    private static final List<String> RSS_FEEDS = List.of(
        "https://moald.gov.np/feed/", // Example: Ministry of Agriculture
        "https://kalimarket.gov.np/feed/" // Example: Kali Mati Market
    );

    @Scheduled(cron = "0 0 1 * * ?") // Every day at 1 AM
    public void ingestFromRss() {
        log.info("Starting RSS ingestion...");
        for (String feedUrl : RSS_FEEDS) {
            try {
                SyndFeedInput input = new SyndFeedInput();
                SyndFeed feed = input.build(new XmlReader(new URL(feedUrl)));

                for (SyndEntry entry : feed.getEntries()) {
                    String externalId = entry.getUri();
                    if (articleRepository.existsByExternalId(externalId)) {
                        continue;
                    }

                    Article article = Article.builder()
                            .titleEn(entry.getTitle())
                            .contentEn(entry.getDescription() != null ? entry.getDescription().getValue() : "")
                            .externalId(externalId)
                            .externalUrl(entry.getLink())
                            .sourceName(feed.getTitle())
                            .sourceUrl(feed.getLink())
                            .status(ArticleStatus.DRAFT) // Pending review
                            .build();

                    articleRepository.save(article);
                    log.info("Ingested article: {}", article.getTitleEn());
                }
            } catch (Exception e) {
                log.error("Failed to ingest from RSS feed {}: {}", feedUrl, e.getMessage());
            }
        }
    }
}
