package com.krishihub.masterdata.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MasterDataResponse {
    private String category;
    private List<Item> data;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Item {
        private String code;
        private String labelEn;
        private String labelNe;
        private Integer sortOrder;
    }
}
