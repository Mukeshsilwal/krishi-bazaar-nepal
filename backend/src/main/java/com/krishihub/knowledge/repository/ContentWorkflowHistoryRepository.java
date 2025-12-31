package com.krishihub.knowledge.repository;

import com.krishihub.knowledge.entity.ContentWorkflowHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ContentWorkflowHistoryRepository extends JpaRepository<ContentWorkflowHistory, UUID> {
    List<ContentWorkflowHistory> findByContentIdOrderByCreatedAtDesc(UUID contentId);
}
