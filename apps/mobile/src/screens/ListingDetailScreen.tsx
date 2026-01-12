import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { MapPin, Star, Calendar, User, Truck, ShieldCheck } from 'lucide-react-native';
import { getListingDetail, createOrder, Listing } from '../services/marketplaceService';

type RootStackParamList = {
    ListingDetail: { id: string };
};

type ListingDetailRouteProp = RouteProp<RootStackParamList, 'ListingDetail'>;

export const ListingDetailScreen = () => {
    const route = useRoute<ListingDetailRouteProp>();
    const navigation = useNavigation();
    const { id } = route.params;

    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState('1');
    const [address, setAddress] = useState('');
    const [ordering, setOrdering] = useState(false);

    useEffect(() => {
        fetchDetail();
    }, [id]);

    const fetchDetail = async () => {
        try {
            const data = await getListingDetail(id);
            setListing(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load listing details');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handleOrder = async () => {
        if (!address) {
            Alert.alert('Required', 'Please enter shipping address');
            return;
        }
        setOrdering(true);
        try {
            await createOrder(id, Number(quantity), address);
            Alert.alert('Success', 'Order placed successfully!');
            navigation.goBack();
        } catch (error: any) {
            Alert.alert('Order Failed', error.response?.data?.message || 'Could not place order');
        } finally {
            setOrdering(false);
        }
    };

    if (loading) {
        return <View style={styles.center}><ActivityIndicator size="large" color="#16a34a" /></View>;
    }

    if (!listing) return null;

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Image
                    source={{ uri: listing.images?.[0] || 'https://via.placeholder.com/400' }}
                    style={styles.image}
                />

                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{listing.cropName}</Text>
                        <View style={styles.priceTag}>
                            <Text style={styles.price}>Rs. {listing.price}</Text>
                            <Text style={styles.unit}>/{listing.unit}</Text>
                        </View>
                    </View>

                    <View style={styles.farmerRow}>
                        <User size={16} color="#666" />
                        <Text style={styles.farmerName}>{listing.farmerName}</Text>
                        <View style={styles.verifiedBadge}>
                            <ShieldCheck size={12} color="#16a34a" />
                            <Text style={styles.verifiedText}>Verified Farmer</Text>
                        </View>
                    </View>

                    <View style={styles.metaGrid}>
                        <View style={styles.metaItem}>
                            <MapPin size={16} color="#666" />
                            <Text style={styles.metaText}>{listing.location}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Truck size={16} color="#666" />
                            <Text style={styles.metaText}>Available: {listing.quantity} {listing.unit}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Calendar size={16} color="#666" />
                            <Text style={styles.metaText}>Posted: {new Date(listing.createdAt).toLocaleDateString()}</Text>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.description}>{listing.description || 'No description provided.'}</Text>

                    <View style={styles.orderSection}>
                        <Text style={styles.sectionTitle}>Place Order</Text>

                        <Text style={styles.label}>Quantity ({listing.unit})</Text>
                        <TextInput
                            style={styles.input}
                            value={quantity}
                            onChangeText={setQuantity}
                            keyboardType="numeric"
                        />

                        <Text style={styles.label}>Shipping Address</Text>
                        <TextInput
                            style={styles.input}
                            value={address}
                            onChangeText={setAddress}
                            placeholder="Enter delivery location"
                        />
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <View>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalPrice}>Rs. {Number(listing.price) * Number(quantity)}</Text>
                </View>
                <TouchableOpacity
                    style={styles.orderButton}
                    onPress={handleOrder}
                    disabled={ordering}
                >
                    {ordering ? <ActivityIndicator color="#fff" /> : <Text style={styles.orderButtonText}>Confirm Order</Text>}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { paddingBottom: 80 },
    image: { width: '100%', height: 250, resizeMode: 'cover' },
    content: { padding: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
    title: { fontSize: 24, fontWeight: 'bold', flex: 1, color: '#111' },
    priceTag: { alignItems: 'flex-end' },
    price: { fontSize: 20, fontWeight: 'bold', color: '#16a34a' },
    unit: { fontSize: 14, color: '#666' },
    farmerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
    farmerName: { fontSize: 16, color: '#444' },
    verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    verifiedText: { fontSize: 12, color: '#166534', fontWeight: 'bold' },
    metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 24, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    metaText: { fontSize: 14, color: '#666' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#333' },
    description: { fontSize: 15, lineHeight: 24, color: '#555', marginBottom: 30 },
    orderSection: { backgroundColor: '#f9f9f9', padding: 16, borderRadius: 12 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#444' },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f0f0f0', elevation: 10 },
    totalLabel: { fontSize: 12, color: '#666' },
    totalPrice: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    orderButton: { backgroundColor: '#16a34a', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 8 },
    orderButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
