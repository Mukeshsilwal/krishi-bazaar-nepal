package com.krishihub.messaging.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationDto {
    private UUID userId;
    private String userName;
    private String userMobile;
    private UUID listingId;
    private String lastMessage;
    private java.util.Date lastMessageTime;
    private long unreadCount;
}
