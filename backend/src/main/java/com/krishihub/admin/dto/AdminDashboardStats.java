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
}
