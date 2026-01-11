import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getNotifications, markNotificationRead } from '../services/notificationService';
import { Bell } from 'lucide-react-native';

export const NotificationScreen = () => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await getNotifications();
            const items = data.data || data || [];
            setNotifications(items);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePress = async (item: any) => {
        if (!item.read) {
            await markNotificationRead(item.id);
            // Optimistic update
            setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n));
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.card, !item.read && styles.unreadCard]}
            onPress={() => handlePress(item)}
        >
            <View style={styles.iconContainer}>
                <Bell size={24} color={item.read ? '#999' : '#16a34a'} />
            </View>
            <View style={styles.content}>
                <Text style={[styles.title, !item.read && styles.unreadTitle]}>{item.title}</Text>
                <Text style={styles.message}>{item.message}</Text>
                <Text style={styles.time}>{new Date(item.createdAt).toLocaleString()}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#16a34a" style={styles.center} />
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Text style={styles.empty}>No notifications</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 16, gap: 12 },
    card: { flexDirection: 'row', backgroundColor: '#fff', padding: 16, borderRadius: 12, alignItems: 'center', gap: 16, elevation: 1 },
    unreadCard: { backgroundColor: '#f0fdf4', borderLeftWidth: 4, borderLeftColor: '#16a34a' },
    iconContainer: { width: 40, alignItems: 'center' },
    content: { flex: 1 },
    title: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 },
    unreadTitle: { fontWeight: 'bold', color: '#000' },
    message: { fontSize: 14, color: '#666', marginBottom: 6 },
    time: { fontSize: 12, color: '#999' },
    empty: { color: '#999', marginTop: 20 }
});
