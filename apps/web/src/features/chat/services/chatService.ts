import api from '../../../services/api';
import { MESSAGE_ENDPOINTS } from '../../../config/endpoints';
import { BACKEND_URL, WS_URL } from '../../../config/app';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface ChatMessage {
    id: string;
    conversationId: string;
    senderId: string;
    receiverId?: string;
    message: string;
    type: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
    isRead: boolean;
    status: 'SENT' | 'DELIVERED' | 'SEEN';
    createdAt: string;
    // File attachment fields
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    fileType?: string;
}

export interface Conversation {
    id: string;
    userId: string; // Partner ID
    userName: string;
    userMobile: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    type: 'DIRECT' | 'ORDER' | 'SUPPORT';
    listingId?: string;
}

export interface SendMessageRequest {
    conversationId?: string;
    receiverId?: string;
    message: string;
    type?: 'TEXT' | 'IMAGE' | 'FILE';
    listingId?: string;
    // File fields
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    fileType?: string;
}

export interface ChatUser {
    userId: string;
    name: string;
    mobileNumber: string;
    email?: string;
    role: string;
    profileImage?: string;
    online: boolean;
    lastMessage?: string;
    lastMessageTime?: string;
    unreadCount: number;
    lastSeen?: string;
    conversationId?: string;
    hasConversation: boolean;
}

class ChatService {
    // --- REST APIs ---

    async getConversations(): Promise<Conversation[]> {
        const response = await api.get(MESSAGE_ENDPOINTS.CONVERSATIONS);
        return response.data?.data || [];
    }

    async getMessages(conversationId: string, page = 0, size = 50): Promise<ChatMessage[]> {
        const response = await api.get(MESSAGE_ENDPOINTS.MESSAGES, {
            params: { conversationId, page, size }
        });
        return response.data?.data || [];
    }

    async createConversation(receiverId: string): Promise<Conversation> {
        const response = await api.post(MESSAGE_ENDPOINTS.CREATE_CONVERSATION, { receiverId });
        return response.data?.data;
    }

    async sendMessage(request: SendMessageRequest): Promise<ChatMessage> {
        const response = await api.post(MESSAGE_ENDPOINTS.SEND, request);
        return response.data?.data;
    }

    async markAsRead(conversationId: string): Promise<void> {
        await api.post(MESSAGE_ENDPOINTS.MARK_READ, { conversationId });
    }

    async getUnreadCount(): Promise<number> {
        const response = await api.get(MESSAGE_ENDPOINTS.UNREAD_COUNT);
        return response.data?.data || 0;
    }

    async getOnlineUsers(): Promise<Record<string, boolean>> {
        const response = await api.get(MESSAGE_ENDPOINTS.PRESENCE);
        return response.data?.data || {};
    }

    // --- User Directory APIs ---

    async getChatUsers(page = 0, size = 30): Promise<ChatUser[]> {
        const response = await api.get(`${MESSAGE_ENDPOINTS.BASE}/users`, {
            params: { page, size }
        });
        return response.data?.data || [];
    }

    async searchChatUsers(query: string, page = 0, size = 30): Promise<ChatUser[]> {
        const response = await api.get(`${MESSAGE_ENDPOINTS.BASE}/users/search`, {
            params: { query, page, size }
        });
        return response.data?.data || [];
    }

    async filterChatUsersByRole(role: string, page = 0, size = 30): Promise<ChatUser[]> {
        const response = await api.get(`${MESSAGE_ENDPOINTS.BASE}/users/filter`, {
            params: { role, page, size }
        });
        return response.data?.data || [];
    }

    // --- File Upload API ---

    async uploadFile(file: File, conversationId: string): Promise<{
        fileUrl: string;
        fileName: string;
        fileSize: number;
        fileType: string;
    }> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('conversationId', conversationId);

        const response = await api.post(`${MESSAGE_ENDPOINTS.BASE}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        return response.data?.data;
    }

    async getConversationDetails(id: string): Promise<Conversation> {
        const response = await api.get(MESSAGE_ENDPOINTS.CONVERSATION(id));
        return response.data?.data;
    }

    // --- WebSocket Logic ---

    connectWebSocket(
        token: string,
        userMobile: string,
        onMessage: (topic: string, data: any) => void
    ): Client {
        const socket = new SockJS(`${WS_URL}`); // Ensure WS_URL is correct in config

        const client = new Client({
            webSocketFactory: () => socket,
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,

            onConnect: () => {
                // Subscribe to personal queue
                client.subscribe(`/user/${userMobile}/queue/messages`, (message: IMessage) => {
                    const data = JSON.parse(message.body);
                    onMessage('MESSAGE', data);
                });

                client.subscribe(`/user/${userMobile}/queue/typing`, (message: IMessage) => {
                    const data = JSON.parse(message.body);
                    onMessage('TYPING', data);
                });

                client.subscribe(`/user/${userMobile}/queue/status`, (message: IMessage) => {
                    const data = JSON.parse(message.body);
                    onMessage('STATUS', data);
                });

                // Global presence
                client.subscribe('/topic/presence', (message: IMessage) => {
                    const data = JSON.parse(message.body);
                    onMessage('PRESENCE', data);
                });
            },

            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            }
        });

        client.activate();
        return client;
    }

    sendWebSocketMessage(client: Client | null, request: SendMessageRequest) {
        if (client && client.connected) {
            client.publish({
                destination: '/app/chat.sendMessage',
                body: JSON.stringify(request),
            });
        }
    }

    sendTyping(client: Client | null, receiverId: string) {
        if (client && client.connected) {
            client.publish({
                destination: '/app/chat.typing',
                body: JSON.stringify({ receiverId }),
            });
        }
    }

    sendSeenEvent(client: Client | null, conversationId: string) {
        if (client && client.connected) {
            client.publish({
                destination: '/app/chat.seen',
                body: JSON.stringify({ conversationId }),
            });
        }
    }
}

export const chatService = new ChatService();
