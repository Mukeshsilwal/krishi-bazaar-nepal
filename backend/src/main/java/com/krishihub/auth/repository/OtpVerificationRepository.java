package com.krishihub.auth.repository;

import com.krishihub.auth.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, UUID> {

    @Query(value = "SELECT * FROM otp_verifications WHERE mobile_number = :mobileNumber AND verified = false ORDER BY created_at DESC LIMIT 1", nativeQuery = true)
    Optional<OtpVerification> findTopByMobileNumberAndVerifiedFalseOrderByCreatedAtDesc(@org.springframework.data.repository.query.Param("mobileNumber") String mobileNumber);

    void deleteByMobileNumberAndExpiresAtBefore(String mobileNumber, LocalDateTime dateTime);
}
