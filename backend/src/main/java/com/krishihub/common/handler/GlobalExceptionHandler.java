package com.krishihub.common.handler;

import com.krishihub.common.error.ApiErrorResponse;
import com.krishihub.common.error.ErrorCode;
import com.krishihub.common.exception.BusinessException;
import com.krishihub.shared.dto.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.authentication.BadCredentialsException;

import java.time.Instant;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<ApiErrorResponse>> handleBusinessException(BusinessException ex) {

        log.error("Business exception: {}", ex.getMessage(), ex);

        HttpStatus status = HttpStatus.BAD_REQUEST;
        if (ex.getErrorCode() == ErrorCode.RESOURCE_NOT_FOUND) {
            status = HttpStatus.NOT_FOUND;
        } else if (ex.getErrorCode() == ErrorCode.ACCESS_DENIED) {
            status = HttpStatus.FORBIDDEN;
        } else if (ex.getErrorCode() == ErrorCode.SERVICE_UNAVAILABLE) {
            status = HttpStatus.SERVICE_UNAVAILABLE;
        }

        ApiErrorResponse errorResponse = new ApiErrorResponse(
                ex.getErrorCode().name(),
                ex.getMessage(),
                ex.getUserMessage(),
                Instant.now());

        return ResponseEntity.status(status).body(ApiResponse.error(ex.getUserMessage(), errorResponse));
    }

    // Legacy Exception Support & Validation
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<ApiErrorResponse>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        log.warn("Validation error: {}", ex.getMessage());

        // Construct a detailed internal message
        StringBuilder detailedMessage = new StringBuilder("Validation failed: ");
        ex.getBindingResult().getAllErrors().forEach(error -> {
            detailedMessage.append(((FieldError) error).getField())
                    .append(" ")
                    .append(error.getDefaultMessage())
                    .append("; ");
        });

        ApiErrorResponse errorResponse = new ApiErrorResponse(
                ErrorCode.INVALID_REQUEST.name(),
                detailedMessage.toString(),
                "कृपया प्रदान गरिएको जानकारी जाँच गर्नुहोस्।", // "Please check the provided information."
                Instant.now());

        return ResponseEntity.badRequest().body(ApiResponse.error("Validation failed", errorResponse));
    }

    @ExceptionHandler({ BadCredentialsException.class, AuthenticationException.class })
    public ResponseEntity<ApiResponse<ApiErrorResponse>> handleAuthenticationException(Exception ex) {
        log.warn("Authentication failed: {}", ex.getMessage());
        
        ApiErrorResponse errorResponse = new ApiErrorResponse(
                ErrorCode.ACCESS_DENIED.name(),
                ex.getMessage(),
                "लगइन असफल भयो। कृपया आफ्नो विवरण जाँच गर्नुहोस्।", // "Login failed. Please check your details."
                Instant.now());

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Authentication failed", errorResponse));
    }

    @ExceptionHandler(com.krishihub.shared.exception.ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<ApiErrorResponse>> handleLegacyResourceNotFound(
            com.krishihub.shared.exception.ResourceNotFoundException ex) {
        log.warn("Resource not found: {}", ex.getMessage());
        
        ApiErrorResponse errorResponse = new ApiErrorResponse(
                ErrorCode.RESOURCE_NOT_FOUND.name(),
                ex.getMessage(),
                "माग गरिएको जानकारी भेटिएन।", // "Requested info not found."
                Instant.now());

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Resource not found", errorResponse));
    }

    @ExceptionHandler(com.krishihub.shared.exception.BadRequestException.class)
    public ResponseEntity<ApiResponse<ApiErrorResponse>> handleLegacyBadRequest(
            com.krishihub.shared.exception.BadRequestException ex) {
        log.warn("Bad request: {}", ex.getMessage());
        
        ApiErrorResponse errorResponse = new ApiErrorResponse(
                ErrorCode.INVALID_REQUEST.name(),
                ex.getMessage(),
                "अनुरोध प्रक्रिया गर्न सकिएन।", // "Could not process request."
                Instant.now());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error("Bad request", errorResponse));
    }

    @ExceptionHandler(com.krishihub.shared.exception.UnauthorizedException.class)
    public ResponseEntity<ApiResponse<ApiErrorResponse>> handleLegacyUnauthorized(
            com.krishihub.shared.exception.UnauthorizedException ex) {
        log.warn("Unauthorized: {}", ex.getMessage());
        
        ApiErrorResponse errorResponse = new ApiErrorResponse(
                ErrorCode.ACCESS_DENIED.name(),
                ex.getMessage(),
                "तपाइँलाई यो कार्य गर्न अनुमति छैन।", // "You are not authorized."
                Instant.now());

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Unauthorized", errorResponse));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<ApiErrorResponse>> handleGenericException(Exception ex) {

        log.error("Unhandled exception", ex);

        ApiErrorResponse errorResponse = new ApiErrorResponse(
                ErrorCode.INTERNAL_ERROR.name(),
                "Unexpected error occurred",
                "केही समस्या आयो। कृपया केही समयपछि पुन: प्रयास गर्नुहोस्।",
                Instant.now());

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("Internal server error", errorResponse));
    }
}
