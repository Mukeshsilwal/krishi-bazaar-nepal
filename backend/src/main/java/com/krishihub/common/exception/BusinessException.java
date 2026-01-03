package com.krishihub.common.exception;

import com.krishihub.common.error.ErrorCode;

public class BusinessException extends RuntimeException {

    private final ErrorCode errorCode;
    private final String userMessage;

    public BusinessException(ErrorCode errorCode, String message, String userMessage) {
        super(message);
        this.errorCode = errorCode;
        this.userMessage = userMessage;
    }

    public ErrorCode getErrorCode() {
        return errorCode;
    }

    public String getUserMessage() {
        return userMessage;
    }
}
