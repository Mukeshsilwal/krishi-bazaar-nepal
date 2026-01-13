package com.krishihub.auth.service;

import com.krishihub.service.SystemConfigService;
import com.krishihub.shared.exception.ActiveSessionExistsException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class SessionManagementService {

    private final StringRedisTemplate redisTemplate;
    private final SystemConfigService systemConfigService;

    public void checkAndSetLoginLock(UUID userId) {
        try {
            String key = "login:lock:" + userId;
            if (Boolean.TRUE.equals(redisTemplate.hasKey(key))) {
                 throw new ActiveSessionExistsException("User is already logged in on another device.");
            }
            long jwtExp = systemConfigService.getLong("auth.jwt.expiration_ms", 86400000L);
            redisTemplate.opsForValue().set(key, "true", jwtExp, TimeUnit.MILLISECONDS);
        } catch (ActiveSessionExistsException e) {
            throw e; 
        } catch (Exception e) {
            log.error("Redis connection failed during login lock check", e);
        }
    }

    public void logout(UUID userId) {
        try {
            String key = "login:lock:" + userId;
            redisTemplate.delete(key);
            log.info("User logged out, lock released: {}", userId);
        } catch (Exception e) {
             log.error("Redis failed during logout", e);
        }
    }
}
