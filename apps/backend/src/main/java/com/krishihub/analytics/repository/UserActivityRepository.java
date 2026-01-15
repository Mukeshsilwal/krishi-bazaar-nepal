package com.krishihub.analytics.repository;

import com.krishihub.analytics.entity.UserActivity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserActivityRepository extends JpaRepository<UserActivity, Long> {

    List<UserActivity> findByUserId(java.util.UUID userId);

    Page<UserActivity> findByTimestampBetween(java.util.Date start, java.util.Date end, Pageable pageable);
    
    Page<UserActivity> findByAction(String action, Pageable pageable);
}
