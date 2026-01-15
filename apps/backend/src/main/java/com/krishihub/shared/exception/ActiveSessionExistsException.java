package com.krishihub.shared.exception;

import com.krishihub.common.exception.ApplicationException;

public class ActiveSessionExistsException extends ApplicationException {

    public ActiveSessionExistsException(String developerMessage) {
        super("ACTIVE_SESSION_EXISTS", 
              "तपाइँ पहिले नै अर्को उपकरणमा लग इन हुनुहुन्छ। कृपया पुन: प्रयास गर्नु अघि लग आउट गर्नुहोस्。", 
              developerMessage);
    }
}

