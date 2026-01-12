package com.krishihub.agristore.repository;

import com.krishihub.agristore.entity.AgriProduct;
import com.krishihub.agristore.entity.AgriProduct.AgriProductCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface AgriProductRepository extends JpaRepository<AgriProduct, UUID> {
    
    Page<AgriProduct> findByIsActiveTrue(Pageable pageable);
    
    Page<AgriProduct> findByCategoryAndIsActiveTrue(AgriProductCategory category, Pageable pageable);

    @Query("SELECT p FROM AgriProduct p WHERE (:category IS NULL OR p.category = :category) AND (:search IS NULL OR LOWER(p.name) LIKE :search) AND p.isActive = true")
    Page<AgriProduct> searchProducts(@Param("category") AgriProductCategory category, @Param("search") String search, Pageable pageable);
}
