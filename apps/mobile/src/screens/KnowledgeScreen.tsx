import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getArticles } from '../services/advisoryService';
import { useNavigation } from '@react-navigation/native';

export const KnowledgeScreen = () => {
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation<any>();

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        try {
            const data = await getArticles();
            const items = data.content || data.data || [];
            setArticles(items);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.card}>
            <Image
                source={{ uri: item.thumbnail || 'https://via.placeholder.com/150' }}
                style={styles.image}
            />
            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.summary} numberOfLines={2}>{item.summary}</Text>
                <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Advisory & Knowledge</Text>
            </View>
            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color="#16a34a" /></View>
            ) : (
                <FlatList
                    data={articles}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={styles.emptyText}>No articles found.</Text>}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#16a34a' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 16, gap: 16 },
    card: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', elevation: 2 },
    image: { width: '100%', height: 150, resizeMode: 'cover' },
    content: { padding: 12 },
    title: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
    summary: { fontSize: 14, color: '#666', marginBottom: 8 },
    date: { fontSize: 12, color: '#999' },
    emptyText: { textAlign: 'center', marginTop: 40, color: '#666' }
});
