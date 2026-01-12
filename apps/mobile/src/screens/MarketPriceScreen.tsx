import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
import { getTodaysPrices, getAvailableDistricts } from '../services/marketPriceService';
import { Filter } from 'lucide-react-native';

export const MarketPriceScreen = () => {
    const [prices, setPrices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [districts, setDistricts] = useState<string[]>([]);
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [showFilter, setShowFilter] = useState(false);

    useEffect(() => {
        loadData();
    }, [selectedDistrict]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [priceData, districtData] = await Promise.all([
                getTodaysPrices(0, 20, selectedDistrict),
                getAvailableDistricts()
            ]);

            const items = priceData.content || priceData.data || [];
            setPrices(items);
            if (districtData) setDistricts(districtData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const renderPrice = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.row}>
                <Text style={styles.crop}>{item.commodityCode || item.cropName}</Text>
                <Text style={styles.price}>Rs. {item.retailPrice}/{item.unit}</Text>
            </View>
            <View style={styles.subRow}>
                <Text style={styles.market}>{item.marketName}, {item.district}</Text>
                <Text style={styles.date}>{item.priceDate}</Text>
            </View>
            <View style={styles.wholesale}>
                <Text style={styles.wholesaleText}>Wholesale: Rs. {item.wholesalePrice}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Daily Market Prices</Text>
                <TouchableOpacity onPress={() => setShowFilter(true)} style={styles.filterBtn}>
                    <Filter size={20} color="#333" />
                </TouchableOpacity>
            </View>

            {selectedDistrict ? (
                <View style={styles.filterChip}>
                    <Text style={styles.filterText}>District: {selectedDistrict}</Text>
                    <TouchableOpacity onPress={() => setSelectedDistrict('')}>
                        <Text style={styles.closeFilter}>X</Text>
                    </TouchableOpacity>
                </View>
            ) : null}

            {loading ? (
                <ActivityIndicator size="large" color="#16a34a" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={prices}
                    renderItem={renderPrice}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={styles.empty}>No prices available for today.</Text>}
                />
            )}

            <Modal visible={showFilter} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select District</Text>
                        <FlatList
                            data={districts}
                            keyExtractor={item => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalItem}
                                    onPress={() => {
                                        setSelectedDistrict(item);
                                        setShowFilter(false);
                                    }}
                                >
                                    <Text style={styles.modalItemText}>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity style={styles.closeBtn} onPress={() => setShowFilter(false)}>
                            <Text style={styles.closeBtnText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', alignItems: 'center' },
    title: { fontSize: 20, fontWeight: 'bold' },
    filterBtn: { padding: 8, backgroundColor: '#eee', borderRadius: 8 },
    list: { padding: 16, gap: 12 },
    card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, elevation: 2 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    crop: { fontSize: 18, fontWeight: 'bold', color: '#16a34a' },
    price: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    subRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    market: { color: '#666', fontSize: 14 },
    date: { color: '#999', fontSize: 12 },
    wholesale: { paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    wholesaleText: { fontSize: 14, color: '#555' },
    empty: { textAlign: 'center', marginTop: 40, color: '#666' },
    filterChip: { flexDirection: 'row', margin: 16, marginTop: 0, backgroundColor: '#e0f2fe', padding: 8, borderRadius: 8, alignSelf: 'flex-start', alignItems: 'center', gap: 8 },
    filterText: { color: '#0369a1' },
    closeFilter: { fontWeight: 'bold', color: '#0369a1' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#fff', borderRadius: 12, maxHeight: '80%', padding: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
    modalItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
    modalItemText: { fontSize: 16 },
    closeBtn: { marginTop: 16, alignItems: 'center', padding: 12, backgroundColor: '#eee', borderRadius: 8 },
    closeBtnText: { fontWeight: 'bold' }
});
