package com.krishihub.messaging.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SendMessageRequest {
    private UUID conversationId;
    private UUID receiverId;
    private UUID listingId;
    private String message;
    private String type; // TEXT, IMAGE, FILE
    
    // File fields
    private String fileUrl;
    private String fileName;
    private Long fileSize;
    private String fileType;
}
