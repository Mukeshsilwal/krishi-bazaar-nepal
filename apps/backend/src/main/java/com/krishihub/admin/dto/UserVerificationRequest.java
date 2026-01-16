package com.krishihub.admin.dto;

import lombok.Data;

@Data
public class UserVerificationRequest {
    private boolean verified;
    private String reason; // Optional reason for rejection
}
