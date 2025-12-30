package com.krishihub.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponse {
    private UUID transactionId;
    private String paymentUrl;
    private String paymentMethod;
    private String status;
    private String message;
    private BigDecimal amount;
    private Map<String, Object> data; // Contains htmlForm and other metadata
}
