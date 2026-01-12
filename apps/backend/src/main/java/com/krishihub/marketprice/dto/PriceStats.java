package com.krishihub.marketprice.dto;

import java.time.LocalDate;

public interface PriceStats {
    LocalDate getDate();
    Double getMin();
    Double getMax();
    Double getAvg();
}
