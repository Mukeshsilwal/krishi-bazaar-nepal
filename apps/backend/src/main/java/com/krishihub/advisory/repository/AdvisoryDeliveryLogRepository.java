package com.krishihub.advisory.repository;

import com.krishihub.advisory.entity.AdvisoryDeliveryLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


import java.util.List;
import java.util.UUID;

/**
 * Repository for advisory delivery logs
 */
@Repository
public interface AdvisoryDeliveryLogRepository extends JpaRepository<AdvisoryDeliveryLog, UUID> {

        /**
         * Find logs by farmer ID
         */
        List<AdvisoryDeliveryLog> findByFarmerIdOrderByCreatedAtDesc(UUID farmerId);

        /**
         * Find logs by district
         */
        List<AdvisoryDeliveryLog> findByDistrictOrderByCreatedAtDesc(String district);

        /**
         * Find logs by weather signal
         */
        List<AdvisoryDeliveryLog> findByWeatherSignalOrderByCreatedAtDesc(String weatherSignal);

        /**
         * Find logs within date range
         */
        List<AdvisoryDeliveryLog> findByCreatedAtBetween(java.util.Date start, java.util.Date end);

        /**
         * Count deliveries by status
         */
        @Query("SELECT COUNT(l) FROM AdvisoryDeliveryLog l WHERE l.deliveryStatus = :status")
        long countByDeliveryStatus(@Param("status") String status);

        /**
         * Get delivery success rate
         */
        @Query("SELECT CAST(COUNT(CASE WHEN l.deliveryStatus IN ('DELIVERED', 'OPENED', 'FEEDBACK_RECEIVED') THEN 1 END) AS double) / NULLIF(COUNT(l), 0) * 100 "
                        +
                        "FROM AdvisoryDeliveryLog l WHERE l.createdAt >= :since")
        Double getDeliverySuccessRate(@Param("since") java.util.Date since);

        /**
         * Get feedback statistics
         */
        @Query("SELECT l.feedback, COUNT(l) FROM AdvisoryDeliveryLog l " +
                        "WHERE l.feedback IS NOT NULL GROUP BY l.feedback")
        List<Object[]> getFeedbackStatistics();

        /**
         * Get most triggered rules
         */
        @Query("SELECT l.ruleName, COUNT(l) as count FROM AdvisoryDeliveryLog l " +
                        "WHERE l.createdAt >= :since GROUP BY l.ruleName ORDER BY count DESC")
        List<Object[]> getMostTriggeredRules(@Param("since") java.util.Date since);

        /**
         * Check if deduplication key exists
         */
        boolean existsByDeduplicationKey(String deduplicationKey);

        /**
         * Get channel-wise statistics
         */
        @Query("SELECT l.channel, COUNT(l), " +
                        "SUM(CASE WHEN l.deliveryStatus IN ('DELIVERED', 'OPENED', 'FEEDBACK_RECEIVED') THEN 1 ELSE 0 END), "
                        +
                        "SUM(CASE WHEN l.deliveryStatus = 'OPENED' OR l.deliveryStatus = 'FEEDBACK_RECEIVED' THEN 1 ELSE 0 END) "
                        +
                        "FROM AdvisoryDeliveryLog l WHERE l.createdAt >= :since AND l.channel IS NOT NULL " +
                        "GROUP BY l.channel")
        List<Object[]> getChannelStatistics(@Param("since") java.util.Date since);

        /**
         * Get rule effectiveness metrics
         */
        @Query("SELECT l.ruleName, COUNT(l), " +
                        "SUM(CASE WHEN l.deliveryStatus = 'OPENED' OR l.deliveryStatus = 'FEEDBACK_RECEIVED' THEN 1 ELSE 0 END), "
                        +
                        "SUM(CASE WHEN l.feedback = 'USEFUL' THEN 1 ELSE 0 END), " +
                        "SUM(CASE WHEN l.feedback = 'NOT_USEFUL' THEN 1 ELSE 0 END) " +
                        "FROM AdvisoryDeliveryLog l WHERE l.createdAt >= :since AND l.ruleName IS NOT NULL " +
                        "GROUP BY l.ruleName ORDER BY COUNT(l) DESC")
        List<Object[]> getRuleEffectivenessMetrics(@Param("since") java.util.Date since);

