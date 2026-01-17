package com.krishihub.support.dto;

import com.krishihub.support.entity.Feedback;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackDto {
    private UUID id;
    private UUID userId;
    private String userName;
    private String type;
    private String message;
    private String status;
    private Date createdAt;

    public static FeedbackDto fromEntity(Feedback feedback) {
        return FeedbackDto.builder()
                .id(feedback.getId())
                .userId(feedback.getUser() != null ? feedback.getUser().getId() : null)
                .userName(feedback.getUser() != null ? feedback.getUser().getName() : "Anonymous")
                .type(feedback.getType().name())
                .message(feedback.getMessage())
                .status(feedback.getStatus().name())
                .createdAt(feedback.getCreatedAt())
                .build();
    }
}
