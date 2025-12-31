package com.krishihub.admin.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminDashboardStats {
    private long totalUsers;
    private long totalOrders;
    private long totalArticles;
    private long publishedArticles;
}
