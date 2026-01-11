package com.krishihub.knowledge.ai;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProcessedKnowledgeRepository extends JpaRepository<ProcessedKnowledge, UUID> {
    Optional<ProcessedKnowledge> findByRawContentId(UUID rawContentId);
}
