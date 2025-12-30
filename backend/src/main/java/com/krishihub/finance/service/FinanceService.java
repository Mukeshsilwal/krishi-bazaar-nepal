package com.krishihub.finance.service;

import com.krishihub.finance.entity.Loan;
import com.krishihub.finance.entity.InsurancePolicy;
import com.krishihub.finance.repository.LoanRepository;
import com.krishihub.finance.repository.InsurancePolicyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FinanceService {

    private final LoanRepository loanRepository;
    private final InsurancePolicyRepository insurancePolicyRepository;

    public Loan applyForLoan(Loan loan) {
        loan.setStatus(Loan.LoanStatus.PENDING);
        // In real app, integration with bank API here
        return loanRepository.save(loan);
    }

    public List<Loan> getFarmerLoans(UUID farmerId) {
        return loanRepository.findByFarmerId(farmerId);
    }

    public InsurancePolicy applyForInsurance(InsurancePolicy policy) {
        policy.setStatus(InsurancePolicy.PolicyStatus.PENDING);
        // Integration with Insurance provider
        return insurancePolicyRepository.save(policy);
    }

    public List<InsurancePolicy> getFarmerPolicies(UUID farmerId) {
        return insurancePolicyRepository.findByFarmerId(farmerId);
    }
}
