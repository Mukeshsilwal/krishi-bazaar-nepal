package com.krishihub.notification.service;

import com.krishihub.notification.dto.MessageRequest;
import com.krishihub.notification.enums.MessageType;

public interface MessageService {
    void send(MessageRequest request);

    MessageType getSupportedType();
}
