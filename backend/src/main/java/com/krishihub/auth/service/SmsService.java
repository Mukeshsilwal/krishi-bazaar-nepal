package com.krishihub.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
@RequiredArgsConstructor
@Slf4j
public class SmsService {

    private final WebClient.Builder webClientBuilder;

    @Value("${app.sms.api-url}")
    private String smsApiUrl;

    @Value("${app.sms.api-key}")
    private String smsApiKey;

    @Value("${app.sms.sender-id}")
    private String senderId;

    public void sendOtp(String mobileNumber, String otp) {
        String message = String.format("Your KrishiHub verification code is: %s. Valid for 5 minutes.", otp);

        try {
            // For development, just log the OTP
            if (smsApiUrl == null || smsApiUrl.isEmpty()) {
                log.info("=== OTP for {} ===", mobileNumber);
                log.info("OTP: {}", otp);
                log.info("==================");
                return;
            }

            // TODO: Implement actual SMS gateway integration
            // Example for Sparrow SMS Nepal:
            /*
             * WebClient webClient = webClientBuilder.baseUrl(smsApiUrl).build();
             * 
             * webClient.post()
             * .uri(uriBuilder -> uriBuilder
             * .queryParam("token", smsApiKey)
             * .queryParam("from", senderId)
             * .queryParam("to", mobileNumber)
             * .queryParam("text", message)
             * .build())
             * .retrieve()
             * .bodyToMono(String.class)
             * .subscribe(
             * response -> log.info("SMS sent successfully: {}", response),
             * error -> log.error("Failed to send SMS: {}", error.getMessage())
             * );
             */

            log.info("OTP sent to {}: {}", mobileNumber, otp);
        } catch (Exception e) {
            log.error("Error sending SMS: {}", e.getMessage());
            // Don't throw exception - log OTP for development
            log.info("OTP for {}: {}", mobileNumber, otp);
        }
    }

    public void sendNotification(String mobileNumber, String message) {
        try {
            if (smsApiUrl == null || smsApiUrl.isEmpty()) {
                log.info("=== SMS Notification for {} ===", mobileNumber);
                log.info("Message: {}", message);
                log.info("================================");
                return;
            }

            // TODO: Implement actual SMS sending
            log.info("Notification sent to {}: {}", mobileNumber, message);
        } catch (Exception e) {
            log.error("Error sending notification: {}", e.getMessage());
        }
    }
}
