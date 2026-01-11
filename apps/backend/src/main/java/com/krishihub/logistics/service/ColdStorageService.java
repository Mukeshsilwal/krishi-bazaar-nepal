package com.krishihub.logistics.service;

import com.krishihub.logistics.entity.ColdStorage;
import com.krishihub.logistics.repository.ColdStorageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ColdStorageService {

    private final ColdStorageRepository coldStorageRepository;
    private final com.krishihub.logistics.repository.StorageBookingRepository storageBookingRepository;

    public List<ColdStorage> getAllColdStorages() {
        return coldStorageRepository.findAll();
    }

    public List<ColdStorage> getColdStorageByDistrict(String district) {
        return coldStorageRepository.findByDistrict(district);
    }

    public ColdStorage createColdStorage(ColdStorage coldStorage) {
        return coldStorageRepository.save(coldStorage);
    }

    public java.util.List<com.krishihub.logistics.entity.StorageBooking> getAllBookings() {
        return storageBookingRepository.findAll();
    }

    public com.krishihub.logistics.entity.StorageBooking bookStorage(com.krishihub.logistics.entity.StorageBooking booking) {
        // Basic validation
        ColdStorage storage = coldStorageRepository.findById(booking.getColdStorageId())
                .orElseThrow(() -> new RuntimeException("Cold Storage not found"));

        if (storage.getAvailableCapacity() < booking.getQuantity()) {
            throw new RuntimeException("Not enough capacity available");
        }
        
        // Retrieve current user as farmer if not set (or validate)
        UUID currentUserId = com.krishihub.common.context.UserContextHolder.getUserId();
        if (booking.getFarmerId() == null && currentUserId != null) {
            booking.setFarmerId(currentUserId);
        } else if (booking.getFarmerId() == null) {
             throw new RuntimeException("Farmer ID is required");
        }

        booking.setStatus(com.krishihub.logistics.entity.StorageBooking.BookingStatus.PENDING);
        
        // Calculate price if not set (simple logic)
        if (booking.getTotalPrice() == null && storage.getPricePerKgPerDay() != null) {
            long days = java.time.temporal.ChronoUnit.DAYS.between(booking.getStartDate(), booking.getEndDate());
            if (days < 1) days = 1;
            
            java.math.BigDecimal quantity = java.math.BigDecimal.valueOf(booking.getQuantity());
            java.math.BigDecimal totalPrice = storage.getPricePerKgPerDay().multiply(quantity).multiply(java.math.BigDecimal.valueOf(days));
            
            booking.setTotalPrice(totalPrice.doubleValue());
        }

        // Ideally reduce available capacity immediately or on approval? 
        // For simplicity, let's reduce it now or just track bookings.
        // Let's NOT transform ColdStorage entity here for now to avoid concurrency issues without locks.
        // Or assume "availableCapacity" is manually managed or computed.
        
        return storageBookingRepository.save(booking);
    }
}
