package com.krishihub.common.audit;

import com.krishihub.common.context.UserContextHolder;
import org.springframework.data.domain.AuditorAware;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component("auditorAware")
public class SpringSecurityAuditorAware implements AuditorAware<UUID> {

    @Override
    @NonNull
    public Optional<UUID> getCurrentAuditor() {
        return Optional.ofNullable(UserContextHolder.getUserId());
    }
}
