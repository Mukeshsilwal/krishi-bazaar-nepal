package com.krishihub.messaging.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.UUID;

/**
 * DTO for Chat User Directory listing
 * Represents a user in the chat sidebar with all relevant metadata
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatUserDto {
    
    private UUID userId;
    private String name;
    private String mobileNumber;
    private String email;
    private String role;
    private String profileImage;
    private Boolean online;
    private String lastMessage;
    private Date lastMessageTime;
    private Long unreadCount;
    private Date lastSeen;
    private UUID conversationId;
    
    /**
     * Indicates if this user has an active conversation with the current user
     */
    private Boolean hasConversation;
}
