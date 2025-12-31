package com.krishihub.common.service;

import com.krishihub.common.entity.AdministrativeUnit;
import com.krishihub.common.entity.CropType;
import com.krishihub.common.repository.AdministrativeUnitRepository;
import com.krishihub.common.repository.CropTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LegacyMasterDataService {

    private final CropTypeRepository cropTypeRepository;
    private final AdministrativeUnitRepository administrativeUnitRepository;

    public List<CropType> getAllCropTypes() {
        return cropTypeRepository.findAll();
    }

    public CropType createCropType(CropType cropType) {
        return cropTypeRepository.save(cropType);
    }

    public List<AdministrativeUnit> getUnitsByType(AdministrativeUnit.UnitType type) {
        return administrativeUnitRepository.findByType(type);
    }

    public List<AdministrativeUnit> getSubUnits(UUID parentId) {
        return administrativeUnitRepository.findByParentId(parentId);
    }

    public AdministrativeUnit createAdministrativeUnit(AdministrativeUnit unit) {
        return administrativeUnitRepository.save(unit);
    }
}
