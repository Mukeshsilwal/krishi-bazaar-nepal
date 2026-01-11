package com.krishihub.admin.service;

import com.krishihub.admin.entity.AuditLog;
import com.krishihub.admin.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW) // Ensure log is saved even if main tx fails
    public void logAction(UUID actorId, String action, String resourceType, String resourceId,
            Map<String, Object> changes, String ip, String userAgent) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .actorId(actorId)
                    .action(action)
                    .resourceType(resourceType)
                    .resourceId(resourceId)
                    .changes(changes)
                    .ipAddress(ip)
                    .userAgent(userAgent)
                    .build();

            auditLogRepository.save(auditLog);
            log.info("Audit log created for action: {} on resource: {}", action, resourceId);
        } catch (Exception e) {
            log.error("Failed to save audit log", e);
        }
    }
}
