import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { MapPin, Star, Filter, Phone, MessageCircle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { getListings, Listing } from '../services/marketplaceService';

const categories = [
    { id: "all", label: "सबै", labelEn: "All" },
    { id: "vegetables", label: "तरकारी", labelEn: "Vegetables" },
    { id: "fruits", label: "फलफूल", labelEn: "Fruits" },
    { id: "grains", label: "अन्न", labelEn: "Grains" },
    { id: "dairy", label: "दुग्ध", labelEn: "Dairy" },
];

export const MarketplaceScreen = () => {
    const navigation = useNavigation<any>();
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchListings = async () => {
        try {
            const data = await getListings();
            // Assuming API returns { content: [...] } for pagination or just array
            // Adjust based on actual API response structure. 
            // If data.content exists, use that. Else assume data.data or data itself.
            const items = data.content || data.data || [];
            setListings(items);
        } catch (error) {
            console.error("Failed to fetch listings", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchListings();
    };

    const renderCategory = ({ item }: { item: typeof categories[0] }) => (
        <TouchableOpacity
            style={[
                styles.categoryChip,
                selectedCategory === item.id && styles.categoryChipActive
            ]}
            onPress={() => setSelectedCategory(item.id)}
        >
            <Text style={[
                styles.categoryText,
                selectedCategory === item.id && styles.categoryTextActive
            ]}>
                {item.label}
            </Text>
        </TouchableOpacity>
    );

    const renderListing = ({ item }: { item: Listing }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ListingDetail', { id: item.id })}
        >
            <View style={styles.cardHeader}>
                <Image
                    source={{ uri: item.images?.[0] || 'https://via.placeholder.com/100' }}
                    style={styles.image}
                />
                <View style={styles.cardContent}>
                    <View style={styles.headerRow}>
                        <View>
                            <Text style={styles.cropTitle}>{item.cropName}</Text>
                            <Text style={styles.cropSubtitle}>{item.variety}</Text>
                        </View>
                    </View>
                    <Text style={styles.farmerName}>{item.farmerName}</Text>
                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <MapPin size={12} color="#666" />
                            <Text style={styles.metaText}>{item.location}</Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <View>
                    <Text style={styles.price}>Rs. {item.price}<Text style={styles.unit}>/{item.unit}</Text></Text>
                    <Text style={styles.harvestInfo}>{item.quantity} available</Text>
                </View>
                <View style={styles.actions}>
                    <TouchableOpacity style={styles.orderButton} onPress={() => navigation.navigate('ListingDetail', { id: item.id })}>
                        <Text style={styles.orderButtonText}>Details</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Krishi Bazaar</Text>
            </View>

            <View style={styles.categoryContainer}>
                <FlatList
                    data={categories}
                    renderItem={renderCategory}
                    keyExtractor={item => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryList}
                />
                <TouchableOpacity style={styles.filterButton}>
                    <Filter size={16} color="#333" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#16a34a" />
                </View>
            ) : (
                <FlatList
                    data={listings}
                    renderItem={renderListing}
                    keyExtractor={item => item.id ? item.id.toString() : Math.random().toString()}
                    contentContainerStyle={styles.listContainer}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: '#666' }}>No listings found.</Text>}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#16a34a' },
    categoryContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingVertical: 8 },
    categoryList: { paddingHorizontal: 16, gap: 8 },
    categoryChip: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', marginRight: 8 },
    categoryChipActive: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
    categoryText: { fontSize: 14, color: '#333' },
    categoryTextActive: { color: '#fff' },
    filterButton: { padding: 8, marginRight: 16 },
    listContainer: { padding: 16, gap: 16 },
    card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
    cardHeader: { flexDirection: 'row', gap: 12 },
    image: { width: 80, height: 80, borderRadius: 8, backgroundColor: '#f0fdf4' },
    cardContent: { flex: 1 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    cropTitle: { fontSize: 16, fontWeight: 'bold', color: '#111' },
    cropSubtitle: { fontSize: 12, color: '#666' },
    farmerName: { fontSize: 13, color: '#444', marginTop: 4 },
    metaRow: { flexDirection: 'row', gap: 12, marginTop: 6 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontSize: 12, color: '#666' },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    price: { fontSize: 18, fontWeight: 'bold', color: '#16a34a' },
    unit: { fontSize: 12, color: '#666', fontWeight: 'normal' },
    harvestInfo: { fontSize: 11, color: '#888' },
    actions: { flexDirection: 'row', gap: 8 },
    orderButton: { backgroundColor: '#f0fdf4', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, justifyContent: 'center', borderWidth: 1, borderColor: '#16a34a' },
    orderButtonText: { color: '#16a34a', fontSize: 13, fontWeight: '600' }
});
