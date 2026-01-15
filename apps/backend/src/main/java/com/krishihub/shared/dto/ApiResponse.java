package com.krishihub.shared.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private Integer code; // Changed from String to Integer
    private String message; // User message
    private String developerMessage;
    private T data;
    private List<String> errors;

    // Factory method for success
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(0, "Success", null, data, null);
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(0, message, null, data, null);
    }

    // Factory method for error
    public static <T> ApiResponse<T> error(String message, String developerMessage) {
        return new ApiResponse<>(-1, message, developerMessage, null, null);
    }
    
    public static <T> ApiResponse<T> error(String message, String developerMessage, List<String> errors) {
        return new ApiResponse<>(-1, message, developerMessage, null, errors);
    }
    
    // Legacy support - maps to general failure -1
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(-1, message, null, null, null);
    }

    public static <T> ApiResponse<T> error(String message, T data) {
        return new ApiResponse<>(-1, message, null, data, null);
    }
}

