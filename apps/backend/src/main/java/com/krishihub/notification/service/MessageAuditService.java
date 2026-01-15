package com.krishihub.notification.service;

import com.krishihub.notification.dto.MessageRequest;
import com.krishihub.notification.enums.MessageType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;



@Service
@Slf4j
public class MessageAuditService {

    public void logAttempt(MessageRequest request) {
        log.info("AUDIT: Attempting to send {} to {}. Subject: {}",
                request.getType(), request.getRecipient(), request.getSubject());
    }

    public void logSuccess(MessageRequest request) {
        log.info("AUDIT: SUCCESS - Sent {} to {} at {}",
                request.getType(), request.getRecipient(), com.krishihub.common.util.DateTimeProvider.now());
    }

    public void logFailure(MessageRequest request, Throwable error) {
        log.error("AUDIT: DISASTER - Failed to send {} to {}. Error: {}",
                request.getType(), request.getRecipient(), error.getMessage());
    }
}