        /**
         * Get district-wise statistics
         */
        @Query("SELECT l.district, COUNT(l), " +
                        "SUM(CASE WHEN l.severity = 'EMERGENCY' THEN 1 ELSE 0 END), " +
                        "SUM(CASE WHEN l.deliveryStatus = 'DELIVERY_FAILED' THEN 1 ELSE 0 END) " +
                        "FROM AdvisoryDeliveryLog l WHERE l.createdAt >= :since AND l.district IS NOT NULL " +
                        "GROUP BY l.district")
        List<Object[]> getDistrictStatistics(@Param("since") java.util.Date since);

        /**
         * Find farmers with excessive advisories (alert fatigue)
         */
        @Query("SELECT l.farmerId, COUNT(l) FROM AdvisoryDeliveryLog l " +
                        "WHERE l.createdAt >= :since GROUP BY l.farmerId HAVING COUNT(l) > :threshold")
        List<Object[]> findFarmersWithExcessiveAdvisories(@Param("since") java.util.Date since,
                        @Param("threshold") long threshold);

        /**
         * Find ignored emergency alerts
         */
        @Query("SELECT l.id FROM AdvisoryDeliveryLog l " +
                        "WHERE l.severity = 'EMERGENCY' AND l.createdAt >= :since " +
                        "AND l.deliveryStatus NOT IN ('OPENED', 'FEEDBACK_RECEIVED')")
        List<UUID> findIgnoredEmergencyAlerts(@Param("since") java.util.Date since);

        /**
         * Get rules with poor feedback ratio
         */
        @Query("SELECT l.ruleName, " +
                        "CAST(SUM(CASE WHEN l.feedback = 'NOT_USEFUL' THEN 1 ELSE 0 END) AS double) / " +
                        "NULLIF(SUM(CASE WHEN l.feedback IS NOT NULL THEN 1 ELSE 0 END), 0) * 100 as ratio " +
                        "FROM AdvisoryDeliveryLog l " +
                        "WHERE l.createdAt >= :since AND l.ruleName IS NOT NULL " +
                        "GROUP BY l.ruleName " +
                        "HAVING SUM(CASE WHEN l.feedback IS NOT NULL THEN 1 ELSE 0 END) >= :minFeedbackCount")
        List<Object[]> getRulesWithPoorFeedback(@Param("since") java.util.Date since,
                        @Param("minFeedbackCount") long minFeedbackCount);

        /**
         * Count total advisories since date
         */
        @Query("SELECT COUNT(l) FROM AdvisoryDeliveryLog l WHERE l.createdAt >= :since")
        long countSince(@Param("since") java.util.Date since);

        /**
         * Count high-risk alerts (EMERGENCY or WARNING severity) since date
         */
        @Query("SELECT COUNT(l) FROM AdvisoryDeliveryLog l WHERE l.createdAt >= :since AND l.severity IN ('EMERGENCY', 'WARNING')")
        long countHighRiskSince(@Param("since") java.util.Date since);

        /**
         * Get open rate (opened/delivered)
         */
        @Query("SELECT CAST(SUM(CASE WHEN l.deliveryStatus IN ('OPENED', 'FEEDBACK_RECEIVED') THEN 1 ELSE 0 END) AS double) / "
                        +
                        "NULLIF(SUM(CASE WHEN l.deliveryStatus IN ('DELIVERED', 'OPENED', 'FEEDBACK_RECEIVED') THEN 1 ELSE 0 END), 0) * 100 "
                        +
                        "FROM AdvisoryDeliveryLog l WHERE l.createdAt >= :since")
        Double getOpenRate(@Param("since") java.util.Date since);

        /**
         * Get feedback rate (feedback/opened)
         */
        @Query("SELECT CAST(SUM(CASE WHEN l.feedback IS NOT NULL THEN 1 ELSE 0 END) AS double) / " +
                        "NULLIF(SUM(CASE WHEN l.deliveryStatus IN ('OPENED', 'FEEDBACK_RECEIVED') THEN 1 ELSE 0 END), 0) * 100 "
                        +
                        "FROM AdvisoryDeliveryLog l WHERE l.createdAt >= :since")
        Double getFeedbackRate(@Param("since") java.util.Date since);
}
