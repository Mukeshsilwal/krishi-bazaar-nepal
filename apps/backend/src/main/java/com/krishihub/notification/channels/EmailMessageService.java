package com.krishihub.notification.channels;

import com.krishihub.notification.dto.MessageRequest;
import com.krishihub.notification.enums.MessageType;
import com.krishihub.notification.provider.SendGridClient;
import com.krishihub.notification.service.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailMessageService implements MessageService {

    private final SendGridClient sendGridClient;

    @Override
    public void send(MessageRequest request) {
        if (request.getType() != MessageType.EMAIL) {
            log.warn("EmailMessageService called with invalid type: {}", request.getType());
            return;
        }

        log.info("EmailMessageService processing email for: {}", request.getRecipient());
        sendGridClient.sendEmail(
                request.getRecipient(),
                request.getSubject(),
                request.getContent());
    }

    @Override
    public com.krishihub.notification.enums.MessageType getSupportedType() {
        return com.krishihub.notification.enums.MessageType.EMAIL;
    }
}
