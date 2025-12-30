import api from './api';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const messageService = {
    // Send message via REST
    sendMessage: async (messageData) => {
        const response = await api.post('/messages', messageData);
        return response.data;
    },

    // Get conversations list
    getConversations: async () => {
        const response = await api.get('/messages/conversations');
        return response.data;
    },

    // Get conversation with specific user
    getConversation: async (userId) => {
        const response = await api.get(`/messages/${userId}`);
        return response.data;
    },

    // Get unread message count
    getUnreadCount: async () => {
        const response = await api.get('/messages/unread/count');
        return response.data;
    },

    // Mark messages as read
    markAsRead: async (userId) => {
        const response = await api.put(`/messages/${userId}/read`);
        return response.data;
    },

    // WebSocket connection
    connectWebSocket: (onMessageReceived) => {
        const token = localStorage.getItem('accessToken');
        const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:8089';
        const socket = new SockJS(`${wsUrl}/ws`);

        const stompClient = new Client({
            webSocketFactory: () => socket,
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            debug: (str) => {
                console.log('STOMP: ' + str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        stompClient.onConnect = (frame) => {
            console.log('Connected: ' + frame);

            // Subscribe to personal message queue
            const user = JSON.parse(localStorage.getItem('user'));
            if (user) {
                stompClient.subscribe(`/user/${user.mobileNumber}/queue/messages`, (message) => {
                    const receivedMessage = JSON.parse(message.body);
                    if (onMessageReceived) {
                        onMessageReceived(receivedMessage);
                    }
                });
            }
        };

        stompClient.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };

        stompClient.activate();

        return stompClient;
    },

    // Send message via WebSocket
    sendMessageViaWebSocket: (stompClient, messageData) => {
        if (stompClient && stompClient.connected) {
            stompClient.publish({
                destination: '/app/chat.send',
                body: JSON.stringify(messageData),
            });
        }
    },

    // Disconnect WebSocket
    disconnectWebSocket: (stompClient) => {
        if (stompClient) {
            stompClient.deactivate();
        }
    },
};

export default messageService;
