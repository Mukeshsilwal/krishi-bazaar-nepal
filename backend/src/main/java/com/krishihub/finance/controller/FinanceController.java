package com.krishihub.finance.controller;

import com.krishihub.finance.entity.Loan;
import com.krishihub.finance.entity.InsurancePolicy;
import com.krishihub.finance.service.FinanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/finance")
@RequiredArgsConstructor
public class FinanceController {

    private final FinanceService financeService;

    // Loans
    @PostMapping("/loans")
    public ResponseEntity<Loan> applyForLoan(@RequestBody Loan loan) {
        return ResponseEntity.ok(financeService.applyForLoan(loan));
    }

    @GetMapping("/loans")
    public ResponseEntity<List<Loan>> getLoans(@RequestParam UUID farmerId) {
        return ResponseEntity.ok(financeService.getFarmerLoans(farmerId));
    }

    // Insurance
    @PostMapping("/insurance")
    public ResponseEntity<InsurancePolicy> applyForInsurance(@RequestBody InsurancePolicy policy) {
        return ResponseEntity.ok(financeService.applyForInsurance(policy));
    }

    @GetMapping("/insurance")
    public ResponseEntity<List<InsurancePolicy>> getPolicies(@RequestParam UUID farmerId) {
        return ResponseEntity.ok(financeService.getFarmerPolicies(farmerId));
    }
}
