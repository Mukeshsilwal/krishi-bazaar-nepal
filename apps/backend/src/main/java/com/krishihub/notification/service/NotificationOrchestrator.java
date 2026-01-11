package com.krishihub.notification.service;

import com.krishihub.notification.dto.MessageRequest;
import com.krishihub.notification.factory.MessageServiceFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationOrchestrator {

    private final MessageServiceFactory messageServiceFactory;
    private final MessageAuditService auditService;

    public void send(MessageRequest request) {
        try {
            auditService.logAttempt(request);

            MessageService service = messageServiceFactory.getService(request.getType());
            if (service == null) {
                throw new UnsupportedOperationException("No provider found for type: " + request.getType());
            }

            service.send(request);
            auditService.logSuccess(request);

        } catch (Exception e) {
            auditService.logFailure(request, e);
            throw e; // Propagate exception to caller/global handler
        }
    }
}
