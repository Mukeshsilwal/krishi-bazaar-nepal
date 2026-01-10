package com.krishihub.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;

@Configuration
@lombok.extern.slf4j.Slf4j
@org.springframework.cache.annotation.EnableCaching
public class RedisConfig implements org.springframework.cache.annotation.CachingConfigurer {

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        log.info("Initializing RedisCacheManager with DefaultTyping enabled");
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        mapper.activateDefaultTyping(
                com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator.instance,
                ObjectMapper.DefaultTyping.NON_FINAL,
                com.fasterxml.jackson.annotation.JsonTypeInfo.As.PROPERTY);

        // Register Mixin for PageImpl, PageRequest, and Sort
        mapper.addMixIn(org.springframework.data.domain.PageImpl.class, PageMixin.class);
        mapper.addMixIn(org.springframework.data.domain.PageRequest.class, PageRequestMixin.class);
        mapper.addMixIn(org.springframework.data.domain.Sort.class, SortMixin.class);

        GenericJackson2JsonRedisSerializer serializer = new GenericJackson2JsonRedisSerializer(mapper);

        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofHours(1))
                .disableCachingNullValues()
                .serializeKeysWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(serializer));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(config)
                .build();
    }

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
    @com.fasterxml.jackson.annotation.JsonTypeInfo(use = com.fasterxml.jackson.annotation.JsonTypeInfo.Id.CLASS, include = com.fasterxml.jackson.annotation.JsonTypeInfo.As.PROPERTY)
    abstract static class PageMixin {
        @com.fasterxml.jackson.annotation.JsonCreator
        public PageMixin(
                @com.fasterxml.jackson.annotation.JsonProperty("content") java.util.List<?> content,
                @com.fasterxml.jackson.annotation.JsonProperty("pageable") org.springframework.data.domain.Pageable pageable,
                @com.fasterxml.jackson.annotation.JsonProperty("totalElements") long totalElements) {
        }
    }

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
    @com.fasterxml.jackson.annotation.JsonTypeInfo(use = com.fasterxml.jackson.annotation.JsonTypeInfo.Id.CLASS, include = com.fasterxml.jackson.annotation.JsonTypeInfo.As.PROPERTY)
    abstract static class PageRequestMixin {
        @com.fasterxml.jackson.annotation.JsonCreator
        public PageRequestMixin(
                @com.fasterxml.jackson.annotation.JsonProperty("pageNumber") int page,
                @com.fasterxml.jackson.annotation.JsonProperty("pageSize") int size,
                @com.fasterxml.jackson.annotation.JsonProperty("sort") org.springframework.data.domain.Sort sort) {
        }
    }

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
    @com.fasterxml.jackson.annotation.JsonTypeInfo(use = com.fasterxml.jackson.annotation.JsonTypeInfo.Id.CLASS, include = com.fasterxml.jackson.annotation.JsonTypeInfo.As.PROPERTY)
    abstract static class SortMixin {
        @com.fasterxml.jackson.annotation.JsonCreator
        public static org.springframework.data.domain.Sort by(
                @com.fasterxml.jackson.annotation.JsonProperty("orders") java.util.List<org.springframework.data.domain.Sort.Order> orders) {
            return null;
        }
    }

    @Override
    public org.springframework.cache.interceptor.CacheErrorHandler errorHandler() {
        return new org.springframework.cache.interceptor.SimpleCacheErrorHandler() {
            @Override
            public void handleCacheGetError(RuntimeException exception, org.springframework.cache.Cache cache, Object key) {
                log.warn("Redis Cache Get Error for key {}: {}", key, exception.getMessage());
            }

            @Override
            public void handleCachePutError(RuntimeException exception, org.springframework.cache.Cache cache, Object key, Object value) {
                log.warn("Redis Cache Put Error for key {}: {}", key, exception.getMessage());
            }

            @Override
            public void handleCacheEvictError(RuntimeException exception, org.springframework.cache.Cache cache, Object key) {
                log.warn("Redis Cache Evict Error for key {}: {}", key, exception.getMessage());
            }

            @Override
            public void handleCacheClearError(RuntimeException exception, org.springframework.cache.Cache cache) {
                log.warn("Redis Cache Clear Error: {}", exception.getMessage());
            }
        };
    }
}
