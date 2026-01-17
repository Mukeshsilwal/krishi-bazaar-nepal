package com.krishihub.config;

import com.twilio.Twilio;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Slf4j
@Getter
public class TwilioConfig {
    
    @Value("${twilio.account-sid:AC00000000000000000000000000000000}")
    private String accountSid;
    
    @Value("${twilio.auth-token:token}")
    private String authToken;
    
    @Value("${twilio.whatsapp-number:+14155238886}")
    private String whatsappNumber;
    
    @PostConstruct
    public void initialize() {
        try {
            Twilio.init(accountSid, authToken);
            log.info("Twilio initialized successfully");
        } catch (Exception e) {
            log.error("Failed to initialize Twilio: {}", e.getMessage());
        }
    }
}
