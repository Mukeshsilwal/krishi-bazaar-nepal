package com.krishihub.auth.service;

import com.krishihub.service.SystemConfigService;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class RateLimitService {

    private final SystemConfigService systemConfigService;
    private final Map<String, UserRequestCount> requestCounts = new ConcurrentHashMap<>();
    
    public RateLimitService(SystemConfigService systemConfigService) {
        this.systemConfigService = systemConfigService;
    }

    public boolean tryConsume(String key) {
        long now = System.currentTimeMillis();
        requestCounts.putIfAbsent(key, new UserRequestCount(now, 0));
        UserRequestCount count = requestCounts.get(key);

        long  rateLimit = systemConfigService.getLong("auth.rate_limit.requests", 100);
        long  timeWindow = systemConfigService.getLong("auth.rate_limit.window_ms", 60000);

        synchronized (count) {
            if (now - count.startTime > timeWindow) {
                count.startTime = now;
                count.count = 1;
                return true;
            }

            if (count.count < rateLimit) {
                count.count++;
                return true;
            }
        }
        return false;
    }

    private static class UserRequestCount {
        long startTime;
        long count;

        UserRequestCount(long startTime, long count) {
            this.startTime = startTime;
            this.count = count;
        }
    }
}
