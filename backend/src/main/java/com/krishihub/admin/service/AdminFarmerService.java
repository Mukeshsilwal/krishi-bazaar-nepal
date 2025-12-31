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

        public List<User> getAllFarmers() {
                // ideally filter by Role.FARMER, but for now filtering in memory or custom
                // query if needed
                // Assuming all users for now or added specific logic
                return userRepository.findAll().stream()
                                .filter(u -> u.getRole() == User.UserRole.FARMER)
                                .collect(Collectors.toList());
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

                return userRepository.save(farmer);
        }

        public void exportFarmers(java.io.PrintWriter writer) {
                try {
                        List<User> farmers = getAllFarmers();
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

                        for (String[] record : records) {
                                // Simplistic assumption of column order: Name, Mobile, District, Ward
                                // In production, robust validation needed.
                                if (record.length < 4)
                                        continue;

                                String name = record[1];
                                String mobile = record[2];
                                String district = record[3];
                                String ward = record.length > 4 ? record[4] : "";

                                // Check duplicates by mobile
                                if (userRepository.findByMobileNumber(mobile).isPresent()) {
                                        continue; // Skip existing
                                }

                                User newFarmer = User.builder()
                                                .name(name)
                                                .mobileNumber(mobile)
                                                .district(district)
                                                .ward(ward)
                                                .role(User.UserRole.FARMER)
                                                .verified(false) // Default unverified for imported
                                                .createdAt(java.time.LocalDateTime.now())
                                                .passwordHash("CHANGE_ME") // distinct placeholder
                                                .build();

                                userRepository.save(newFarmer);
                        }
                } catch (Exception e) {
                        throw new RuntimeException("Error processing CSV import: " + e.getMessage());
                }
        }
}
