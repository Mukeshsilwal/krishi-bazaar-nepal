import { useState, useEffect, useRef } from 'react';
import messageService from '../services/messageService';

export const useMessages = (userId = null) => {
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const stompClientRef = useRef(null);

    // Fetch conversations
    const fetchConversations = async () => {
        setLoading(true);
        try {
            const data = await messageService.getConversations();
            setConversations(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch messages for specific user
    const fetchMessages = async (targetUserId) => {
        setLoading(true);
        try {
            const data = await messageService.getConversation(targetUserId);
            setMessages(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch unread count
    const fetchUnreadCount = async () => {
        try {
            const count = await messageService.getUnreadCount();
            setUnreadCount(count);
        } catch (err) {
            console.error('Error fetching unread count:', err);
        }
    };

    // Send message
    const sendMessage = async (messageData) => {
        try {
            const sentMessage = await messageService.sendMessage(messageData);
            setMessages((prev) => [...prev, sentMessage]);
            return sentMessage;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Mark messages as read
    const markAsRead = async (targetUserId) => {
        try {
            await messageService.markAsRead(targetUserId);
            await fetchUnreadCount();
        } catch (err) {
            console.error('Error marking messages as read:', err);
        }
    };

    // Connect to WebSocket
    const connectWebSocket = () => {
        if (!stompClientRef.current) {
            stompClientRef.current = messageService.connectWebSocket((newMessage) => {
                setMessages((prev) => [...prev, newMessage]);
                fetchUnreadCount();
            });
        }
    };

    // Disconnect WebSocket
    const disconnectWebSocket = () => {
        if (stompClientRef.current) {
            messageService.disconnectWebSocket(stompClientRef.current);
            stompClientRef.current = null;
        }
    };

    // Initialize
    useEffect(() => {
        fetchConversations();
        fetchUnreadCount();
        connectWebSocket();

        return () => {
            disconnectWebSocket();
        };
    }, []);

    // Fetch messages when userId changes
    useEffect(() => {
        if (userId) {
            fetchMessages(userId);
            markAsRead(userId);
        }
    }, [userId]);

    return {
        conversations,
        messages,
        unreadCount,
        loading,
        error,
        sendMessage,
        markAsRead,
        refetchConversations: fetchConversations,
        refetchMessages: fetchMessages,
    };
};
