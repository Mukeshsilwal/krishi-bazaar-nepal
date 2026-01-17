import { useEffect } from 'react';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { toast } from 'sonner';

const PushNotificationManager = () => {
    const { notification } = usePushNotifications();

    useEffect(() => {
        if (notification) {
            toast.info(notification.notification.title || 'New Notification', {
                description: notification.notification.body,
                action: {
                    label: 'View',
                    onClick: () => {
                        // Handle notification click, e.g., navigate to notifications page
                        window.location.href = '/notifications';
                    }
                }
            });
        }
    }, [notification]);

    return null; // This component doesn't render anything
};

export default PushNotificationManager;
