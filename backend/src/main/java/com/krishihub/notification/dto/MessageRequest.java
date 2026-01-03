package com.krishihub.notification.dto;

import com.krishihub.notification.enums.MessageType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageRequest {
    private MessageType type;
    private String recipient;
    private String subject; // Optional for SMS/WhatsApp
    private String content;
    private Map<String, Object> metadata;
}
