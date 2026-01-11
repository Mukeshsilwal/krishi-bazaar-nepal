package com.krishihub.knowledge.moderation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ModerationQueueRepository extends JpaRepository<ModerationQueue, UUID> {
    List<ModerationQueue> findByStatus(ModerationQueue.ModerationStatus status);
}
