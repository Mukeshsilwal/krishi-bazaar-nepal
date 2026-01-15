package com.krishihub.config;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import com.fasterxml.jackson.databind.module.SimpleModule;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CachingConfigurer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;

@Configuration
@Slf4j
@EnableCaching
public class RedisConfig implements CachingConfigurer {

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        log.info("Initializing RedisCacheManager with DefaultTyping enabled");
        ObjectMapper mapper = new ObjectMapper();

        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        mapper.activateDefaultTyping(
                LaissezFaireSubTypeValidator.instance,
                ObjectMapper.DefaultTyping.NON_FINAL,
                JsonTypeInfo.As.PROPERTY);

        // Register Mixin for PageImpl and PageRequest
        mapper.addMixIn(PageImpl.class, PageMixin.class);
        mapper.addMixIn(PageRequest.class, PageRequestMixin.class);
        
        // Register Custom Deserializer for Sort via Module
        SimpleModule sortModule = new SimpleModule();
        sortModule.addDeserializer(Sort.class, new SortDeserializer());
        mapper.registerModule(sortModule);

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

    @JsonIgnoreProperties(ignoreUnknown = true)
    @JsonTypeInfo(use = JsonTypeInfo.Id.CLASS, include = JsonTypeInfo.As.PROPERTY)
    abstract static class PageMixin {
        @JsonCreator
        public PageMixin(
                @JsonProperty("content") java.util.List<?> content,
                @JsonProperty("pageable") Pageable pageable,
                @JsonProperty("totalElements") long totalElements) {
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    @JsonTypeInfo(use = JsonTypeInfo.Id.CLASS, include = JsonTypeInfo.As.PROPERTY)
    abstract static class PageRequestMixin {
        @JsonCreator
        public PageRequestMixin(
                @JsonProperty("pageNumber") int page,
                @JsonProperty("pageSize") int size,
                @JsonProperty("sort") Sort sort) {
        }
    }

    // Custom Sort Deserializer to handle "orders must not be null" issue
    static class SortDeserializer extends JsonDeserializer<Sort> {
        @Override
        public Sort deserialize(JsonParser p, DeserializationContext ctxt) throws java.io.IOException {
            com.fasterxml.jackson.databind.JsonNode node = p.getCodec().readTree(p);
            if (node.has("orders") && node.get("orders").isArray()) {
                java.util.List<org.springframework.data.domain.Sort.Order> orders = new java.util.ArrayList<>();
                for (com.fasterxml.jackson.databind.JsonNode orderNode : node.get("orders")) {
                     String property = orderNode.has("property") ? orderNode.get("property").asText() : null;
                     String directionStr = orderNode.has("direction") ? orderNode.get("direction").asText() : "ASC";
                     
                     if (property != null) {
                         org.springframework.data.domain.Sort.Direction direction = org.springframework.data.domain.Sort.Direction.fromString(directionStr);
                         orders.add(new org.springframework.data.domain.Sort.Order(direction, property));
                     }
                }
                if (!orders.isEmpty()) {
                    return org.springframework.data.domain.Sort.by(orders);
                }
            }
            return org.springframework.data.domain.Sort.unsorted();
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
