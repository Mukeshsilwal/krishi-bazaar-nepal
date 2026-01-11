import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { getArticleDetail } from '../services/advisoryService';

type RootStackParamList = {
    ArticleDetail: { id: string };
};

type ArticleDetailRouteProp = RouteProp<RootStackParamList, 'ArticleDetail'>;

export const ArticleDetailScreen = () => {
    const route = useRoute<ArticleDetailRouteProp>();
    const { id } = route.params;
    const [article, setArticle] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDetail();
    }, [id]);

    const fetchDetail = async () => {
        try {
            const data = await getArticleDetail(id);
            setArticle(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#16a34a" /></View>;
    if (!article) return <View style={styles.center}><Text>Article not found</Text></View>;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Image
                source={{ uri: article.thumbnail || 'https://via.placeholder.com/400' }}
                style={styles.image}
            />
            <View style={styles.content}>
                <Text style={styles.title}>{article.title}</Text>
                <Text style={styles.meta}>Published on {new Date(article.createdAt).toLocaleDateString()}</Text>
                <Text style={styles.body}>{article.content}</Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { paddingBottom: 40, backgroundColor: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    image: { width: '100%', height: 200, resizeMode: 'cover' },
    content: { padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#111', marginBottom: 8 },
    meta: { fontSize: 12, color: '#666', marginBottom: 20 },
    body: { fontSize: 16, lineHeight: 26, color: '#333' }
});
