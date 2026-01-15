package com.krishihub.config;

import com.krishihub.config.properties.*;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties({
    JwtProperties.class,
    OtpProperties.class,
    CloudinaryProperties.class,
    SmsProperties.class,
    PaymentProperties.class,
    CorsProperties.class,
    OpenAiProperties.class,
    EmailProperties.class,
    WeatherProperties.class,
    MarketProperties.class,
    ApplicationProperties.class
})
public class AppConfig {
}
