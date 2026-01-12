package com.krishihub.messaging.dto;

import com.krishihub.messaging.entity.Message;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageDto {
    private UUID id;
    private UserInfo sender;
    private UserInfo receiver;
    private UUID listingId;
    private String message;
    private Boolean isRead;
    private LocalDateTime createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private UUID id;
        private String name;
        private String mobileNumber;
    }

    public static MessageDto fromEntity(Message message) {
        return MessageDto.builder()
                .id(message.getId())
                .sender(UserInfo.builder()
                        .id(message.getSender().getId())
                        .name(message.getSender().getName())
                        .mobileNumber(message.getSender().getMobileNumber())
                        .build())
                .receiver(UserInfo.builder()
                        .id(message.getReceiver().getId())
                        .name(message.getReceiver().getName())
                        .mobileNumber(message.getReceiver().getMobileNumber())
                        .build())
                .listingId(message.getListing() != null ? message.getListing().getId() : null)
                .message(message.getMessage())
                .isRead(message.getIsRead())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
