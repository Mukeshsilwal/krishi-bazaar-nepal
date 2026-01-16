package com.krishihub.payment.controller;

import com.krishihub.common.context.UserContextHolder;
import com.krishihub.payment.dto.InitiatePaymentRequest;
import com.krishihub.payment.dto.PaymentResponse;
import com.krishihub.payment.dto.TransactionDto;
import com.krishihub.payment.service.PaymentService;
import com.krishihub.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/initiate")
    @PreAuthorize("hasAuthority('PAYMENT:INITIATE')")
    public ResponseEntity<ApiResponse<PaymentResponse>> initiatePayment(
            @Valid @RequestBody InitiatePaymentRequest request) {
        UUID userId = UserContextHolder.getUserId();
        PaymentResponse response = paymentService.initiatePayment(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Payment initiated successfully", response));
    }

    @PostMapping("/verify")
    @PreAuthorize("hasAuthority('PAYMENT:VERIFY')")
    public ResponseEntity<ApiResponse<TransactionDto>> verifyPayment(
            @RequestParam String transactionId,
            @RequestParam(required = false) String gatewayTransactionId) {
        TransactionDto transaction = paymentService.verifyPayment(transactionId, gatewayTransactionId);
        return ResponseEntity.ok(ApiResponse.success("Payment verified successfully", transaction));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('PAYMENT:READ')")
    public ResponseEntity<ApiResponse<TransactionDto>> getTransaction(
            @PathVariable UUID id) {
        UUID userId = com.krishihub.common.context.UserContextHolder.getUserId();
        TransactionDto transaction = paymentService.getTransaction(id, userId);
        return ResponseEntity.ok(ApiResponse.success(transaction));
    }
}
