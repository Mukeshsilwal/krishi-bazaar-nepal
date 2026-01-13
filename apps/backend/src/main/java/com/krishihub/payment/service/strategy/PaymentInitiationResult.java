package com.krishihub.payment.service.strategy;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class PaymentInitiationResult {
    private String transactionId;
    private String paymentUrl;
    private Map<String, Object> paymentData;
}
