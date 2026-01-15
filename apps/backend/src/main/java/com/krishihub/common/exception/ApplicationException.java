package com.krishihub.common.exception;

public abstract class ApplicationException extends RuntimeException {
    private final String code;
    private final String userMessage;

    protected ApplicationException(String code, String userMessage, String developerMessage) {
        super(developerMessage);
        this.code = code;
        this.userMessage = userMessage;
    }

    public String getCode() {
        return code;
    }

    public String getUserMessage() {
        return userMessage;
    }
}
