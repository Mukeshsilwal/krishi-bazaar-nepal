package com.krishihub.admin.service;

import com.krishihub.auth.repository.UserRepository;
import com.krishihub.knowledge.entity.ArticleStatus;
import com.krishihub.knowledge.repository.ArticleRepository;
import com.krishihub.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminAnalyticsService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final ArticleRepository articleRepository;

    public com.krishihub.admin.dto.AdminDashboardStats getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalOrders = orderRepository.count();
        long totalArticles = articleRepository.count();
        long publishedArticles = articleRepository.countByStatus(ArticleStatus.PUBLISHED);

        return com.krishihub.admin.dto.AdminDashboardStats.builder()
                .totalUsers(totalUsers)
                .totalOrders(totalOrders)
                .totalArticles(totalArticles)
                .publishedArticles(publishedArticles)
                .build();
    }
}
