package com.krishihub.analytics.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class ActivityEvent extends ApplicationEvent {

    private final java.util.UUID userId;
    private final String action;
    private final String details;
    private final String ipAddress;

    public ActivityEvent(Object source, java.util.UUID userId, String action, String details, String ipAddress) {
        super(source);
        this.userId = userId;
        this.action = action;
        this.details = details;
        this.ipAddress = ipAddress;
    }
}
