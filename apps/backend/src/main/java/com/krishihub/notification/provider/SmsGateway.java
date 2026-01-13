package com.krishihub.notification.provider;

public interface SmsGateway {
    void sendSms(String mobileNumber, String message);
}
