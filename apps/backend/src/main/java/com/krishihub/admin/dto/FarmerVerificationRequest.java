package com.krishihub.admin.dto;

import lombok.Data;

@Data
public class FarmerVerificationRequest {
    private boolean verified;
    private String rejectionReason;
    private String verificationNotes;
}
