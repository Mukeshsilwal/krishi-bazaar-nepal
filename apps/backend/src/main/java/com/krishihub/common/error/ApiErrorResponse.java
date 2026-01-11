package com.krishihub.common.error;

import java.time.Instant;

public class ApiErrorResponse {

    private String code;
    private String message;
    private String userMessage;
    private Instant timestamp;

    public ApiErrorResponse() {
    }

    public ApiErrorResponse(String code, String message, String userMessage, Instant timestamp) {
        this.code = code;
        this.message = message;
        this.userMessage = userMessage;
        this.timestamp = timestamp;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getUserMessage() {
        return userMessage;
    }

    public void setUserMessage(String userMessage) {
        this.userMessage = userMessage;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
}
