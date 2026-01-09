package com.krishihub.advisory.service;

import com.krishihub.advisory.dto.*;
import com.krishihub.advisory.entity.AdvisoryDeliveryLog;
import com.krishihub.advisory.enums.*;
import com.krishihub.advisory.repository.AdvisoryDeliveryLogRepository;
import com.krishihub.shared.dto.CursorPageResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Centralized service for advisory delivery logging
 * Implements the authoritative system of record for advisory lifecycle tracking
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AdvisoryDeliveryLogService {

    private final AdvisoryDeliveryLogRepository repository;

    /**
     * Log advisory creation (decision trace) - simplified version
     */
    @Transactional
    public AdvisoryDeliveryLog logAdvisoryCreated(
            UUID farmerId,
            String farmerName,
            String farmerPhone,
            UUID ruleId,
            String ruleName,
            AdvisoryType advisoryType,
            Severity severity,
            String advisoryContent,
            String district,
            String cropType,
            String growthStage,
            String weatherSignal) {

        String deduplicationKey = generateDeduplicationKey(farmerId, advisoryType, weatherSignal);

        // Check for duplicates
        // if (repository.existsByDeduplicationKey(deduplicationKey)) {
        //     log.debug("Duplicate advisory detected for farmer {}, logging as DEDUPED", farmerId);
        //     return logDedupedAdvisory(farmerId, farmerName, farmerPhone, ruleId, ruleName, advisoryType, severity, deduplicationKey);
        // }

        AdvisoryDeliveryLog advisoryLog = AdvisoryDeliveryLog.builder()
                .farmerId(farmerId)
                .farmerName(farmerName)
                .farmerPhone(farmerPhone)
                .ruleId(ruleId)
                .ruleName(ruleName)
                .advisoryType(advisoryType)
                .severity(severity)
                .deliveryStatus(DeliveryStatus.CREATED)
                .priority(severity.getPriority())
                .deduplicationKey(deduplicationKey)
                .advisoryContent(advisoryContent)
                .channel(DeliveryChannel.IN_APP) // Default channel
                .district(district)
                .cropType(cropType)
                .growthStage(growthStage)
                .weatherSignal(weatherSignal)
                .build();

        AdvisoryDeliveryLog saved = repository.save(advisoryLog);
        log.info("Advisory created: id={}, farmer={}, type={}, severity={}",
                saved.getId(), farmerId, advisoryType, severity);

        return saved;
    }

    /**
     * Log deduplicated advisory
     */
    private AdvisoryDeliveryLog logDedupedAdvisory(
            UUID farmerId,
            String farmerName,
            String farmerPhone,
            UUID ruleId,
            String ruleName,
            AdvisoryType advisoryType,
            Severity severity,
            String deduplicationKey) {

        AdvisoryDeliveryLog log = AdvisoryDeliveryLog.builder()
                .farmerId(farmerId)
                .farmerName(farmerName)
                .farmerPhone(farmerPhone)
                .ruleId(ruleId)
                .ruleName(ruleName)
                .advisoryType(advisoryType)
                .severity(severity)
                .deliveryStatus(DeliveryStatus.DEDUPED)
                .deduplicationKey(deduplicationKey + "_deduped_" + System.currentTimeMillis())
                .failureReason("Duplicate advisory within time window")
                .build();

        return repository.save(log);
    }

    /**
     * Update advisory to dispatched status
     */
    @Transactional
    public void logAdvisoryDispatched(UUID logId, DeliveryChannel channel) {
        repository.findById(logId).ifPresent(log -> {
            if (log.getDeliveryStatus().canTransitionTo(DeliveryStatus.DISPATCHED)) {
                log.setDeliveryStatus(DeliveryStatus.DISPATCHED);
                log.setChannel(channel);
                repository.save(log);
                log(logId, "Advisory dispatched via " + channel);
            } else {
                AdvisoryDeliveryLogService.log.warn("Invalid status transition from {} to DISPATCHED for log {}",
                        log.getDeliveryStatus(), logId);
            }
        });
    }

    /**
     * Log delivery attempt result
     */
    @Transactional
    public void logDeliveryAttempt(UUID logId, boolean success, String failureReason) {
        repository.findById(logId).ifPresent(log -> {
            DeliveryStatus newStatus = success ? DeliveryStatus.DELIVERED : DeliveryStatus.DELIVERY_FAILED;

            if (log.getDeliveryStatus().canTransitionTo(newStatus)) {
                log.setDeliveryStatus(newStatus);
                if (success) {
                    log.setDeliveredAt(LocalDateTime.now());
                } else {
                    log.setFailureReason(failureReason);
                }
                repository.save(log);
                log(logId, success ? "Delivery successful" : "Delivery failed: " + failureReason);
            }
        });
    }

    /**
     * Log advisory opened by farmer
     */
    @Transactional
    public void logAdvisoryOpened(UUID logId) {
        repository.findById(logId).ifPresent(log -> {
            if (log.getOpenedAt() == null && log.getDeliveryStatus().canTransitionTo(DeliveryStatus.OPENED)) {
                log.setDeliveryStatus(DeliveryStatus.OPENED);
                log.setOpenedAt(LocalDateTime.now());
                repository.save(log);
                log(logId, "Advisory opened by farmer");
            }
        });
    }

    /**
     * Log farmer feedback
     */
    @Transactional
    public void logFeedbackReceived(UUID logId, String feedback, String comment) {
        repository.findById(logId).ifPresent(log -> {
            if (log.getDeliveryStatus().canTransitionTo(DeliveryStatus.FEEDBACK_RECEIVED)) {
                log.setDeliveryStatus(DeliveryStatus.FEEDBACK_RECEIVED);
                log.setFeedback(feedback);
                log.setFeedbackComment(comment);
                log.setFeedbackAt(LocalDateTime.now());
                repository.save(log);
                log(logId, "Feedback received: " + feedback);
            }
        });
    }

    /**
     * Generate deterministic deduplication key
     */
    public String generateDeduplicationKey(UUID farmerId, AdvisoryType advisoryType, String signal) {
        // Time window: hourly
        long hourWindow = System.currentTimeMillis() / (1000 * 60 * 60);
        return String.format("%s:%s:%s:%d", farmerId, advisoryType, signal, hourWindow);
    }

    /**
     * Check if advisory would be duplicate
     */
    public boolean checkDuplication(UUID farmerId, AdvisoryType advisoryType, String signal) {
        String key = generateDeduplicationKey(farmerId, advisoryType, signal);
        return repository.existsByDeduplicationKey(key);
    }

    /**
     * Get advisory logs with filters and cursor pagination
     */
    public CursorPageResponse<AdvisoryLogResponseDTO> getAdvisoryLogs(AdvisoryLogFilterDTO filter) {
        int limit = filter.getLimit() != null ? filter.getLimit() : 20;
        UUID cursorId = filter.getCursor() != null ? decodeCursor(filter.getCursor()) : null;

        // Build query based on filters
        List<AdvisoryDeliveryLog> logs = repository.findAll(
                PageRequest.of(0, limit + 1, Sort.by(Sort.Direction.DESC, "createdAt"))).getContent();

        // TODO: Apply filters properly using Specification or custom query
        // For now, simple implementation

        boolean hasMore = logs.size() > limit;
        if (hasMore) {
            logs = logs.subList(0, limit);
        }

        List<AdvisoryLogResponseDTO> dtos = logs.stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());

        String nextCursor = hasMore && !logs.isEmpty() ? encodeCursor(logs.get(logs.size() - 1).getId()) : null;

        return CursorPageResponse.<AdvisoryLogResponseDTO>builder()
                .data(dtos)
                .nextCursor(nextCursor)
                .hasMore(hasMore)
                .limit(limit)
                .build();
    }

    /**
     * Get advisory log detail
     */
    public Optional<AdvisoryLogDetailDTO> getAdvisoryLogDetail(UUID logId) {
        return repository.findById(logId).map(this::toDetailDTO);
    }

    /**
     * Get farmer's advisory history
     */
    public List<AdvisoryLogResponseDTO> getFarmerAdvisoryHistory(UUID farmerId) {
        return repository.findByFarmerIdOrderByCreatedAtDesc(farmerId).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Convert entity to response DTO
     */
    private AdvisoryLogResponseDTO toResponseDTO(AdvisoryDeliveryLog log) {
        return AdvisoryLogResponseDTO.builder()
                .id(log.getId())
                .farmerId(log.getFarmerId())
                .farmerName(log.getFarmerName())
                .ruleId(log.getRuleId())
                .ruleName(log.getRuleName())
                .advisoryType(log.getAdvisoryType())
                .severity(log.getSeverity())
                .district(log.getDistrict())
                .cropType(log.getCropType())
                .deliveryStatus(log.getDeliveryStatus())
                .channel(log.getChannel())
                .createdAt(log.getCreatedAt())
                .deliveredAt(log.getDeliveredAt())
                .openedAt(log.getOpenedAt())
                .feedback(log.getFeedback())
                .build();
    }

    /**
     * Convert entity to detail DTO
     */
    private AdvisoryLogDetailDTO toDetailDTO(AdvisoryDeliveryLog log) {
        return AdvisoryLogDetailDTO.builder()
                .id(log.getId())
                .farmerId(log.getFarmerId())
                .farmerName(log.getFarmerName())
                .farmerPhone(log.getFarmerPhone())
                .advisoryId(log.getAdvisoryId())
                .ruleId(log.getRuleId())
                .ruleName(log.getRuleName())
                .advisoryType(log.getAdvisoryType())
                .severity(log.getSeverity())
                .advisoryContent(log.getAdvisoryContent())
                .weatherSignal(log.getWeatherSignal())
                .diseaseCode(log.getDiseaseCode())
                .pestCode(log.getPestCode())
                .district(log.getDistrict())
                .cropType(log.getCropType())
                .growthStage(log.getGrowthStage())
                .season(log.getSeason())
                .riskLevel(log.getRiskLevel())
                .temperature(log.getTemperature())
                .rainfall(log.getRainfall())
                .humidity(log.getHumidity())
                .deliveryStatus(log.getDeliveryStatus())
                .channel(log.getChannel())
                .priority(log.getPriority())
                .failureReason(log.getFailureReason())
                .createdAt(log.getCreatedAt())
                .deliveredAt(log.getDeliveredAt())
                .openedAt(log.getOpenedAt())
                .feedbackAt(log.getFeedbackAt())
                .feedback(log.getFeedback())
                .feedbackComment(log.getFeedbackComment())
                .build();
    }

    /**
     * Encode cursor (UUID to Base64)
     */
    private String encodeCursor(UUID id) {
        return Base64.getEncoder().encodeToString(id.toString().getBytes());
    }

    /**
     * Decode cursor (Base64 to UUID)
     */
    private UUID decodeCursor(String cursor) {
        try {
            String decoded = new String(Base64.getDecoder().decode(cursor));
            return UUID.fromString(decoded);
        } catch (Exception e) {
            log.warn("Invalid cursor: {}", cursor);
            return null;
        }
    }

    /**
     * Structured logging helper
     */
    private void log(UUID logId, String message) {
        log.info("AdvisoryLog[{}]: {}", logId, message);
    }
}
