package com.krishihub.auth.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.util.Date;
import java.util.UUID;

@Entity
@Table(name = "users")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "mobile_number", unique = true, nullable = false, length = 15)
    private String mobileNumber;

    @Column(name = "password_hash")
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserRole role;

    @ManyToMany(fetch = FetchType.EAGER) // EAGER to load permissions during authentication
    @JoinTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "role_id"))
    @Builder.Default
    private java.util.Set<com.krishihub.auth.entity.Role> roles = new java.util.HashSet<>();

    @Column(length = 100)
    private String name;

    @Column(length = 100)
    private String email;

    @Column(length = 50)
    private String district;

    @Column(length = 10)
    private String ward;

    @Column(name = "land_size", precision = 10, scale = 2)
    private BigDecimal landSize;

    @Column(nullable = false)
    @Builder.Default
    private Boolean verified = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean enabled = true;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @Column(name = "verification_notes", length = 500)
    private String verificationNotes;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Date createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Date updatedAt;

    public enum UserRole {
        FARMER,
        BUYER,
        VENDOR,
        ADMIN,
        EXPERT,
        SUPER_ADMIN
    }
}
