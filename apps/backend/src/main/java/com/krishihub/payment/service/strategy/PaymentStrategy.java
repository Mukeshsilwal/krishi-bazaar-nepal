package com.krishihub.payment.service.strategy;

import com.krishihub.payment.entity.Transaction;

import java.math.BigDecimal;
import java.util.UUID;

public interface PaymentStrategy {
    Transaction.PaymentMethod getPaymentMethod();

    PaymentInitiationResult initiatePayment(UUID orderId, BigDecimal amount);

    PaymentVerificationResult verifyPayment(String transactionId, BigDecimal amount);
}
