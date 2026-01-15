package com.krishihub.payment.service.strategy;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentVerificationResult {
    private boolean success;
    private String transactionId; // The ID from the gateway (e.g. refId, pidx)
    private String failureReason;
    private String rawResponse; // The raw JSON/String response from the gateway
}
