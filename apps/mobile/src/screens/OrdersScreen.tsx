import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getOrders } from '../services/orderService';
import { useNavigation } from '@react-navigation/native';
import { Package, ChevronRight, Clock } from 'lucide-react-native';

export const OrdersScreen = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation<any>();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const data = await getOrders();
            // Adjust based on potential ApiResponse wrapper
            const items = Array.isArray(data) ? data : (data.data || data.content || []);
            setOrders(items);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.card} onPress={() => {/* TODO: Navigate to OrderDetail */ }}>
            <View style={styles.iconContainer}>
                <Package size={24} color="#16a34a" />
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.orderId}>Order #{item.id.substring(0, 8)}</Text>
                <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                <View style={styles.statusContainer}>
                    <Clock size={12} color="#666" />
                    <Text style={styles.status}>{item.status}</Text>
                </View>
            </View>
            <View style={styles.priceContainer}>
                <Text style={styles.price}>Rs. {item.totalAmount}</Text>
                <ChevronRight size={16} color="#ccc" />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Orders</Text>
            </View>
            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color="#16a34a" /></View>
            ) : (
                <FlatList
                    data={orders}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={styles.emptyText}>No orders found.</Text>}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 16, gap: 12 },
    card: { flexDirection: 'row', backgroundColor: '#fff', padding: 16, borderRadius: 12, alignItems: 'center', gap: 16 },
    iconContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#f0fdf4', justifyContent: 'center', alignItems: 'center' },
    cardContent: { flex: 1 },
    orderId: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    date: { fontSize: 12, color: '#888', marginTop: 2 },
    statusContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    status: { fontSize: 13, color: '#666', fontWeight: '500' },
    priceContainer: { alignItems: 'flex-end', justifyContent: 'center' },
    price: { fontSize: 16, fontWeight: 'bold', color: '#16a34a', marginBottom: 4 },
    emptyText: { textAlign: 'center', marginTop: 40, color: '#666' }
});
