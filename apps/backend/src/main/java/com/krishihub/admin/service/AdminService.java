package com.krishihub.admin.service;

import com.krishihub.admin.dto.AdminDashboardStats;
import com.krishihub.advisory.repository.AdvisoryDeliveryLogRepository;
import com.krishihub.analytics.service.UserActivityService;
import com.krishihub.auth.entity.User;
import com.krishihub.auth.model.CustomUserDetails;
import com.krishihub.auth.repository.UserRepository;
import com.krishihub.diagnosis.repository.AIDiagnosisRepository;
import com.krishihub.analytics.entity.UserActivity;
import com.krishihub.knowledge.entity.Article;
import com.krishihub.knowledge.entity.ArticleStatus;
import com.krishihub.knowledge.repository.ArticleRepository;
import com.krishihub.order.repository.OrderRepository;
import com.krishihub.marketplace.repository.CropListingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;


import java.util.*;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final CropListingRepository listingRepository;
    private final ArticleRepository articleRepository;
    private final AdvisoryDeliveryLogRepository advisoryLogRepository;
    private final AIDiagnosisRepository aiDiagnosisRepository;
    private final UserActivityService userActivityService;

    public AdminDashboardStats getDashboardStats() {
        Date todayStart = com.krishihub.common.util.DateUtil.startOfDay(com.krishihub.common.util.DateUtil.nowUtc());
        Date todayEnd = com.krishihub.common.util.DateUtil.endOfDay(com.krishihub.common.util.DateUtil.nowUtc());
        Calendar cal = Calendar.getInstance();
        cal.setTime(todayStart);
        cal.add(Calendar.DAY_OF_YEAR, -7);
        Date sevenDaysAgo = cal.getTime();

        // Recent Activity
        List<UserActivity> activities = userActivityService.getAllActivities(
            org.springframework.data.domain.PageRequest.of(0, 5, org.springframework.data.domain.Sort.Direction.DESC, "timestamp")
        ).getContent();

        List<AdminDashboardStats.RecentActivityDto> recentActivityDtos = activities.stream().map(activity -> 
            AdminDashboardStats.RecentActivityDto.builder()
                .type("activity") // simplified for now
                .titleEn(activity.getAction() + ": " + activity.getDetails())
                .titleNe(activity.getAction() + ": " + activity.getDetails())
                .time(activity.getTimestamp().toString()) // formatted in frontend
                .timeEn(activity.getTimestamp().toString())
                .status("completed")
                .build()
        ).toList();

        // Top Content
        List<Article> topArticles = articleRepository.findTop5ByOrderByViewsDesc();
        
        List<AdminDashboardStats.TopContentDto> topContentDtos = topArticles.stream().map(article ->
            AdminDashboardStats.TopContentDto.builder()
                .titleEn(article.getTitleEn())
                .titleNe(article.getTitleNe())
                .views(article.getViews() != null ? article.getViews() : 0)
                .build()
        ).toList();

        return AdminDashboardStats.builder()
                // User Metrics
                .totalUsers(userRepository.count())
                .totalFarmers(userRepository.countByRole(User.UserRole.FARMER))
                .pendingVerifications(userRepository.findByVerifiedFalse().size())

                // Content Metrics
                .totalArticles(articleRepository.count())
                .publishedArticles(articleRepository.countByStatus(ArticleStatus.PUBLISHED))
                .pendingReviews(articleRepository.countByStatus(ArticleStatus.PENDING))

                // Advisory Metrics
                .activeAdvisories(advisoryLogRepository.countSince(sevenDaysAgo))
                .highRiskAlerts(advisoryLogRepository.countHighRiskSince(todayStart))
                .advisoriesDeliveredToday(advisoryLogRepository.countSince(todayStart))

                // System Metrics
                .totalOrders(orderRepository.count())
                .aiDiagnosisCount(aiDiagnosisRepository.count())
                
                // Lists
                .recentActivity(recentActivityDtos)
                .topContent(topContentDtos)
                .build();
    }

    public Page<UserActivity> getAllActivities(Pageable pageable) {
        return userActivityService.getAllActivities(pageable);
    }

    public Page<User> getPendingVendors(Pageable pageable) {
        return userRepository.findByVerifiedFalseAndRoleIn(List.of(User.UserRole.VENDOR, User.UserRole.EXPERT), pageable);
    }

    private final AuditService auditService;

    public void approveUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setVerified(true);
        userRepository.save(user);
        
        // Audit
        try {
            UUID adminId = getCurrentUserId();
            auditService.logAction(adminId, "APPROVE_USER", "USER", userId.toString(), null, "SYSTEM", "WEB");
        } catch (Exception e) {
            // log error
        }
    }
    
    private UUID getCurrentUserId() {
        try {
           Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof com.krishihub.auth.model.CustomUserDetails) {
                return ((CustomUserDetails) auth.getPrincipal()).getId();
            }
        } catch (Exception e) {
            // ignore
        }
        return UUID.fromString("00000000-0000-0000-0000-000000000000"); // System/Unknown
    }
}
