package com.krishihub.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {

    @Value("${app.cloudinary.cloud-name:dsqubrfjp}")
    private String cloudName;

    @Value("${app.cloudinary.api-key:624365773875321}")
    private String apiKey;

    @Value("${app.cloudinary.api-secret:9P5wS1lelWdo6CubuJxzQiNTClw}")
    private String apiSecret;

    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true));
    }
}
