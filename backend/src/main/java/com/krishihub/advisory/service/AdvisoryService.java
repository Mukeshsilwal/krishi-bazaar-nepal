package com.krishihub.advisory.service;

import com.krishihub.advisory.dto.AdvisoryResponse;
import java.util.List;

public interface AdvisoryService {
    List<AdvisoryResponse> getContextualAdvisory(String contextType, String parameter);
}
