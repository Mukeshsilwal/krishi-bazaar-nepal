/**
 * Enhanced NotificationList - Grouped, color-coded notifications for rural users
 * Features: Today/Yesterday/Earlier grouping, large touch targets, visual priority
 */

import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/modules/auth/context/AuthContext';
import notificationService from '@/services/notificationService';
import { icons, priorityColors } from '@/constants/icons';
import { Bell } from 'lucide-react';
import { toast } from 'sonner';
import BottomNav from '@/components/navigation/BottomNav';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
    read: boolean;
    createdAt: string;
}

const NotificationList = () => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchNotifications();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            // TODO: Replace with actual API call
            // const data = await notificationService.getUserNotifications();
            // Mock data for demonstration
            const mockData: Notification[] = [
                {
                    id: '1',
                    title: t('weather.alert.critical'),
                    message: t('weather.action.drainWater'),
                    type: 'CRITICAL',
                    read: false,
                    createdAt: new Date().toISOString(),
                },
                {
                    id: '2',
                    title: t('home.advisory.title'),
                    message: 'New crop advisory available',
                    type: 'MEDIUM',
                    read: false,
                    createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
                },
            ];
            setNotifications(mockData);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            toast.error(t('error.network'));
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            // await notificationService.markAsRead(id);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, read: true } : n)
            );
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const groupNotifications = () => {
        const now = new Date();
        const today: Notification[] = [];
        const yesterday: Notification[] = [];
        const earlier: Notification[] = [];

        notifications.forEach(notification => {
            const createdDate = new Date(notification.createdAt);
            const diffDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDays === 0) {
                today.push(notification);
            } else if (diffDays === 1) {
                yesterday.push(notification);
            } else {
                earlier.push(notification);
            }
        });

        return { today, yesterday, earlier };
    };

    const getPriorityIcon = (type: string) => {
        switch (type) {
            case 'CRITICAL':
                return icons.status.error;
            case 'HIGH':
                return icons.status.warning;
            default:
                return icons.status.info;
        }
    };

    const getPriorityColor = (type: string) => {
        switch (type) {
            case 'CRITICAL':
                return priorityColors.critical;
            case 'HIGH':
                return priorityColors.high;
            case 'MEDIUM':
                return priorityColors.medium;
            default:
                return priorityColors.low;
        }
    };

    const { today, yesterday, earlier } = groupNotifications();

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-gradient-hero text-white px-4 py-6">
                <div className="flex items-center gap-3">
                    <Bell className="w-8 h-8" />
                    <h1 className="text-2xl font-bold">{t('notifications.title')}</h1>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                {loading ? (
                    <div className="space-y-4">
                        <div className="skeleton w-full h-24" />
                        <div className="skeleton w-full h-24" />
                        <div className="skeleton w-full h-24" />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl shadow-soft">
                        <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-large-readable text-gray-500">{t('notifications.empty')}</p>
                    </div>
                ) : (
                    <>
                        {/* Today */}
                        {today.length > 0 && (
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-3">{t('notifications.today')}</h2>
                                <div className="space-y-3">
                                    {today.map(notification => (
                                        <NotificationCard
                                            key={notification.id}
                                            notification={notification}
                                            onMarkRead={markAsRead}
                                            getPriorityIcon={getPriorityIcon}
                                            getPriorityColor={getPriorityColor}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Yesterday */}
                        {yesterday.length > 0 && (
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-3">{t('notifications.yesterday')}</h2>
                                <div className="space-y-3">
                                    {yesterday.map(notification => (
                                        <NotificationCard
                                            key={notification.id}
                                            notification={notification}
                                            onMarkRead={markAsRead}
                                            getPriorityIcon={getPriorityIcon}
                                            getPriorityColor={getPriorityColor}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Earlier */}
                        {earlier.length > 0 && (
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-3">{t('notifications.earlier')}</h2>
                                <div className="space-y-3">
                                    {earlier.map(notification => (
                                        <NotificationCard
                                            key={notification.id}
                                            notification={notification}
                                            onMarkRead={markAsRead}
                                            getPriorityIcon={getPriorityIcon}
                                            getPriorityColor={getPriorityColor}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <BottomNav />
        </div>
    );
};

interface NotificationCardProps {
    notification: Notification;
    onMarkRead: (id: string) => void;
    getPriorityIcon: (type: string) => any;
    getPriorityColor: (type: string) => any;
}

const NotificationCard = ({ notification, onMarkRead, getPriorityIcon, getPriorityColor }: NotificationCardProps) => {
    const [expanded, setExpanded] = useState(false);
    const Icon = getPriorityIcon(notification.type);
    const colors = getPriorityColor(notification.type);

    return (
        <div
            className={`bg-white rounded-xl border-2 ${colors.border} ${notification.read ? 'opacity-60' : ''} overflow-hidden shadow-soft transition-all`}
        >
            <button
                onClick={() => {
                    setExpanded(!expanded);
                    if (!notification.read) {
                        onMarkRead(notification.id);
                    }
                }}
                className="w-full p-5 text-left touch-target flex items-start gap-4"
            >
                <div className={`${colors.bg} p-3 rounded-full`}>
                    <Icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-large-readable text-gray-900 mb-1">{notification.title}</h3>
                    <p className={`text-readable text-gray-600 ${expanded ? '' : 'line-clamp-1'}`}>
                        {notification.message}
                    </p>
                </div>
                {!notification.read && (
                    <div className="w-3 h-3 bg-green-600 rounded-full flex-shrink-0 mt-2" />
                )}
            </button>
        </div>
    );
};

export default NotificationList;
