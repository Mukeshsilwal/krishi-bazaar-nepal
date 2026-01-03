package com.krishihub.notification.provider;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Slf4j
public class SendGridClient {

    @Value("${app.email.sendgrid.api-key}")
    private String sendGridApiKey;

    @Value("${app.email.from-email}")
    private String fromEmail;

    public void sendEmail(String to, String subject, String body) {
        Email from = new Email(fromEmail);
        Email toEmail = new Email(to);
        Content content = new Content("text/plain", body);
        Mail mail = new Mail(from, subject, toEmail, content);

        SendGrid sg = new SendGrid(sendGridApiKey);
        Request request = new Request();
        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            Response response = sg.api(request);
            log.info("Email sent to {}. Status Code: {}", to, response.getStatusCode());

            if (response.getStatusCode() >= 400) {
                log.error("SendGrid Error: Body: {}", response.getBody());
                throw new RuntimeException("Failed to send email via SendGrid. Status: " + response.getStatusCode());
            }
        } catch (IOException ex) {
            log.error("Failed to send email to {}", to, ex);
            throw new RuntimeException("Failed to send email", ex);
        }
    }
}
