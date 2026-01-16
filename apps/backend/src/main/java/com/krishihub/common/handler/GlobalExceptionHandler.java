package com.krishihub.common.handler;

import com.krishihub.common.exception.ApplicationException;
import com.krishihub.shared.dto.ApiResponse;
import com.krishihub.shared.exception.ActiveSessionExistsException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
// import org.springframework.beans.factory.annotation.Value; removed
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.authentication.BadCredentialsException;

import java.util.ArrayList;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    private final org.springframework.core.env.Environment environment;

    public GlobalExceptionHandler(org.springframework.core.env.Environment environment) {
        this.environment = environment;
    }

    private boolean isProduction() {
        return java.util.Arrays.asList(environment.getActiveProfiles()).contains("prod");
    }

    private String getDeveloperMessage(Exception ex) {
        if (isProduction()) {
            return null;
        }
        return ex.getMessage();
    }
    
    // Main Handler for our Custom Exceptions
    @ExceptionHandler(ApplicationException.class)
    public ResponseEntity<ApiResponse<?>> handleApplicationException(ApplicationException ex) {
        // Log the full stack trace for developers
        log.error("Application exception: [Code: {}] {}", ex.getCode(), ex.getMessage(), ex);

        String code = ex.getCode();
        HttpStatus status = HttpStatus.BAD_REQUEST; // Default to 400 for business errors

        // Map codes to Status
        if ("SYSTEM_ERROR".equals(code)) {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
        } else if ("AUTH_ERROR".equals(code) || "ACCESS_DENIED".equals(code)) {
            status = HttpStatus.FORBIDDEN;
        } else if ("VALIDATION_ERROR".equals(code)) {
            status = HttpStatus.BAD_REQUEST;
        } else if ("RESOURCE_NOT_FOUND".equals(code)) {
            status = HttpStatus.NOT_FOUND;
        }

        return ResponseEntity
                .status(status)
                .body(ApiResponse.error(
                        ex.getUserMessage(),
                        getDeveloperMessage(ex)
                ));
    }

    // Validation Exceptions (Spring)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        log.warn("Validation error: {}", ex.getMessage());

        List<String> errors = new ArrayList<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.add(fieldName + ": " + errorMessage);
        });

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(
                        "Please check the entered information",
                        isProduction() ? null : "Validation failed for " + ex.getBindingResult().getObjectName(),
                        errors
                ));
    }

    // Authentication Exceptions
    @ExceptionHandler({ BadCredentialsException.class, AuthenticationException.class })
    public ResponseEntity<ApiResponse<?>> handleAuthenticationException(Exception ex) {
        log.warn("Authentication failed: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error(
                        "Session expired or invalid credentials. Please login again.",
                        getDeveloperMessage(ex)
                ));
    }

    // Legacy Exceptions - Map them to new structure
    @ExceptionHandler(com.krishihub.shared.exception.ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<?>> handleLegacyResourceNotFound(
            com.krishihub.shared.exception.ResourceNotFoundException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(
                        "Requested information not found",
                        getDeveloperMessage(ex)
                ));
    }
    
    @ExceptionHandler(com.krishihub.shared.exception.BadRequestException.class)
    public ResponseEntity<ApiResponse<?>> handleLegacyBadRequest(
            com.krishihub.shared.exception.BadRequestException ex) {
        return ResponseEntity
                .badRequest()
                .body(ApiResponse.error(
                        ex.getMessage(), // Legacy often put user message in message
                        getDeveloperMessage(ex)
                ));
    }
    
    @ExceptionHandler(ActiveSessionExistsException.class)
    public ResponseEntity<ApiResponse<?>> handleActiveSessionExists(ActiveSessionExistsException ex) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ApiResponse.error(
                        ex.getUserMessage(),
                        getDeveloperMessage(ex)
                ));
    }

    // Access Denied Exception
    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<ApiResponse<?>> handleAccessDenied(org.springframework.security.access.AccessDeniedException ex) {
        log.warn("Access Denied: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(
                        "You do not have permission to perform this action.",
                        getDeveloperMessage(ex)
                ));
    }

    // Catch-all for unexpected errors
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleUnknown(Exception ex) {
        log.error("Unhandled exception", ex);

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(
                        "Something went wrong. Please try again later.",
                        getDeveloperMessage(ex)
                ));
    }
}


