package com.krishihub.auth.dto;

import com.krishihub.auth.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {
    private UUID id;
    private String mobileNumber;
    private String name;
    private String email;
    private String role;
    private String district;
    private String ward;
    private BigDecimal landSize;
    private Boolean verified;
    private LocalDateTime createdAt;

    public static UserDto fromEntity(User user) {
        return UserDto.builder()
                .id(user.getId())
                .mobileNumber(user.getMobileNumber())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .district(user.getDistrict())
                .ward(user.getWard())
                .landSize(user.getLandSize())
                .verified(user.getVerified())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
