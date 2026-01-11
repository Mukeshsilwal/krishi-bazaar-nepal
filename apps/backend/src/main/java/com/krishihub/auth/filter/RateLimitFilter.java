package com.krishihub.auth.filter;

import com.krishihub.auth.service.RateLimitService;
import com.krishihub.shared.exception.BadRequestException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimitService rateLimitService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String ipAddress = request.getRemoteAddr();
        // In prod, check X-Forwarded-For if behind proxy
        
        if (!rateLimitService.tryConsume(ipAddress)) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.getWriter().write("Too many requests");
            return;
        }

        filterChain.doFilter(request, response);
    }
    
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        // Apply only to /api/auth endpoints or specific critical paths to avoid blocking static resources if any
        // For now, applying to all /api requests seems safe given the generous limit (100/min)
        String path = request.getRequestURI();
        return !path.startsWith("/api");
    }
}
