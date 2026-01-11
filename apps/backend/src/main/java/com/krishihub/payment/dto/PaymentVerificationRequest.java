package com.krishihub.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentVerificationRequest {
    private String transactionId;
    private String amount;
    private String refId;
    private String productCode;
    private Map<String, String> payload;
}
