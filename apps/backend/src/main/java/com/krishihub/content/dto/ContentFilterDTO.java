package com.krishihub.content.dto;

import com.krishihub.content.enums.ContentStatus;
import com.krishihub.content.enums.ContentType;
import lombok.Data;

@Data
public class ContentFilterDTO {
    private ContentType contentType;
    private ContentStatus status;
    private String crop;
    private String region;
    private String severity;
}
