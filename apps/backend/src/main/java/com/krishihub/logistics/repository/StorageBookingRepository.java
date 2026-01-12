package com.krishihub.logistics.repository;

import com.krishihub.logistics.entity.StorageBooking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface StorageBookingRepository extends JpaRepository<StorageBooking, UUID> {
    List<StorageBooking> findByFarmerId(UUID farmerId);
    List<StorageBooking> findByColdStorageId(UUID coldStorageId);
}
