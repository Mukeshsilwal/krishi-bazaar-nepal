package com.krishihub.support.controller;

import com.krishihub.notification.dto.MessageRequest;
import com.krishihub.notification.enums.MessageType;
import com.krishihub.notification.service.NotificationOrchestrator;
import com.krishihub.shared.dto.ApiResponse;
import com.krishihub.support.dto.PublicContactRequest;
import com.krishihub.support.entity.ContactMessage;
import com.krishihub.support.repository.ContactMessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.krishihub.admin.service.SystemSettingService;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
@Slf4j
public class PublicContactController {

    private final ContactMessageRepository contactMessageRepository;
    private final NotificationOrchestrator notificationOrchestrator;
    private final SystemSettingService systemSettingService;

    @Value("${app.email.support:support@krishibazaar.com.np}")
    private String defaultSupportEmail;

    @PostMapping("/contact")
    public ResponseEntity<ApiResponse<String>> submitContactForm(@RequestBody PublicContactRequest request) {
        log.info("Received contact form submission from: {}", request.getEmail());

        // 1. Save to Database
        ContactMessage contactMessage = ContactMessage.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .subject(request.getSubject())
                .message(request.getMessage())
                .build();
        
        contactMessageRepository.save(contactMessage);

        // 2. Send Notification Email to Admin/Support
        try {
            // Get configured company email or fallback to default
            String recipientEmail = systemSettingService.getSettingValue("COMPANY_EMAIL", defaultSupportEmail);

            String emailContent = String.format("""
                    New Contact Message Received:
                    
                    Name: %s %s
                    Email: %s
                    Subject: %s
                    
                    Message:
                    %s
                    """, 
                    request.getFirstName(), request.getLastName(),
                    request.getEmail(),
                    request.getSubject(),
                    request.getMessage()
            );

            log.info("Sending contact form email to: {}", recipientEmail);

            MessageRequest messageRequest = MessageRequest.builder()
                    .type(MessageType.EMAIL)
                    .recipient(recipientEmail)
                    .subject("New Contact Form Submission: " + request.getSubject())
                    .content(emailContent)
                    .build();

            notificationOrchestrator.send(messageRequest);
        } catch (Exception e) {
            log.error("Failed to send admin notification email for contact form", e);
            // Don't fail the request if email sending fails, as we saved it to DB
        }

        return ResponseEntity.ok(ApiResponse.success("Message sent successfully", "Thank you for contacting us. We will get back to you shortly."));
    }
}
