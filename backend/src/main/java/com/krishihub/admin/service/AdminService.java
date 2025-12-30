package com.krishihub.admin.service;

import com.krishihub.auth.entity.User;
import com.krishihub.auth.repository.UserRepository;
import com.krishihub.order.repository.OrderRepository;
import com.krishihub.marketplace.repository.CropListingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
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

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalOrders", orderRepository.count());
        stats.put("activeListings", listingRepository.count());
        // Mock revenue/growth data for charts
        stats.put("revenue", 1500000); 
        return stats;
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
