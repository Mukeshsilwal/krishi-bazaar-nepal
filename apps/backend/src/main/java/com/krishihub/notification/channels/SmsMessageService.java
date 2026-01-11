package com.krishihub.notification.channels;

import com.krishihub.auth.service.SmsService;
import com.krishihub.notification.dto.MessageRequest;
import com.krishihub.notification.enums.MessageType;
import com.krishihub.notification.service.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class SmsMessageService implements MessageService {

    private final SmsService smsService;

    @Override
    public void send(MessageRequest request) {
        if (request.getType() != MessageType.SMS) {
            log.warn("SmsMessageService called with invalid type: {}", request.getType());
            return;
        }

        log.info("SmsMessageService delegating SMS for: {}", request.getRecipient());
        // Using sendNotification method from existing SmsService
        smsService.sendNotification(request.getRecipient(), request.getContent());
    }

    @Override
    public com.krishihub.notification.enums.MessageType getSupportedType() {
        return com.krishihub.notification.enums.MessageType.SMS;
    }
}
