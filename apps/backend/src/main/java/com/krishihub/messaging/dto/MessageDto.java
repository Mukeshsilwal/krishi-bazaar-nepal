package com.krishihub.messaging.dto;

import com.krishihub.messaging.entity.Message;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageDto {
    private UUID id;
    private UUID conversationId; // Add this
    private UserInfo sender;
    private UserInfo receiver;
    private UUID listingId;
    private String message;
    private Boolean isRead;
    private String status;
    private Date createdAt;
    
    // File attachment fields
    private String fileUrl;
    private String fileName;
    private Long fileSize;
    private String fileType;

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
                .conversationId(message.getConversation().getId())
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
                .status(message.getStatus() != null ? message.getStatus().name() : "SENT")
                .createdAt(message.getCreatedAt())
                .fileUrl(message.getFileUrl())
                .fileName(message.getFileName())
                .fileSize(message.getFileSize())
                .fileType(message.getFileType())
                .build();
    }
}
