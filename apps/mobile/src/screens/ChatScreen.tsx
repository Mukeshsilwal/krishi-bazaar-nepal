import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { getMessages, sendMessage, markAsRead } from '../services/messagingService';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Send } from 'lucide-react-native';

export const ChatScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { userId, userName } = route.params;
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [inputText, setInputText] = useState('');
    const [sending, setSending] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        navigation.setOptions({ title: userName });
        loadMessages();
        const interval = setInterval(loadMessages, 5000); // Polling for new messages
        return () => clearInterval(interval);
    }, [userId]);

    const loadMessages = async () => {
        try {
            const data = await getMessages(userId);
            const items = data.data || data || [];
            // Assuming backend returns sorted by date, but just in case
            setMessages(items);
            if (loading) setLoading(false);

            // Mark as read
            await markAsRead(userId);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSend = async () => {
        if (!inputText.trim()) return;
        setSending(true);
        try {
            await sendMessage(userId, inputText);
            setInputText('');
            loadMessages(); // Refresh immediately
        } catch (error) {
            console.error(error);
        } finally {
            setSending(false);
        }
    };

    const renderMessage = ({ item }: { item: any }) => {
        const isMe = item.senderId !== userId; // logic depends on how backend returns "me" or if we compare IDs
        // Actually, backend usually doesn't return "isMe". We need to check senderId against currentUserId. 
        // For simplicity, assuming outgoing messages have a flag or we inferred it.
        // Let's assume item.type === 'SENT' vs 'RECEIVED' or check ID.
        // Since I don't have current User ID easily here without context, I will assume 
        // if senderId matches the chat partner (userId), it's received.
        const isReceived = item.senderId === userId;

        return (
            <View style={[styles.bubbleContainer, isReceived ? styles.leftContainer : styles.rightContainer]}>
                <View style={[styles.bubble, isReceived ? styles.leftBubble : styles.rightBubble]}>
                    <Text style={[styles.messageText, isReceived ? styles.leftText : styles.rightText]}>{item.content}</Text>
                    <Text style={[styles.timeText, isReceived ? styles.leftTime : styles.rightTime]}>
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={90}
        >
            {loading ? (
                <ActivityIndicator size="large" color="#16a34a" style={styles.center} />
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                />
            )}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Type a message..."
                    multiline
                />
                <TouchableOpacity onPress={handleSend} disabled={sending || !inputText.trim()} style={styles.sendBtn}>
                    {sending ? <ActivityIndicator color="#fff" size="small" /> : <Send size={20} color="#fff" />}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f2f2f2' },
    center: { flex: 1, justifyContent: 'center' },
    list: { padding: 16 },
    bubbleContainer: { marginBottom: 12, flexDirection: 'row' },
    leftContainer: { justifyContent: 'flex-start' },
    rightContainer: { justifyContent: 'flex-end' },
    bubble: { maxWidth: '80%', padding: 12, borderRadius: 16 },
    leftBubble: { backgroundColor: '#fff', borderTopLeftRadius: 0 },
    rightBubble: { backgroundColor: '#16a34a', borderTopRightRadius: 0 },
    messageText: { fontSize: 16 },
    leftText: { color: '#333' },
    rightText: { color: '#fff' },
    timeText: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
    leftTime: { color: '#999' },
    rightTime: { color: '#ccfbf1' },
    inputContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#fff', alignItems: 'center' },
    input: { flex: 1, backgroundColor: '#f9f9f9', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, maxHeight: 100, fontSize: 16 },
    sendBtn: { marginLeft: 10, width: 44, height: 44, borderRadius: 22, backgroundColor: '#16a34a', justifyContent: 'center', alignItems: 'center' }
});
