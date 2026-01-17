import { useState, useEffect, useCallback, useRef } from 'react';
import { chatService, ChatMessage, Conversation, SendMessageRequest } from '../services/chatService';
import { useAuth } from '../../../modules/auth/context/AuthContext';
import { Client } from '@stomp/stompjs';

export const useChat = (initialConversationId?: string) => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [totalUnread, setTotalUnread] = useState(0);
    const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
    const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({});
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const stompClientRef = useRef<Client | null>(null);

    // Fetch conversations
    const fetchConversations = useCallback(async () => {
        try {
            const data = await chatService.getConversations();
            setConversations(data);
            const unread = data.reduce((sum, c) => sum + c.unreadCount, 0);
            setTotalUnread(unread);
        } catch (error) {
        } finally {
            setIsLoadingConversations(false);
        }
    }, []);

    // Fetch messages for a conversation
    const fetchMessages = useCallback(async (conversationId: string) => {
        setIsLoadingMessages(true);
        setPage(0);
        setHasMore(true);
        try {
            await chatService.markAsRead(conversationId);
            const msgs = await chatService.getMessages(conversationId, 0, 50);
            setMessages(msgs.reverse());
            setHasMore(msgs.length >= 50);

            setConversations(prev => prev.map(c =>
                c.id === conversationId ? { ...c, unreadCount: 0 } : c
            ));
        } catch (error) {
        } finally {
            setIsLoadingMessages(false);
        }
    }, []);

    const loadMoreMessages = useCallback(async () => {
        if (!activeConversation || !hasMore || isLoadingMessages) return;

        const nextPage = page + 1;
        setIsLoadingMessages(true);
        try {
            const moreMsgs = await chatService.getMessages(activeConversation.id, nextPage, 50);
            if (moreMsgs.length < 50) setHasMore(false);

            // moreMsgs are older (descending), so if we want to prepend them:
            // But wait, existing logic uses reverse().
            // getMessages returns DESC (newest first).
            // reversed -> (oldest first).
            // So moreMsgs (older block) need to be reversed and PREPENDED.
            setMessages(prev => [...moreMsgs.reverse(), ...prev]);
            setPage(nextPage);
        } catch (error) {
        } finally {
            setIsLoadingMessages(false);
        }
    }, [activeConversation, page, hasMore, isLoadingMessages]);

    // Initialize WebSocket
    useEffect(() => {
        if (!user?.mobileNumber) return;

        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const client = chatService.connectWebSocket(token, user.mobileNumber, (topic, data) => {
            if (topic === 'MESSAGE') {
                // Map Backend DTO to Frontend Interface
                const newMessage: ChatMessage = {
                    ...data,
                    senderId: data.sender?.id || data.senderId,
                    receiverId: data.receiver?.id || data.receiverId,
                    conversationId: data.conversationId // Now available from backend
                };

                // Update conversations list
                setConversations(prev => {
                    const exists = prev.find(c => c.id === newMessage.conversationId);
                    if (exists) {
                        return prev.map(c => c.id === newMessage.conversationId ? {
                            ...c,
                            lastMessage: newMessage.message,
                            lastMessageTime: newMessage.createdAt,
                            unreadCount: c.id === newMessage.conversationId && newMessage.senderId !== user.id ? c.unreadCount + 1 : c.unreadCount
                        } : c).sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
                    } else {
                        // New conversation, refresh list
                        fetchConversations();
                        return prev;
                    }
                });

                // Update messages if this conversation is active
                setActiveConversation(current => {
                    if (current && current.id === newMessage.conversationId) {
                        setMessages(prev => {
                            // Check if this is replacing an optimistic message
                            const hasOptimistic = prev.some(m => m.id.startsWith('temp-') && m.message === newMessage.message);

                            if (hasOptimistic) {
                                // Replace optimistic message with real one
                                return prev.map(m =>
                                    m.id.startsWith('temp-') && m.message === newMessage.message
                                        ? newMessage
                                        : m
                                );
                            } else {
                                // Check for duplicate
                                const exists = prev.some(m => m.id === newMessage.id);
                                if (exists) {
                                    // Update existing message (status update)
                                    return prev.map(m => m.id === newMessage.id ? newMessage : m);
                                } else {
                                    // Add new message
                                    return [...prev, newMessage];
                                }
                            }
                        });

                        // If chat is open and message is from other user, mark as SEEN
                        if (document.visibilityState === 'visible' && newMessage.senderId !== user.id) {
                            chatService.sendSeenEvent(stompClientRef.current, current.id);
                        }
                    }
                    return current;
                });
            } else if (topic === 'TYPING') {
                const { userId, isTyping } = data;
                setTypingUsers(prev => ({ ...prev, [userId]: isTyping }));
                setTimeout(() => setTypingUsers(prev => ({ ...prev, [userId]: false })), 3000);
            } else if (topic === 'STATUS') {
                // Update message status
                if (data.type === 'STATUS_UPDATE') {
                    setMessages(prev => prev.map(m =>
                        m.id === data.messageId ? { ...m, status: data.status } : m
                    ));
                } else if (data.type === 'ALL_DELIVERED') {
                    // Mark all my messages to this receiver as DELIVERED
                    setMessages(prev => prev.map(m =>
                        (m.receiverId === data.receiverId && m.status === 'SENT')
                            ? { ...m, status: 'DELIVERED' }
                            : m
                    ));
                } else if (data.type === 'ALL_READ') {
                    // Mark all my messages in that conversation as SEEN
                    setMessages(prev => prev.map(m =>
                        (m.conversationId === data.conversationId && m.senderId !== data.readByUserId) ? { ...m, status: 'SEEN' } : m
                    ));
                }
            } else if (topic === 'PRESENCE') {
                setOnlineUsers(data);
            }
        });

        stompClientRef.current = client;
        fetchConversations();
        chatService.getOnlineUsers().then(setOnlineUsers);

        return () => {
            if (client) client.deactivate();
        };
    }, [user]); // Removed fetchConversations from dep to avoid any risk, though useCallback makes it safe.

    // Select Conversation
    const selectConversation = useCallback(async (conversation: Conversation) => {
        setActiveConversation(conversation);
        await fetchMessages(conversation.id);
        // Mark as seen immediately
        chatService.sendSeenEvent(stompClientRef.current, conversation.id);
    }, [fetchMessages]);

    // Send Message
    const sendMessage = useCallback(async (
        text: string,
        type: 'TEXT' | 'IMAGE' | 'FILE' = 'TEXT',
        fileDetails?: { fileUrl: string; fileName: string; fileSize: number; fileType: string }
    ) => {
        if (!activeConversation || !user) return;

        // Create optimistic message
        const optimisticMessage: ChatMessage = {
            id: `temp-${Date.now()}`,
            conversationId: activeConversation.id,
            senderId: user.id,
            message: text,
            type: type,
            isRead: false,
            status: 'SENT',
            createdAt: new Date().toISOString(),
            ...(fileDetails || {})
        };

        // Optimistically add to messages
        setMessages(prev => [...prev, optimisticMessage]);

        // Optimistically update conversation list
        setConversations(prev => prev.map(c =>
            c.id === activeConversation.id
                ? { ...c, lastMessage: text, lastMessageTime: optimisticMessage.createdAt }
                : c
        ).sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()));

        // Send via WebSocket
        const request: SendMessageRequest = {
            conversationId: activeConversation.id,
            message: text,
            type: type,
            ...(fileDetails || {})
        };

        try {
            chatService.sendWebSocketMessage(stompClientRef.current, request);
        } catch (error) {
            // Remove optimistic message on error
            setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
        }
    }, [activeConversation, user]);

    const sendTyping = useCallback(() => {
        if (activeConversation) {
            chatService.sendTyping(stompClientRef.current, activeConversation.userId);
        }
    }, [activeConversation]);

    const startConversation = useCallback(async (userId: string) => {
        setIsLoadingMessages(true);
        try {
            const existing = conversations.find(c => c.userId === userId);
            if (existing) {
                setActiveConversation(existing);
                await fetchMessages(existing.id);
            } else {
                const newConv = await chatService.createConversation(userId);
                setConversations(prev => [newConv, ...prev]);
                setActiveConversation(newConv);
                setMessages([]);
            }
        } catch (error) {
        } finally {
            setIsLoadingMessages(false);
        }
    }, [conversations, fetchMessages]);

    return {
        conversations,
        activeConversation,
        messages,
        selectConversation,
        startConversation,
        sendMessage,
        sendTyping,
        isLoadingConversations,
        isLoadingMessages,
        loadMoreMessages,
        hasMore,
        totalUnread,
        onlineUsers,
        typingUsers
    };
};
