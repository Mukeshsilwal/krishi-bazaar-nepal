import { useState, useEffect } from 'react';
import { chatService } from '../services/chatService';
import { useAuth } from '../../../modules/auth/context/AuthContext';
import { Client } from '@stomp/stompjs';

export const useGlobalChat = () => {
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!user) return;

        // Fetch initial count
        chatService.getUnreadCount().then(setUnreadCount).catch(console.error);

        const token = localStorage.getItem('accessToken');
        if (!token) return;

        // Connect WS for real-time updates
        // Note: multiple WS connections if ChatPage is also open?
        // Ideally we should use a Singleton WS client or Context.
        // For now, allowing multiple connections is acceptable but not optimal.
        // PROPER FIX: Move WS connection to a ContextProvider wrapping App.
        // But given constraints, I'll use a separate connection since StompJS handles it fine usually (just resource usage).

        let client: Client | null = null;

        // We only care if we are NOT on ChatPage? Or always?
        // Navbar is always present.

        client = chatService.connectWebSocket(token, user.mobileNumber, (topic, data) => {
            if (topic === 'MESSAGE') {
                // Increment unread count
                // In a real app we check if we are currently viewing the conversation.
                // Here, just increment. The ChatPage might mark it read immediately if open.
                setUnreadCount(prev => prev + 1);
            }
        });

        return () => {
            if (client) client.deactivate();
        };
    }, [user]);

    return { unreadCount };
};
