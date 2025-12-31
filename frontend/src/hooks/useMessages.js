import { useState, useEffect, useRef } from 'react';
import messageService from '../services/messageService';

export const useMessages = (userId = null) => {
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [onlineUsers, setOnlineUsers] = useState({}); // userMobile -> boolean
    const [typingUsers, setTypingUsers] = useState({}); // userId -> boolean
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const stompClientRef = useRef(null);
    const typingTimeoutRef = useRef({});

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

    // Fetch initial presence
    const fetchPresence = async () => {
        try {
            const data = await messageService.getOnlineUsers();
            if (data) {
                setOnlineUsers(data);
            }
        } catch (err) {
            console.error('Error fetching presence:', err);
        }
    };

    // Send message
    const sendMessage = async (messageData) => {
        // Using WebSocket if available for faster UX, else fallback to REST or use REST and let WS update UI
        // Current logic uses REST. We can keep it or switch to WS.
        // Let's stick to REST for persistence guarantee + WS for update.
        try {
            const sentMessage = await messageService.sendMessage(messageData);
            setMessages((prev) => [...prev, sentMessage]);
            return sentMessage;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Send Typing
    const sendTyping = (receiverId) => {
        messageService.sendTyping(stompClientRef.current, receiverId);
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

    // WebSocket Handler
    const handleWebSocketMessage = (type, payload) => {
        if (type === 'MESSAGE') {
            setMessages((prev) => [...prev, payload]);
            fetchUnreadCount();
            // Update last message in conversation list
            fetchConversations();
        } else if (type === 'PRESENCE') {
            setOnlineUsers(prev => ({ ...prev, [payload.userId]: payload.status === 'ONLINE' }));
        } else if (type === 'TYPING') {
            const { userId, isTyping } = payload;
            setTypingUsers(prev => ({ ...prev, [userId]: isTyping }));

            // Clear typing status after 3 seconds
            if (typingTimeoutRef.current[userId]) {
                clearTimeout(typingTimeoutRef.current[userId]);
            }
            typingTimeoutRef.current[userId] = setTimeout(() => {
                setTypingUsers(prev => ({ ...prev, [userId]: false }));
            }, 3000);
        } else if (type === 'READ') { // Handle Read Receipts
            const { userId } = payload; // userId is the person who read the messages (Receiver)
            // We need to mark all messages sent by ME to userId as read.
            // Or simpler: Just update all messages in the conversation with userId where senderId == ME
            setMessages(prevMessages => prevMessages.map(msg => {
                if (msg.receiverId === userId && !msg.isRead) { // Check logic carefully. If I sent it, receiverId is them.
                    return { ...msg, isRead: true };
                }
                return msg;
            }));
            // Also update conversation list if needed (e.g. if we show "Read" status in list)
        }
    };

    // Connect to WebSocket
    const connectWebSocket = () => {
        if (!stompClientRef.current) {
            stompClientRef.current = messageService.connectWebSocket(handleWebSocketMessage);
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
        fetchPresence();
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
        onlineUsers,
        typingUsers,
        loading,
        error,
        sendMessage,
        sendTyping,
        markAsRead,
        refetchConversations: fetchConversations,
        refetchMessages: fetchMessages,
    };
};
