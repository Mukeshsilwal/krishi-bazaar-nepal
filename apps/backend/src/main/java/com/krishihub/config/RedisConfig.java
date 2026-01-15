package com.krishihub.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

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

        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        mapper.activateDefaultTyping(
                com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator.instance,
                ObjectMapper.DefaultTyping.NON_FINAL,
                com.fasterxml.jackson.annotation.JsonTypeInfo.As.PROPERTY);

        // Register Mixin for PageImpl and PageRequest
        mapper.addMixIn(org.springframework.data.domain.PageImpl.class, PageMixin.class);
        mapper.addMixIn(org.springframework.data.domain.PageRequest.class, PageRequestMixin.class);
        
        // Register Custom Deserializer for Sort via Module
        com.fasterxml.jackson.databind.module.SimpleModule sortModule = new com.fasterxml.jackson.databind.module.SimpleModule();
        sortModule.addDeserializer(org.springframework.data.domain.Sort.class, new SortDeserializer());
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

    // Custom Sort Deserializer to handle "orders must not be null" issue
    static class SortDeserializer extends com.fasterxml.jackson.databind.JsonDeserializer<org.springframework.data.domain.Sort> {
        @Override
        public org.springframework.data.domain.Sort deserialize(com.fasterxml.jackson.core.JsonParser p, com.fasterxml.jackson.databind.DeserializationContext ctxt) throws java.io.IOException {
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
