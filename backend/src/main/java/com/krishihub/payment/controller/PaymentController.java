package com.krishihub.payment.controller;

import com.krishihub.payment.dto.InitiatePaymentRequest;
import com.krishihub.payment.dto.PaymentResponse;
import com.krishihub.payment.dto.TransactionDto;
import com.krishihub.payment.service.PaymentService;
import com.krishihub.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/initiate")
    public ResponseEntity<ApiResponse<PaymentResponse>> initiatePayment(
            Authentication authentication,
            @Valid @RequestBody InitiatePaymentRequest request) {
        String mobileNumber = authentication.getName();
        PaymentResponse response = paymentService.initiatePayment(mobileNumber, request);
        return ResponseEntity.ok(ApiResponse.success("Payment initiated successfully", response));
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<TransactionDto>> verifyPayment(
            @RequestParam UUID transactionId,
            @RequestParam String gatewayTransactionId) {
        TransactionDto transaction = paymentService.verifyPayment(transactionId, gatewayTransactionId);
        return ResponseEntity.ok(ApiResponse.success("Payment verified successfully", transaction));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TransactionDto>> getTransaction(
            @PathVariable UUID id,
            Authentication authentication) {
        String mobileNumber = authentication.getName();
        TransactionDto transaction = paymentService.getTransaction(id, mobileNumber);
        return ResponseEntity.ok(ApiResponse.success(transaction));
    }
}
