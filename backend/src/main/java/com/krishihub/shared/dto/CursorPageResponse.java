package com.krishihub.shared.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Generic cursor-based pagination response
 * 
 * @param <T> Type of data items
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CursorPageResponse<T> {
    private List<T> data;
    private String nextCursor;
    private Boolean hasMore;
    private Integer limit;
    private Long totalCount; // Optional, may be expensive to compute
}
