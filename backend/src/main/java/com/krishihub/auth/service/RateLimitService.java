package com.krishihub.auth.service;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class RateLimitService {

    private final Map<String, UserRequestCount> requestCounts = new ConcurrentHashMap<>();
    private static final long RATE_LIMIT = 100; // requests per minute
    private static final long TIME_WINDOW = 60000; // 1 minute in ms

    public boolean tryConsume(String key) {
        long now = System.currentTimeMillis();
        requestCounts.putIfAbsent(key, new UserRequestCount(now, 0));
        UserRequestCount count = requestCounts.get(key);

        synchronized (count) {
            if (now - count.startTime > TIME_WINDOW) {
                count.startTime = now;
                count.count = 1;
                return true;
            }

            if (count.count < RATE_LIMIT) {
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
