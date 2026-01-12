package com.krishihub.agristore.service;

import com.krishihub.agristore.dto.AgriProductDTO;
import com.krishihub.agristore.entity.AgriProduct;
import com.krishihub.agristore.entity.AgriProduct.AgriProductCategory;
import com.krishihub.agristore.repository.AgriProductRepository;
import com.krishihub.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AgriProductService {

    private final AgriProductRepository agriProductRepository;

    @Transactional(readOnly = true)
    public Page<AgriProductDTO> getAllProducts(AgriProductCategory category, String search, Pageable pageable) {
        String searchTerm = null;
        if (search != null && !search.trim().isEmpty()) {
            searchTerm = "%" + search.trim().toLowerCase() + "%";
        }
        Page<AgriProduct> products = agriProductRepository.searchProducts(category, searchTerm, pageable);
        return products.map(this::mapToDTO);
    }

    @Transactional(readOnly = true)
    public AgriProductDTO getProductById(UUID id) {
        AgriProduct product = agriProductRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return mapToDTO(product);
    }

    @Transactional
    public AgriProductDTO createProduct(AgriProductDTO dto) {
        AgriProduct product = mapToEntity(dto);
        product.setId(null); // Ensure new entity
        AgriProduct saved = agriProductRepository.save(product);
        return mapToDTO(saved);
    }

    @Transactional
    public AgriProductDTO updateProduct(UUID id, AgriProductDTO dto) {
        AgriProduct existing = agriProductRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        
        existing.setName(dto.getName());
        existing.setCategory(dto.getCategory());
        existing.setDescription(dto.getDescription());
        existing.setBrand(dto.getBrand());
        existing.setPrice(dto.getPrice());
        existing.setUnit(dto.getUnit());
        existing.setStockQuantity(dto.getStockQuantity());
        existing.setIsActive(dto.getIsActive());
        existing.setImageUrl(dto.getImageUrl());
        
        AgriProduct updated = agriProductRepository.save(existing);
        return mapToDTO(updated);
    }

    @Transactional
    public void deleteProduct(UUID id) {
        if (!agriProductRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found with id: " + id);
        }
        agriProductRepository.deleteById(id);
    }
    
    @Transactional
    public void updateStock(UUID id, Integer quantity) {
         AgriProduct existing = agriProductRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
         existing.setStockQuantity(quantity);
         agriProductRepository.save(existing);
    }

    private AgriProductDTO mapToDTO(AgriProduct entity) {
        return AgriProductDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .category(entity.getCategory())
                .description(entity.getDescription())
                .brand(entity.getBrand())
                .price(entity.getPrice())
                .unit(entity.getUnit())
                .stockQuantity(entity.getStockQuantity())
                .isActive(entity.getIsActive())
                .imageUrl(entity.getImageUrl())
                .build();
    }

    private AgriProduct mapToEntity(AgriProductDTO dto) {
        return AgriProduct.builder()
                .name(dto.getName())
                .category(dto.getCategory())
                .description(dto.getDescription())
                .brand(dto.getBrand())
                .price(dto.getPrice())
                .unit(dto.getUnit())
                .stockQuantity(dto.getStockQuantity())
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .imageUrl(dto.getImageUrl())
                .build();
    }
}
