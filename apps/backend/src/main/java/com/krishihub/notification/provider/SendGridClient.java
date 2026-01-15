package com.krishihub.notification.provider;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import lombok.extern.slf4j.Slf4j;
// import org.springframework.beans.factory.annotation.Value; removed
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Slf4j
public class SendGridClient {

    private final com.krishihub.config.properties.EmailProperties emailProperties;

    public SendGridClient(com.krishihub.config.properties.EmailProperties emailProperties) {
        this.emailProperties = emailProperties;
    }

    public void sendEmail(String to, String subject, String body) {
        Email from = new Email(emailProperties.getFromEmail());
        Email toEmail = new Email(to);
        Content content = new Content("text/plain", body);
        Mail mail = new Mail(from, subject, toEmail, content);

        SendGrid sg = new SendGrid(emailProperties.getSendgrid().getApiKey());
        Request request = new Request();
        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            log.info("SendGridClient: About to call SendGrid API via HTTP...");
            Response response = sg.api(request);
            log.info("Email sent to {}. Status Code: {}", to, response.getStatusCode());
            log.info("SendGrid Response Body: {}", response.getBody());

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
