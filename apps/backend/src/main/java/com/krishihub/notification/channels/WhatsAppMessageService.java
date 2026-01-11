package com.krishihub.notification.channels;

import com.krishihub.notification.dto.MessageRequest;
import com.krishihub.notification.enums.MessageType;
import com.krishihub.notification.service.MessageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class WhatsAppMessageService implements MessageService {

    @Override
    public void send(MessageRequest request) {
        if (request.getType() != MessageType.WHATSAPP) {
            log.warn("WhatsAppMessageService called with invalid type: {}", request.getType());
            return;
        }

        // TODO: Integrate with WhatsApp Business API provider
        log.info("WhatsApp message simulated for {}: {}", request.getRecipient(), request.getContent());
    }

    @Override
    public com.krishihub.notification.enums.MessageType getSupportedType() {
        return com.krishihub.notification.enums.MessageType.WHATSAPP;
    }
}
