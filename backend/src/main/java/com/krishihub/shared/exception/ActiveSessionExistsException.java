package com.krishihub.shared.exception;

import com.krishihub.common.error.ErrorCode;
import com.krishihub.common.exception.BusinessException;

public class ActiveSessionExistsException extends BusinessException {

    public ActiveSessionExistsException(String message) {
        super(ErrorCode.ACCESS_DENIED, message, "तपाइँ पहिले नै अर्को उपकरणमा लग इन हुनुहुन्छ। कृपया पुन: प्रयास गर्नु अघि लग आउट गर्नुहोस्।");
    }
}
