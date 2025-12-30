package com.krishihub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class KrishiHubApplication {

    public static void main(String[] args) {
        SpringApplication.run(KrishiHubApplication.class, args);
    }
}
