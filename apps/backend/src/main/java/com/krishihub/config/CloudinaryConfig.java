package com.krishihub.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
// import org.springframework.beans.factory.annotation.Value; removed
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {

    private final com.krishihub.config.properties.CloudinaryProperties cloudinaryProperties;

    public CloudinaryConfig(com.krishihub.config.properties.CloudinaryProperties cloudinaryProperties) {
        this.cloudinaryProperties = cloudinaryProperties;
    }

    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudinaryProperties.getCloudName(),
                "api_key", cloudinaryProperties.getApiKey(),
                "api_secret", cloudinaryProperties.getApiSecret(),
                "secure", true));
    }
}
