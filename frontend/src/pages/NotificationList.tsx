import React, { useState, useEffect } from 'react';
import notificationService from '../services/notificationService';
import { useAuth } from '../modules/auth/context/AuthContext';
import { Bell, Info, AlertTriangle, CheckCircle, Package } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const NotificationList = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) loadNotifications();
    }, [user]);

    const loadNotifications = async () => {
        try {
            const data = await notificationService.getNotifications(user.id);
            setNotifications(data);
        } catch (error) {
            console.error('Error loading notifications', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRead = async (id, isRead) => {
        if (!isRead) {
            try {
                await notificationService.markAsRead(id);
                setNotifications(notifications.map((n: any) =>
                    n.id === id ? { ...n, read: true } : n
                ));
            } catch (error) {
                console.error('Error marking as read', error);
            }
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'ORDER_UPDATE': return <Package className="w-5 h-5 text-blue-500" />;
            case 'PRICE_ALERT': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            case 'SYSTEM': return <Info className="w-5 h-5 text-gray-500" />;
            default: return <Bell className="w-5 h-5 text-green-500" />;
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-3xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Bell className="w-6 h-6 text-green-600" />
                    Notifications
                </h1>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 divide-y">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No notifications yet.
                        </div>
                    ) : (
                        notifications.map((n: any) => (
                            <div
                                key={n.id}
                                onClick={() => handleRead(n.id, n.read)}
                                className={`p-4 flex gap-4 cursor-pointer hover:bg-gray-50 transition-colors ${!n.read ? 'bg-green-50' : ''}`}
                            >
                                <div className="mt-1">{getIcon(n.type)}</div>
                                <div className="flex-1">
                                    <p className={`text-sm ${!n.read ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                                        {n.message}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {new Date(n.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                {!n.read && (
                                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default NotificationList;
