package com.krishihub.logistics.service;

import com.krishihub.logistics.entity.ColdStorage;
import com.krishihub.logistics.repository.ColdStorageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ColdStorageService {

    private final ColdStorageRepository coldStorageRepository;

    public List<ColdStorage> getAllColdStorages() {
        return coldStorageRepository.findAll();
    }

    public List<ColdStorage> getColdStorageByDistrict(String district) {
        return coldStorageRepository.findByDistrict(district);
    }

    public ColdStorage createColdStorage(ColdStorage coldStorage) {
        return coldStorageRepository.save(coldStorage);
    }
}
