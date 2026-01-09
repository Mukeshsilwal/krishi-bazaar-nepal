package com.krishihub.auth.repository;

import com.krishihub.auth.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

        Optional<User> findByMobileNumber(String mobileNumber);

        boolean existsByMobileNumber(String mobileNumber);

        boolean existsByEmail(String email);

        Optional<User> findByEmail(String email);

        List<User> findByVerifiedFalse();

        /**
         * Find users by district and role (for weather advisory targeting) - Case Insensitive & Trimmed
         */
        @Query("SELECT u FROM User u WHERE LOWER(TRIM(u.district)) = LOWER(TRIM(:district)) AND u.role = :role")
        List<User> findByDistrictAndRole(@Param("district") String district, @Param("role") User.UserRole role);

        /**
         * Count users by role
         */
        long countByRole(User.UserRole role);

        @Query("SELECT u FROM User u WHERE " +
                        "(:role IS NULL OR u.role = :role) AND " +
                        "(:status IS NULL OR u.enabled = :status) AND " +
                        "(:search IS NULL OR :search = '' OR " +
                        "LOWER(COALESCE(u.name, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        "LOWER(COALESCE(u.email, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        "COALESCE(u.mobileNumber, '') LIKE CONCAT('%', :search, '%'))")
        Page<User> searchUsers(@Param("role") User.UserRole role,
                        @Param("status") Boolean status,
                        @Param("search") String search,
                        Pageable pageable);
}
