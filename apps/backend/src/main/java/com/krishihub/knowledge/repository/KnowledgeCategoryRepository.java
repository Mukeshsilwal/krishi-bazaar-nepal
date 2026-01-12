package com.krishihub.knowledge.repository;

import com.krishihub.knowledge.entity.KnowledgeCategory;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface KnowledgeCategoryRepository extends JpaRepository<KnowledgeCategory, UUID> {
}
