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
    public ResponseEntity<String> handleEsewaCallback(
            @RequestParam("data") String data // eSewa V2 sends encoded data
            ) {
        log.info("Received eSewa callback: {}", data);
        // Implement V2 decoding if needed, or if this is failure/success url hit directly.
        // Assuming standard verification flow is preferred. 
        return ResponseEntity.ok("eSewa callback received");
    }

    @GetMapping("/khalti")
    public ResponseEntity<String> handleKhaltiCallback(
            @RequestParam Map<String, String> data) {
        log.info("Received Khalti callback: {}", data);
        return ResponseEntity.ok("Khalti callback received");
    }
    
    // Explicit server-to-server check
    @PostMapping("/verify/{transactionId}")
    public ResponseEntity<ApiResponse<TransactionDto>> triggerVerification(
            @PathVariable UUID transactionId,
            @RequestParam(required = false) String gatewayTxnId) {
        
        // This endpoint can be forced by admin/system to re-check a specific ID
        TransactionDto txn = paymentService.verifyPayment(transactionId, gatewayTxnId);
        return ResponseEntity.ok(ApiResponse.success(txn));
    }
}
