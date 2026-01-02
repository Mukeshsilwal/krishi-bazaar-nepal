package com.krishihub.content.service;

import com.krishihub.content.entity.Content;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@Slf4j
public class ContentAuditService {

    public void logChange(Content content, String action, String changedBy, String reason) {
        log.info("Content Audit: ID={}, Action={}, By={}, Reason={}",
                content.getId(), action, changedBy, reason);
        // In a real implementation, this would save to a ContentAudit entity/table
    }
}
