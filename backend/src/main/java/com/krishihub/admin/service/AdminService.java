package com.krishihub.admin.service;

import com.krishihub.admin.dto.AdminDashboardStats;
import com.krishihub.advisory.repository.AdvisoryDeliveryLogRepository;
import com.krishihub.auth.entity.User;
import com.krishihub.auth.repository.UserRepository;
import com.krishihub.diagnosis.repository.AIDiagnosisRepository;
import com.krishihub.knowledge.entity.ArticleStatus;
import com.krishihub.knowledge.repository.ArticleRepository;
import com.krishihub.order.repository.OrderRepository;
import com.krishihub.marketplace.repository.CropListingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final CropListingRepository listingRepository;
    private final ArticleRepository articleRepository;
    private final AdvisoryDeliveryLogRepository advisoryLogRepository;
    private final AIDiagnosisRepository aiDiagnosisRepository;

    public AdminDashboardStats getDashboardStats() {
        LocalDateTime todayStart = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime todayEnd = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);

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
                .activeAdvisories(advisoryLogRepository.countSince(todayStart.minusDays(7)))
                .highRiskAlerts(advisoryLogRepository.countHighRiskSince(todayStart))
                .advisoriesDeliveredToday(advisoryLogRepository.countSince(todayStart))

                // System Metrics
                .totalOrders(orderRepository.count())
                .aiDiagnosisCount(aiDiagnosisRepository.count())
                .build();
    }

    public List<User> getPendingVendors() {
        // Assuming getting unverified users with role VENDOR or FARMER
        // For MVP, just returning all unverified
        return userRepository.findByVerifiedFalse();
    }

    public void approveUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setVerified(true);
        userRepository.save(user);
    }
}
