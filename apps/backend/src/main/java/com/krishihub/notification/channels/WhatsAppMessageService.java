package com.krishihub.notification.channels;

import com.krishihub.notification.dto.MessageRequest;
import com.krishihub.notification.enums.MessageType;
import com.krishihub.notification.service.MessageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@lombok.RequiredArgsConstructor
public class WhatsAppMessageService implements MessageService {

    private final com.krishihub.config.TwilioConfig twilioConfig;
    private final com.krishihub.notification.repository.WhatsAppMessageRepository messageRepository;

    @Override
    public void send(MessageRequest request) {
        if (request.getType() != MessageType.WHATSAPP) {
            log.warn("WhatsAppMessageService called with invalid type: {}", request.getType());
            return;
        }

        try {
            String to = request.getRecipient();
            String messageBody = request.getContent();
            
            // Format phone number if needed (Twilio requires E.164)
            String formattedTo = to.startsWith("+") ? to : "+977" + to; 
            String formattedFrom = "whatsapp:" + twilioConfig.getWhatsappNumber();
            
            com.twilio.rest.api.v2010.account.Message twilioMessage = com.twilio.rest.api.v2010.account.Message.creator(
                new com.twilio.type.PhoneNumber("whatsapp:" + formattedTo),
                new com.twilio.type.PhoneNumber(formattedFrom),
                messageBody
            ).create();
            
            log.info("WhatsApp message sent successfully: SID={}", twilioMessage.getSid());
            
            // Track in database
            com.krishihub.notification.entity.WhatsAppMessage record = com.krishihub.notification.entity.WhatsAppMessage.builder()
                .recipient(to)
                .message(messageBody)
                .twilioSid(twilioMessage.getSid())
                .status(twilioMessage.getStatus().toString())
                .build();
            
            messageRepository.save(record);
            
        } catch (com.twilio.exception.ApiException e) {
            log.error("Failed to send WhatsApp message via Twilio: {}", e.getMessage());
        }
    }

    @Override
    public com.krishihub.notification.enums.MessageType getSupportedType() {
        return com.krishihub.notification.enums.MessageType.WHATSAPP;
    }
}
