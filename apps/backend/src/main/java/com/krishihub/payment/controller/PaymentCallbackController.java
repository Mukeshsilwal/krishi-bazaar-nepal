package com.krishihub.payment.controller;

import com.krishihub.payment.dto.TransactionDto;
import com.krishihub.payment.service.PaymentService;
import com.krishihub.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments/callback")
@RequiredArgsConstructor
@Slf4j
public class PaymentCallbackController {

    private final PaymentService paymentService;

    @GetMapping("/esewa")
    public ResponseEntity<ApiResponse<String>> handleEsewaCallback(
            @RequestParam("data") String data
            ) {
        log.info("Received eSewa callback: {}", data);
        return ResponseEntity.ok(ApiResponse.success("eSewa callback received", "eSewa callback received"));
    }

    @GetMapping("/khalti")
    public ResponseEntity<ApiResponse<String>> handleKhaltiCallback(
            @RequestParam Map<String, String> data) {
        log.info("Received Khalti callback: {}", data);
        return ResponseEntity.ok(ApiResponse.success("Khalti callback received", "Khalti callback received"));
    }
    
    @PostMapping("/verify/{transactionId}")
    public ResponseEntity<ApiResponse<TransactionDto>> triggerVerification(
            @PathVariable String transactionId,
            @RequestParam(required = false) String gatewayTxnId) {
        
        TransactionDto txn = paymentService.verifyPayment(transactionId, gatewayTxnId);
        return ResponseEntity.ok(ApiResponse.success(txn));
    }
}
