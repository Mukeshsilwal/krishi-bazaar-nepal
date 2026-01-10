package com.krishihub.payment.service;

import com.krishihub.payment.dto.PaymentInitiateResponse;
import com.krishihub.payment.dto.PaymentVerificationRequest;
import com.krishihub.payment.dto.PaymentVerificationResponse;
import com.krishihub.payment.entity.Transaction;

public interface PaymentStrategy {
    PaymentInitiateResponse initiatePayment(Transaction transaction);
    PaymentVerificationResponse verifyPayment(PaymentVerificationRequest request);
}
