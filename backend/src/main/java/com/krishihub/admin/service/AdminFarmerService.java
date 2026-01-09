package com.krishihub.admin.service;

import com.krishihub.admin.dto.FarmerProfileDto;
import com.krishihub.auth.entity.User;
import com.krishihub.auth.repository.UserRepository;
import com.krishihub.marketplace.entity.CropListing;
import com.krishihub.order.entity.Order;
import com.krishihub.marketplace.repository.CropListingRepository;
import com.krishihub.order.repository.OrderRepository;
import com.krishihub.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.krishihub.admin.dto.FarmerVerificationRequest;
import jakarta.transaction.Transactional;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminFarmerService {

        private final UserRepository userRepository;
        private final CropListingRepository cropListingRepository;
        private final OrderRepository orderRepository;
        private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
        private final com.krishihub.notification.repository.NotificationRepository notificationRepository;
        private final com.krishihub.notification.service.NotificationSenderService notificationSenderService;

        public org.springframework.data.domain.Page<User> getAllFarmers(String search, Pageable pageable) {
                return userRepository.searchUsers(User.UserRole.FARMER, null, search, pageable);
        }

        public FarmerProfileDto getFarmerProfile(UUID farmerId) {
                User farmer = userRepository.findById(farmerId)
                                .orElseThrow(() -> new ResourceNotFoundException("Farmer not found"));

                // Fetch recent data (limit 5)

                if (!farmer.getRole().equals(User.UserRole.FARMER)) {
                        throw new RuntimeException("User is not a farmer");
                }

                List<CropListing> recentListings = cropListingRepository
                                .findTop5ByFarmerIdOrderByCreatedAtDesc(farmerId);
                List<Order> recentOrders = orderRepository.findTop5ByBuyerIdOrderByCreatedAtDesc(farmerId);

                Map<String, Object> stats = new HashMap<>();
                stats.put("totalListings", cropListingRepository.countByFarmerId(farmerId));
                stats.put("totalOrders", orderRepository.countByBuyerId(farmerId));

                return FarmerProfileDto.builder()
                                .farmer(farmer)
                                .statistics(stats)
                                .recentListings(recentListings)
                                .recentOrders(recentOrders)
                                .build();
        }

        private final com.krishihub.admin.service.AuditService auditService;

        @Transactional
        public User verifyFarmer(UUID farmerId, FarmerVerificationRequest request) {
                User farmer = userRepository.findById(farmerId)
                                .orElseThrow(() -> new RuntimeException("Farmer not found"));

                farmer.setVerified(request.isVerified());

                if (request.isVerified()) {
                        farmer.setRejectionReason(null);
                } else {
                        farmer.setRejectionReason(request.getRejectionReason());
                }

                farmer.setVerificationNotes(request.getVerificationNotes());

                User saved = userRepository.save(farmer);
                
                // Audit
                try {
                    auditService.logAction(getCurrentUserId(), "VERIFY_FARMER", "USER", farmerId.toString(), 
                        Map.of("verified", request.isVerified()), "SYSTEM", "WEB");
                } catch (Exception e) {}
                
                return saved;
        }

        public void exportFarmers(java.io.PrintWriter writer) {
                try {
                        List<User> farmers = getAllFarmers(null, PageRequest.of(0, 10000)).getContent(); // Export all (limit 10k)
                        com.opencsv.CSVWriter csvWriter = new com.opencsv.CSVWriter(writer);

                        // Header
                        csvWriter.writeNext(new String[] { "ID", "Name", "Mobile", "District", "Ward", "Verified",
                                        "Role" });

                        for (User farmer : farmers) {
                                csvWriter.writeNext(new String[] {
                                                farmer.getId() != null ? farmer.getId().toString() : "",
                                                farmer.getName() != null ? farmer.getName() : "",
                                                farmer.getMobileNumber() != null ? farmer.getMobileNumber() : "",
                                                farmer.getDistrict() != null ? farmer.getDistrict() : "",
                                                farmer.getWard() != null ? farmer.getWard() : "",
                                                farmer.getVerified() != null ? farmer.getVerified().toString()
                                                                : "false",
                                                farmer.getRole() != null ? farmer.getRole().toString() : ""
                                });
                        }
                        csvWriter.close();
                } catch (Exception e) {
                        throw new RuntimeException("Error executing CSV export: " + e.getMessage());
                }
        }

        @Transactional
        public void importFarmers(org.springframework.web.multipart.MultipartFile file) {
                try (java.io.Reader reader = new java.io.InputStreamReader(file.getInputStream())) {
                        com.opencsv.CSVReader csvReader = new com.opencsv.CSVReader(reader);
                        List<String[]> records = csvReader.readAll();

                        // Skip header if present (assuming first row is header)
                        if (!records.isEmpty() && records.get(0)[0].equalsIgnoreCase("ID")) {
                                records.remove(0);
                        }

                        int importedCount = 0;
                        for (String[] record : records) {
                                // Simplistic assumption of column order: Name, Mobile, District, Ward
                                // In production, robust validation needed.
                                if (record.length < 4)
                                        continue;

                                String name = record[1];
                                String mobile = record[2];
                                String district = record[3];
                                String ward = record.length > 4 ? record[4] : "";
                                String email = record.length > 5 ? record[5] : null; // Assuming email might be in 5th index

                                // Check duplicates by mobile
                                if (userRepository.findByMobileNumber(mobile).isPresent()) {
                                        continue; // Skip existing
                                }
                                
                                String rawPassword = java.util.UUID.randomUUID().toString().substring(0, 8);
                                String encodedPassword = passwordEncoder.encode(rawPassword);

                                User newFarmer = User.builder()
                                                .name(name)
                                                .mobileNumber(mobile)
                                                .email(email)
                                                .district(district)
                                                .ward(ward)
                                                .role(User.UserRole.FARMER)
                                                .verified(false) // Default unverified for imported
                                                .createdAt(java.time.LocalDateTime.now())
                                                .passwordHash(encodedPassword)
                                                .build();

                                User savedUser = userRepository.save(newFarmer);
                                importedCount++;
                                
                                // Create Notification
                                createAndSendWelcomeNotification(savedUser, rawPassword);
                        }
                        
                        // Audit Import
                         try {
                            auditService.logAction(getCurrentUserId(), "IMPORT_FARMERS", "BATCH", "N/A", 
                                Map.of("count", importedCount), "SYSTEM", "WEB");
                        } catch (Exception e) {}

                } catch (Exception e) {
                        throw new RuntimeException("Error processing CSV import: " + e.getMessage());
                }
        }
        
        private void createAndSendWelcomeNotification(User user, String password) {
             try {
                String message = "Welcome to Krishi Bazaar! Your account has been created. Password: " + password;
                com.krishihub.notification.entity.Notification notification = com.krishihub.notification.entity.Notification.builder()
                    .userId(user.getId())
                    .title("Welcome to Krishi Bazaar")
                    .message(message)
                    .type("ACCOUNT_CREATED")
                    .channel(user.getEmail() != null ? com.krishihub.notification.enums.NotificationChannel.EMAIL : com.krishihub.notification.enums.NotificationChannel.SMS)
                    .status(com.krishihub.notification.enums.NotificationStatus.PENDING)
                    .isRead(false)
                    .createdAt(java.time.LocalDateTime.now())
                    .build();
                
                com.krishihub.notification.entity.Notification saved = notificationRepository.save(notification);
                notificationSenderService.sendNotification(saved.getId());
             } catch (Exception e) {
                 // Log but don't fail import
                 System.err.println("Failed to notify user " + user.getId());
             }
        }
        
        private UUID getCurrentUserId() {
            try {
                org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.getPrincipal() instanceof com.krishihub.auth.model.CustomUserDetails) {
                    return ((com.krishihub.auth.model.CustomUserDetails) auth.getPrincipal()).getId();
                }
            } catch (Exception e) {
                // ignore
            }
            return UUID.fromString("00000000-0000-0000-0000-000000000000"); // System/Unknown
        }
}
