package com.krishihub.auth.repository;

import com.krishihub.auth.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, UUID> {

    Optional<OtpVerification> findTopByMobileNumberAndVerifiedFalseOrderByCreatedAtDesc(String mobileNumber);

    void deleteByMobileNumberAndExpiresAtBefore(String mobileNumber, LocalDateTime dateTime);
}
