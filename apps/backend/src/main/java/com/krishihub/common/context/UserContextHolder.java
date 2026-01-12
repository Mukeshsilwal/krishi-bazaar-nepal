package com.krishihub.common.context;

import com.krishihub.auth.model.CustomUserDetails;
import com.krishihub.auth.entity.User.UserRole;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;
import java.util.UUID;

public class UserContextHolder {

    private static final ThreadLocal<CustomUserDetails> userContext = new ThreadLocal<>();

    public static void setUser(CustomUserDetails user) {
        userContext.set(user);
    }

    public static void clear() {
        userContext.remove();
    }

    public static Optional<CustomUserDetails> getCurrentUser() {
        return Optional.ofNullable(userContext.get());
    }

    public static UUID getUserId() {
        return getCurrentUser()
                .map(CustomUserDetails::getId)
                .orElse(null);
    }

    public static UserRole getUserType() {
        return getCurrentUser()
                .map(CustomUserDetails::getUserType)
                .orElse(null);
    }

    public static String getDistrict() {
        return getCurrentUser()
                .map(CustomUserDetails::getDistrict)
                .orElse(null);
    }
}
