import { useEffect, useState } from 'react';
import { requestForToken, onMessageListener } from '../config/firebase';
import notificationService from '../services/notificationService';

export const usePushNotifications = () => {
    const [token, setToken] = useState<string | null>(null);
    const [notification, setNotification] = useState<any>(null);

    useEffect(() => {
        const initializePushNotifications = async () => {
            try {
                // Request permission and get token
                const fcmToken = await requestForToken();
                if (fcmToken) {
                    setToken(fcmToken);

                    // Register token with backend
                    try {
                        await notificationService.registerDeviceToken(fcmToken);
                        // console.debug('Device token registered with backend');
                    } catch (err) {
                        // console.error('Failed to register device token:', err);
                    }
                }
            } catch (err) {
                // console.error('Error initializing push notifications:', err);
            }
        };

        if ('Notification' in window) {
            initializePushNotifications();
        }

        const setupMessageListener = async () => {
            try {
                const payload = await onMessageListener();
                setNotification(payload);
                // console.debug('New foreground message:', payload);
            } catch (err) {
                // console.error('Error seting up message listener:', err);
            }
        };

        setupMessageListener();
    }, []);

    return { token, notification };
};
