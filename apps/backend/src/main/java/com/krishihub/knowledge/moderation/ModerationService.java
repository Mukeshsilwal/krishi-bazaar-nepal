package com.krishihub.knowledge.moderation;

import com.krishihub.knowledge.ai.ProcessedKnowledge;
import com.krishihub.knowledge.ai.ProcessedKnowledgeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ModerationService {

    private final ModerationQueueRepository moderationQueueRepository;
    private final ProcessedKnowledgeRepository processedKnowledgeRepository;
    private final com.krishihub.knowledge.repository.ArticleRepository articleRepository;

    @Transactional
    public void createModerationRequest(ProcessedKnowledge processedKnowledge) {
        ModerationQueue queueItem = ModerationQueue.builder()
                .processedKnowledge(processedKnowledge)
                .status(ModerationQueue.ModerationStatus.PENDING)
                .build();
        moderationQueueRepository.save(queueItem);
    }

    @Transactional(readOnly = true)
    public List<ModerationQueue> getPendingRequests() {
        return moderationQueueRepository.findByStatus(ModerationQueue.ModerationStatus.PENDING);
    }

    @Transactional
    public void approveRequest(UUID queueId, UUID reviewerId) {
        ModerationQueue item = moderationQueueRepository.findById(queueId)
                .orElseThrow(() -> new IllegalArgumentException("Queue item not found: " + queueId));

        item.setStatus(ModerationQueue.ModerationStatus.APPROVED);
        item.setAssignedReviewerId(reviewerId);
        moderationQueueRepository.save(item);

        // Publish to Knowledge Store
        ProcessedKnowledge pk = item.getProcessedKnowledge();
        com.krishihub.knowledge.entity.Article article = com.krishihub.knowledge.entity.Article.builder()
                .titleNe(pk.getTitle())
                .titleEn(pk.getTitle()) // Fallback
                .contentNe(pk.getProcessedContent())
                .contentEn(pk.getProcessedContent()) // Fallback
                .status(com.krishihub.knowledge.entity.ArticleStatus.PUBLISHED)
                // Attribution
                .sourceName(pk.getRawContent().getSource().getName())
                .sourceUrl(pk.getRawContent().getSourceUrl())
                .build();

        articleRepository.save(article);
    }

    @Transactional
    public void rejectRequest(UUID queueId, UUID reviewerId, String comments) {
        ModerationQueue item = moderationQueueRepository.findById(queueId)
                .orElseThrow(() -> new IllegalArgumentException("Queue item not found: " + queueId));

        item.setStatus(ModerationQueue.ModerationStatus.REJECTED);
        item.setAssignedReviewerId(reviewerId);
        item.setReviewerComments(comments);
        moderationQueueRepository.save(item);
    }
}
