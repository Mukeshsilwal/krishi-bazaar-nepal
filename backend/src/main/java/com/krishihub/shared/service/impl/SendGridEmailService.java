package com.krishihub.shared.service.impl;

import com.krishihub.shared.service.EmailService;
import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
@Slf4j
@RequiredArgsConstructor
public class SendGridEmailService implements EmailService {

    @Value("${app.email.sendgrid.api-key}")
    private String sendGridApiKey;

    @Value("${app.email.from-email}")
    private String fromEmail;

    @Override
    public void sendEmail(String to, String subject, String content) {
        Email from = new Email(fromEmail);
        Email toEmail = new Email(to);
        Content contentObj = new Content("text/plain", content);
        Mail mail = new Mail(from, subject, toEmail, contentObj);

        SendGrid sg = new SendGrid(sendGridApiKey);
        Request request = new Request();
        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            Response response = sg.api(request);
            log.info("Email sent to {}. Status Code: {}", to, response.getStatusCode());
        } catch (IOException ex) {
            log.error("Failed to send email to {}", to, ex);
            throw new RuntimeException("Failed to send email", ex);
        }
    }
}
