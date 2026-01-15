package com.krishihub.analytics.service;

import com.krishihub.analytics.entity.UserActivity;
import com.krishihub.analytics.repository.UserActivityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserActivityService {

    private final UserActivityRepository userActivityRepository;

    public void logActivity(UUID userId, String action, String details, String ipAddress) {
        try {
            UserActivity activity = UserActivity.builder()
                    .userId(userId)
                    .action(action)
                    .details(details)
                    .ipAddress(ipAddress)
                    .build();
            userActivityRepository.save(activity);
            log.debug("Logged activity: {} for user: {}", action, userId);
        } catch (Exception e) {
            log.error("Failed to log user activity", e);
        }
    }

    public Page<UserActivity> getAllActivities(Pageable pageable) {
        return userActivityRepository.findAll(pageable);
    }
    
    public Page<UserActivity> getActivitiesByTimeRange(java.util.Date start, java.util.Date end, Pageable pageable) {
        return userActivityRepository.findByTimestampBetween(start, end, pageable);
    }
}
