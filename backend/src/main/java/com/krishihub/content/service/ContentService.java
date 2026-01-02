package com.krishihub.content.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.krishihub.content.dto.ContentDTO;
import com.krishihub.content.dto.ContentFilterDTO;
import com.krishihub.content.entity.Content;
import com.krishihub.content.enums.ContentStatus;
import com.krishihub.content.repository.ContentRepository;
import com.krishihub.content.enums.ContentType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContentService {

    private final ContentRepository repository;
    private final ContentValidationService validationService;
    private final ContentAuditService auditService;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public Page<ContentDTO> getContents(ContentFilterDTO filters, Pageable pageable) {
        return repository.findByFilters(
                filters.getContentType(),
                filters.getStatus(),
                filters.getRegion(),
                filters.getCrop(),
                pageable).map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public ContentDTO getContent(UUID id) {
        return repository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Content not found"));
    }

    @Transactional
    public ContentDTO createContent(ContentDTO dto, UUID userId) {
        validationService.validateContent(dto);

        Content content = toEntity(dto);
        content.setStatus(ContentStatus.DRAFT);
        content.setVersion(1);
        content.setCreatedBy(userId);

        Content saved = repository.save(content);
        auditService.logChange(saved, "CREATE", userId.toString(), "Initial creation");

        return toDTO(saved);
    }

    @Transactional
    public ContentDTO updateContent(UUID id, ContentDTO dto, UUID userId, String reason) {
        Content content = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Content not found"));

        if (content.getStatus() == ContentStatus.ACTIVE) {
            // Versioning logic could be here: create new version instead of update
            // For now, allow direct update if not strict strict versioning yet
            // Or better: require Deprecate -> Create New Version flow
            // But let's support editing DRAFT/REVIEW freely.
        }

        validationService.validateContent(dto);

        content.setTitle(dto.getTitle());
        content.setSummary(dto.getSummary());
        content.setStructuredBody(dto.getStructuredBody());
        content.setSupportedCrops(dto.getSupportedCrops());
        content.setSupportedRegions(dto.getSupportedRegions());
        content.setSupportedGrowthStages(dto.getSupportedGrowthStages());
        content.setTags(dto.getTags());
        content.setLinkedRuleIds(dto.getLinkedRuleIds());

        // Don't update status here, use transition methods

        Content saved = repository.save(content);
        auditService.logChange(saved, "UPDATE", userId.toString(), reason);

        return toDTO(saved);
    }

    @Transactional
    public void submitForReview(UUID id, UUID userId) {
        changeStatus(id, ContentStatus.REVIEW, userId, "Submitted for review");
    }

    @Transactional
    public void publishContent(UUID id, UUID userId) {
        changeStatus(id, ContentStatus.ACTIVE, userId, "Published");
        // Update publishedAt
        repository.findById(id).ifPresent(c -> {
            c.setPublishedAt(LocalDateTime.now());
            c.setReviewedBy(userId);
            repository.save(c);
        });
    }

    @Transactional
    public void deprecateContent(UUID id, UUID userId) {
        changeStatus(id, ContentStatus.DEPRECATED, userId, "Deprecated");
    }

    private void changeStatus(UUID id, ContentStatus newStatus, UUID userId, String reason) {
        Content content = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Content not found"));

        validationService.validateTransition(content.getStatus(), newStatus);

        content.setStatus(newStatus);
        repository.save(content);
        auditService.logChange(content, "STATUS_CHANGE", userId.toString(), reason);
    }

    private ContentDTO toDTO(Content content) {
        return ContentDTO.builder()
                .id(content.getId())
                .contentType(content.getContentType())
                .title(content.getTitle())
                .summary(content.getSummary())
                .structuredBody(content.getStructuredBody())
                .supportedCrops(content.getSupportedCrops())
                .supportedGrowthStages(content.getSupportedGrowthStages())
                .supportedRegions(content.getSupportedRegions())
                .severity(content.getSeverity())
                .language(content.getLanguage())
                .sourceType(content.getSourceType())
                .sourceReference(content.getSourceReference())
                .version(content.getVersion())
                .status(content.getStatus())
                .tags(content.getTags())
                .linkedRuleIds(content.getLinkedRuleIds())
                .createdBy(content.getCreatedBy())
                .reviewedBy(content.getReviewedBy())
                .publishedAt(content.getPublishedAt())
                .createdAt(content.getCreatedAt())
                .updatedAt(content.getUpdatedAt())
                .build();
    }

    private Content toEntity(ContentDTO dto) {
        return Content.builder()
                .contentType(dto.getContentType())
                .title(dto.getTitle())
                .summary(dto.getSummary())
                .structuredBody(dto.getStructuredBody())
                .supportedCrops(dto.getSupportedCrops())
                .supportedGrowthStages(dto.getSupportedGrowthStages())
                .supportedRegions(dto.getSupportedRegions())
                .severity(dto.getSeverity())
                .language(dto.getLanguage())
                .sourceType(dto.getSourceType())
                .sourceReference(dto.getSourceReference())
                .tags(dto.getTags())
                .linkedRuleIds(dto.getLinkedRuleIds())
                .build();
    }
}
