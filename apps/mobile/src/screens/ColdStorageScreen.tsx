import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getColdStorages } from '../services/logisticsService';
import { Warehouse, MapPin, Phone } from 'lucide-react-native';

export const ColdStorageScreen = () => {
    const [storages, setStorages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStorages();
    }, []);

    const fetchStorages = async () => {
        try {
            const data = await getColdStorages();
            const items = data.content || data.data || [];
            setStorages(items);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.header}>
                <Warehouse size={20} color="#16a34a" />
                <Text style={styles.name}>{item.name}</Text>
            </View>
            <View style={styles.row}>
                <MapPin size={16} color="#666" />
                <Text style={styles.text}>{item.location}</Text>
            </View>
            <View style={styles.row}>
                <Text style={[styles.text, { fontWeight: 'bold' }]}>Capacity: {item.capacity} {item.unit || 'kg'}</Text>
            </View>
            {item.contactNumber && (
                <View style={styles.row}>
                    <Phone size={16} color="#666" />
                    <Text style={styles.text}>{item.contactNumber}</Text>
                </View>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color="#16a34a" /></View>
            ) : (
                <FlatList
                    data={storages}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={styles.emptyText}>No cold storages found.</Text>}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 16, gap: 16 },
    card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, elevation: 2 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    name: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
    text: { fontSize: 14, color: '#444' },
    emptyText: { textAlign: 'center', marginTop: 40, color: '#666' }
});
