package com.krishihub.analytics.listener;

import com.krishihub.analytics.event.ActivityEvent;
import com.krishihub.analytics.service.UserActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ActivityEventListener {

    private final UserActivityService userActivityService;

    @Async
    @EventListener
    public void handleActivityEvent(ActivityEvent event) {
        userActivityService.logActivity(
                event.getUserId(),
                event.getAction(),
                event.getDetails(),
                event.getIpAddress()
        );
    }
}
