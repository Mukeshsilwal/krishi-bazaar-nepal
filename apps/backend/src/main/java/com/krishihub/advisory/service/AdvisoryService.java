package com.krishihub.advisory.service;

import com.krishihub.advisory.dto.AdvisoryResponse;
import java.util.List;

public interface AdvisoryService {
    List<AdvisoryResponse> getContextualAdvisory(com.krishihub.advisory.enums.AdvisoryContextType contextType,
            String parameter);

    void generateAdvisoryRules(java.util.UUID userId);
}
