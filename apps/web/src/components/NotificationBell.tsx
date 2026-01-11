import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import notificationService from '../services/notificationService';
import { useAuth } from '../modules/auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (user) {
            loadCount();
            const interval = setInterval(loadCount, 60000); // Poll every minute
            return () => clearInterval(interval);
        }
    }, [user]);

    const loadCount = async () => {
        try {
            const count = await notificationService.getUnreadCount(user.id);
            setUnreadCount(count);
        } catch (error) {
            // Silently fail
        }
    };

    return (
        <button
            onClick={() => navigate('/notifications')}
            className="relative p-2 text-gray-600 hover:text-green-600 transition-colors"
        >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                    {unreadCount}
                </span>
            )}
        </button>
    );
};

export default NotificationBell;
