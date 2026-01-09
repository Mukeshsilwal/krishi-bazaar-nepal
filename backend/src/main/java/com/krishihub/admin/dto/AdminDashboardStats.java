package com.krishihub.admin.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminDashboardStats {
    // User Metrics
    private long totalUsers;
    private long totalFarmers;
    private long pendingVerifications;

    // Content Metrics
    private long totalArticles;
    private long publishedArticles;
    private long pendingReviews;

    // Advisory Metrics
    private long activeAdvisories;
    private long highRiskAlerts;
    private long advisoriesDeliveredToday;

    // System Metrics
    private long totalOrders;
    private long aiDiagnosisCount;

    private java.util.List<RecentActivityDto> recentActivity;
    private java.util.List<TopContentDto> topContent;

    @Data
    @Builder
    public static class RecentActivityDto {
        private String type;
        private String titleEn;
        private String titleNe;
        private String time;
        private String timeEn;
        private String status;
    }

    @Data
    @Builder
    public static class TopContentDto {
        private String titleEn;
        private String titleNe;
        private long views;
    }
}
