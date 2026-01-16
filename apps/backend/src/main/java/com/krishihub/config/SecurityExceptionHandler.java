package com.krishihub.config;

import com.krishihub.shared.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.util.stream.Collectors;

/**
 * Global exception handler for security-related exceptions.
 * Provides informative error messages for permission-denied scenarios.
 */
@Slf4j
@RestControllerAdvice
public class SecurityExceptionHandler {

    /**
     * Handle AccessDeniedException with informative error message.
     * Returns 403 Forbidden status with user-friendly message.
     * Logs user details and their current permissions for debugging.
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDeniedException(
            AccessDeniedException ex,
            WebRequest request) {
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        String username = auth != null ? auth.getName() : "anonymous";
        String userPermissions = auth != null && auth.getAuthorities() != null
                ? auth.getAuthorities().stream()
                    .map(Object::toString)
                    .collect(Collectors.joining(", "))
                : "none";
        
        String requestUri = request.getDescription(false).replace("uri=", "");
        
        log.warn("Access Denied - User: {}, Permissions: [{}], Endpoint: {}",
                username, userPermissions, requestUri);
        
        String errorMessage = "You don't have permission to access this resource. Please contact your administrator if you believe this is an error.";
        
        ApiResponse<Void> response = new ApiResponse<>();
        response.setCode(-1);
        response.setMessage(errorMessage);
        response.setData(null);
        
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(response);
    }
}
