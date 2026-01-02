package com.krishihub.knowledge.source;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface KnowledgeSourceRepository extends JpaRepository<KnowledgeSource, UUID> {
    List<KnowledgeSource> findByStatus(KnowledgeSource.SourceStatus status);

    boolean existsByName(String name);
}
