import React from 'react';
import notificationService from '../services/notificationService';
import { useAuth } from '../modules/auth/context/AuthContext';
import { Bell, Info, AlertTriangle, CheckCircle, Package, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

const NotificationList = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data: notifications = [], isLoading } = useQuery({
        queryKey: ['notifications', user?.id],
        queryFn: () => notificationService.getNotifications(user.id),
        enabled: !!user?.id,
        staleTime: 1000 * 30, // 30 seconds
    });

    const readMutation = useMutation({
        mutationFn: (id) => notificationService.markAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    const handleRead = (id, isRead) => {
        if (!isRead) {
            readMutation.mutate(id);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'ORDER_UPDATE': return <Package className="w-5 h-5 text-blue-500" />;
            case 'PRICE_ALERT': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            case 'DISEASE_ALERT': return <div className="p-1 bg-red-100 rounded-full"><AlertTriangle className="w-4 h-4 text-red-600" /></div>;
            case 'SYSTEM': return <Info className="w-5 h-5 text-gray-500" />;
            default: return <Bell className="w-5 h-5 text-green-500" />;
        }
    };

    if (isLoading) {
        return (
            <div className="bg-gray-50 min-h-full">
                <div className="max-w-3xl mx-auto px-4 py-8">
                    <div className="h-8 w-48 bg-gray-200 rounded mb-6 animate-pulse" />
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="bg-white p-4 rounded-lg shadow-sm flex gap-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-1/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-full">
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
        </div>
    );
};

export default NotificationList;
