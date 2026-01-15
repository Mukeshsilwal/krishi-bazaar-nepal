package com.krishihub.common.exception;

public class SystemException extends ApplicationException {
    public SystemException(String developerMessage) {
        super("SYSTEM_ERROR",
              "Something went wrong. Please try again later.",
              developerMessage);
    }
}
