package com.krishihub.common.exception;

public class BusinessException extends ApplicationException {
    
    // Keeping for backward compatibility if needed, but preferably use the constructor with userMessage
    public BusinessException(String userMessage) {
        super("BUSINESS_ERROR", userMessage, userMessage);
    }

    public BusinessException(String code, String userMessage) {
         super(code, userMessage, userMessage);
    }
}

