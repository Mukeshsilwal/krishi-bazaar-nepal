package com.krishihub.knowledge.source;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class KnowledgeSourceService {

    private final KnowledgeSourceRepository sourceRepository;

    @Transactional
    public KnowledgeSource createSource(KnowledgeSource source) {
        if (sourceRepository.existsByName(source.getName())) {
            throw new IllegalArgumentException("Source with name " + source.getName() + " already exists");
        }
        // Default values for new source
        source.setTrustScore(50); // Start with neutral trust
        source.setStatus(KnowledgeSource.SourceStatus.PENDING_APPROVAL);
        return sourceRepository.save(source);
    }

    @Transactional(readOnly = true)
    public List<KnowledgeSource> getAllSources() {
        return sourceRepository.findAll();
    }

    @Transactional(readOnly = true)
    public KnowledgeSource getSourceById(UUID id) {
        return sourceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Source not found with id: " + id));
    }

    @Transactional
    public KnowledgeSource updateSource(UUID id, KnowledgeSource sourceDetails) {
        KnowledgeSource source = getSourceById(id);

        source.setName(sourceDetails.getName());
        source.setOrganization(sourceDetails.getOrganization());
        source.setUrl(sourceDetails.getUrl());
        source.setDescription(sourceDetails.getDescription());
        source.setType(sourceDetails.getType());
        source.setLicenseType(sourceDetails.getLicenseType());
        source.setAllowedUsage(sourceDetails.getAllowedUsage());
        source.setConfigJson(sourceDetails.getConfigJson());

        // Admin only fields might be separate, but for now allow update if authorized
        // Ideally trustScore is updated via a separate process or admin action

        return sourceRepository.save(source);
    }

    @Transactional
    public KnowledgeSource updateStatus(UUID id, KnowledgeSource.SourceStatus status) {
        KnowledgeSource source = getSourceById(id);
        source.setStatus(status);
        return sourceRepository.save(source);
    }

    @Transactional
    public KnowledgeSource updateTrustScore(UUID id, int score) {
        if (score < 0 || score > 100) {
            throw new IllegalArgumentException("Trust score must be between 0 and 100");
        }
        KnowledgeSource source = getSourceById(id);
        source.setTrustScore(score);
        return sourceRepository.save(source);
    }

    @Transactional
    public void updateLastSyncedAt(UUID id) {
        KnowledgeSource source = getSourceById(id);
        source.setLastSyncedAt(LocalDateTime.now());
        sourceRepository.save(source);
    }

    @Transactional
    public void deleteSource(UUID id) {
        if (!sourceRepository.existsById(id)) {
            throw new IllegalArgumentException("Source not found with id: " + id);
        }
        sourceRepository.deleteById(id);
    }
}
