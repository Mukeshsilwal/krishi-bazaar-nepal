import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { getConversations } from '../services/messagingService';
import { useNavigation } from '@react-navigation/native';
import { MessageCircle } from 'lucide-react-native';

export const ChatListScreen = () => {
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation<any>();

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', loadConversations);
        return unsubscribe;
    }, [navigation]);

    const loadConversations = async () => {
        setLoading(true);
        try {
            const data = await getConversations();
            const items = data.data || data || [];
            setConversations(items);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Chat', { userId: item.userId, userName: item.userName })}
        >
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.userName?.charAt(0) || 'U'}</Text>
            </View>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.name}>{item.userName || 'Unknown User'}</Text>
                    <Text style={styles.time}>{item.lastMessageTime ? new Date(item.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</Text>
                </View>
                <View style={styles.footer}>
                    <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage || 'Start a conversation'}</Text>
                    {item.unreadCount > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{item.unreadCount}</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#16a34a" style={styles.center} />
            ) : (
                <FlatList
                    data={conversations}
                    renderItem={renderItem}
                    keyExtractor={item => item.userId}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <MessageCircle size={48} color="#ddd" />
                            <Text style={styles.empty}>No conversations yet</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 0 },
    card: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', alignItems: 'center' },
    avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#e0f2fe', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    avatarText: { fontSize: 20, fontWeight: 'bold', color: '#0284c7' },
    content: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    time: { fontSize: 12, color: '#999' },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    lastMessage: { fontSize: 14, color: '#666', flex: 1, marginRight: 8 },
    badge: { backgroundColor: '#16a34a', borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 },
    badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    empty: { marginTop: 12, color: '#999', fontSize: 16 }
});
