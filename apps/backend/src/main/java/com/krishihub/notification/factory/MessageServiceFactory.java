package com.krishihub.notification.factory;

import com.krishihub.notification.enums.MessageType;
import com.krishihub.notification.service.MessageService;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class MessageServiceFactory {

    private final Map<MessageType, MessageService> services;

    public MessageServiceFactory(List<MessageService> serviceList) {
        this.services = serviceList.stream()
                .collect(Collectors.toMap(
                        MessageService::getSupportedType,
                        Function.identity()));
    }

    public MessageService getService(MessageType type) {
        return services.get(type);
    }
}
