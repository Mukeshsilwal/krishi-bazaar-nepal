package com.krishihub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableAsync
@EnableScheduling
@SpringBootApplication
@EnableJpaAuditing(auditorAwareRef = "auditorAware")
@org.springframework.cache.annotation.EnableCaching
public class KrishiHubApplication {

    public static void main(String[] args) {
        SpringApplication.run(KrishiHubApplication.class, args);
    }
}
