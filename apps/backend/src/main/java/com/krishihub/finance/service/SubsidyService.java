package com.krishihub.finance.service;

import com.krishihub.finance.entity.Subsidy;
import com.krishihub.finance.repository.SubsidyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubsidyService {

    private final SubsidyRepository subsidyRepository;

    public List<Subsidy> getAllSubsidies() {
        return subsidyRepository.findAll();
    }

    public org.springframework.data.domain.Page<Subsidy> getAllSubsidies(org.springframework.data.domain.Pageable pageable) {
        return subsidyRepository.findAll(pageable);
    }

    public Subsidy createSubsidy(Subsidy subsidy) {
        return subsidyRepository.save(subsidy);
    }
}
