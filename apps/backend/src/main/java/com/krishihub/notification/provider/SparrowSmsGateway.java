package com.krishihub.notification.provider;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
@RequiredArgsConstructor
@Slf4j
public class SparrowSmsGateway implements SmsGateway {

    private final WebClient.Builder webClientBuilder;

    @Value("${app.sms.api-url:#{null}}")
    private String smsApiUrl;

    @Value("${app.sms.api-key:}")
    private String smsApiKey;

    @Value("${app.sms.sender-id:KRISHI}")
    private String senderId;

    @Override
    public void sendSms(String mobileNumber, String message) {
        if (smsApiUrl == null || smsApiUrl.isEmpty()) {
            log.info("=== SMS SIMULATION (No API URL configured) ===");
            log.info("To: {}", mobileNumber);
            log.info("Message: {}", message);
            log.info("============================================");
            return;
        }

        try {
            WebClient webClient = webClientBuilder.baseUrl(smsApiUrl).build();

            // Example for common Nepal SMS gateways (Sparrow/Aakash) usually GET or POST
            webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .queryParam("token", smsApiKey)
                            .queryParam("from", senderId)
                            .queryParam("to", mobileNumber)
                            .queryParam("text", message)
                            .build())
                    .retrieve()
                    .bodyToMono(String.class)
                    .subscribe(
                            response -> log.info("SMS API Response for {}: {}", mobileNumber, response),
                            error -> log.error("Failed to call SMS API for {}: {}", mobileNumber, error.getMessage()));

            log.info("SMS request initiated for {}", mobileNumber);
        } catch (Exception e) {
            log.error("Error sending SMS via Sparrow Gateway: {}", e.getMessage());
        }
    }
}
