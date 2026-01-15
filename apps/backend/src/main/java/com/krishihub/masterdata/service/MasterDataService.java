package com.krishihub.masterdata.service;

import com.krishihub.masterdata.dto.MasterCategoryDto;
import com.krishihub.masterdata.dto.MasterDataResponse;
import com.krishihub.masterdata.dto.MasterItemDto;
import com.krishihub.masterdata.entity.MasterCategory;
import com.krishihub.masterdata.entity.MasterItem;
import com.krishihub.masterdata.repository.MasterCategoryRepository;
import com.krishihub.masterdata.repository.MasterItemRepository;
import com.krishihub.shared.exception.BadRequestException;
import com.krishihub.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MasterDataService {

    private final MasterCategoryRepository categoryRepository;
    private final MasterItemRepository itemRepository;

    // --- Public API ---

    @Cacheable(value = "master-data", key = "#categoryCode")
    public MasterDataResponse getPublicMasterData(String categoryCode) {
        log.info("Fetching master data from DB for category: {}", categoryCode);

        // Validate category exists
        categoryRepository.findByCode(categoryCode)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + categoryCode));

        java.util.Date today = com.krishihub.common.util.DateTimeProvider.today();
        List<MasterItem> items = itemRepository.findActiveItemsByCategoryCode(categoryCode, today);

        List<MasterDataResponse.Item> responseItems = items.stream()
                .map(item -> MasterDataResponse.Item.builder()
                        .code(item.getCode())
                        .labelEn(item.getLabelEn())
                        .labelNe(item.getLabelNe())
                        .sortOrder(item.getSortOrder())
                        .build())
                .collect(Collectors.toList());

        return MasterDataResponse.builder()
                .category(categoryCode)
                .data(responseItems)
                .build();
    }

    // --- Admin APIs ---

    public List<MasterCategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::mapToCategoryDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public MasterCategoryDto createCategory(MasterCategoryDto request) {
        if (categoryRepository.findByCode(request.getCode()).isPresent()) {
            throw new BadRequestException("Category already exists: " + request.getCode());
        }

        MasterCategory category = MasterCategory.builder()
                .code(request.getCode())
                .name(request.getName())
                .description(request.getDescription())
                .active(true)
                .build();

        return mapToCategoryDto(categoryRepository.save(category));
    }

    public List<MasterItemDto> getItemsByCategory(UUID categoryId) {
        return itemRepository.findByCategoryIdOrderBySortOrderAsc(categoryId).stream()
                .map(this::mapToItemDto)
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = "master-data", allEntries = true) // Invalidate all for simplicity or match key logic
    public MasterItemDto createItem(UUID categoryId, MasterItemDto request) {
        MasterCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        MasterItem item = MasterItem.builder()
                .category(category)
                .code(request.getCode())
                .labelEn(request.getLabelEn())
                .labelNe(request.getLabelNe())
                .description(request.getDescription())
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .effectiveFrom(request.getEffectiveFrom())
                .effectiveTo(request.getEffectiveTo())
                .active(true)
                .build();

        return mapToItemDto(itemRepository.save(item));
    }

    @Transactional
    @CacheEvict(value = "master-data", allEntries = true)
    public MasterItemDto updateItem(UUID itemId, MasterItemDto request) {
        MasterItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found"));

        item.setLabelEn(request.getLabelEn());
        item.setLabelNe(request.getLabelNe());
        item.setDescription(request.getDescription());
        item.setSortOrder(request.getSortOrder());
        item.setEffectiveFrom(request.getEffectiveFrom());
        item.setEffectiveTo(request.getEffectiveTo());
        item.setActive(request.getActive());

        return mapToItemDto(itemRepository.save(item));
    }

    // --- Mappers ---

    private MasterCategoryDto mapToCategoryDto(MasterCategory category) {
        return MasterCategoryDto.builder()
                .id(category.getId())
                .code(category.getCode())
                .name(category.getName())
                .description(category.getDescription())
                .active(category.getActive())
                .build();
    }

    private MasterItemDto mapToItemDto(MasterItem item) {
        return MasterItemDto.builder()
                .id(item.getId())
                .categoryId(item.getCategory().getId())
                .code(item.getCode())
                .labelEn(item.getLabelEn())
                .labelNe(item.getLabelNe())
                .description(item.getDescription())
                .sortOrder(item.getSortOrder())
                .active(item.getActive())
                .effectiveFrom(item.getEffectiveFrom())
                .effectiveTo(item.getEffectiveTo())
                .build();
    }
}
