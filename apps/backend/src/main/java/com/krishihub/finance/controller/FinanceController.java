package com.krishihub.finance.controller;

import com.krishihub.finance.entity.Loan;
import com.krishihub.finance.entity.InsurancePolicy;
import com.krishihub.finance.service.FinanceService;
import com.krishihub.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/finance")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class FinanceController {

    private final FinanceService financeService;

    // Loans
    @PostMapping("/loans")
    public ResponseEntity<ApiResponse<Loan>> applyForLoan(@RequestBody Loan loan) {
        return ResponseEntity.ok(ApiResponse.success("Loan application submitted", financeService.applyForLoan(loan)));
    }

    @GetMapping("/loans")
    public ResponseEntity<ApiResponse<List<Loan>>> getLoans(@RequestParam UUID farmerId) {
        return ResponseEntity.ok(ApiResponse.success(financeService.getFarmerLoans(farmerId)));
    }

    // Insurance
    @PostMapping("/insurance")
    public ResponseEntity<ApiResponse<InsurancePolicy>> applyForInsurance(@RequestBody InsurancePolicy policy) {
        return ResponseEntity.ok(ApiResponse.success("Insurance application submitted", financeService.applyForInsurance(policy)));
    }

    @GetMapping("/insurance")
    public ResponseEntity<ApiResponse<List<InsurancePolicy>>> getPolicies(@RequestParam UUID farmerId) {
        return ResponseEntity.ok(ApiResponse.success(financeService.getFarmerPolicies(farmerId)));
    }
}
