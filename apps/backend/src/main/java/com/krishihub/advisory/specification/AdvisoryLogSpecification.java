package com.krishihub.advisory.specification;

import com.krishihub.advisory.dto.AdvisoryLogFilterDTO;
import com.krishihub.advisory.entity.AdvisoryDeliveryLog;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class AdvisoryLogSpecification {

    public static Specification<AdvisoryDeliveryLog> withFilter(AdvisoryLogFilterDTO filter) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.getAdvisoryType() != null) {
                predicates.add(criteriaBuilder.equal(root.get("advisoryType"), filter.getAdvisoryType()));
            }

            if (filter.getSeverity() != null) {
                predicates.add(criteriaBuilder.equal(root.get("severity"), filter.getSeverity()));
            }

            if (filter.getRuleId() != null) {
                predicates.add(criteriaBuilder.equal(root.get("ruleId"), filter.getRuleId()));
            }

            if (filter.getDistrict() != null && !filter.getDistrict().isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("district"), filter.getDistrict()));
            }

            if (filter.getDeliveryStatus() != null) {
                predicates.add(criteriaBuilder.equal(root.get("deliveryStatus"), filter.getDeliveryStatus()));
            }

            if (filter.getStartDate() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("createdAt"), filter.getStartDate()));
            }

            if (filter.getEndDate() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("createdAt"), filter.getEndDate()));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
