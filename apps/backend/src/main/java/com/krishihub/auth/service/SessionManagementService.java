package com.krishihub.auth.service;

import com.krishihub.service.SystemConfigService;
import com.krishihub.shared.exception.ActiveSessionExistsException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * Manages user sessions and enforces single active login per user.
 *
 * Design Notes:
 * - Uses Redis to maintain a distributed lock ensuring only one active session
 *   per user across web and mobile platforms.
 * - Lock key format: "login:lock:{userId}" with TTL matching JWT expiration.
 * - This prevents concurrent logins from multiple devices/browsers.
 *
 * Important:
 * - Redis failures during login are logged but do NOT block authentication.
 * - This ensures the system remains available even if Redis is down.
 * - However, single-login enforcement will be bypassed in such cases.
 * - Removing this lock mechanism will break concurrent login prevention.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SessionManagementService {

    private final StringRedisTemplate redisTemplate;
    private final SystemConfigService systemConfigService;

    @Value("${app.jwt.expiration}")
    private long tokenExpTime;

    /**
     * Checks if user already has an active session and sets login lock if not.
     *
     * Business Rule:
     * - Throws ActiveSessionExistsException if user is already logged in elsewhere.
     * - Lock TTL matches JWT expiration to auto-release when token expires.
     * - This enforces single active session per user across all platforms.
     *
     * Important:
     * - Redis failures are logged but do NOT throw exceptions to prevent
     *   authentication system downtime when Redis is unavailable.
     * - In such cases, multiple concurrent logins will be allowed temporarily.
     * - ActiveSessionExistsException is re-thrown to preserve business logic.
     */
    public void checkAndSetLoginLock(UUID userId) {
        try {
            String key = "login:lock:" + userId;
            if (Boolean.TRUE.equals(redisTemplate.hasKey(key))) {
                 throw new ActiveSessionExistsException("User is already logged in on another device.");
            }
            long jwtExp = systemConfigService.getLong("auth.jwt.expiration_ms", tokenExpTime);
            redisTemplate.opsForValue().set(key, "true", jwtExp, TimeUnit.MILLISECONDS);
        } catch (ActiveSessionExistsException e) {
            throw e;
        } catch (Exception e) {
            log.error("Redis connection failed during login lock check", e);
        }
    }

    /**
     * Releases the login lock for a user during logout.
     *
     * Business Rule:
     * - Deletes the Redis lock key to allow the user to log in again.
     * - This is called explicitly during logout to immediately free the session.
     *
     * Important:
     * - Redis failures during logout are logged but do NOT throw exceptions.
     * - In such cases, the lock will auto-expire when JWT TTL expires.
     * - This ensures logout always succeeds from the user's perspective.
     */
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
