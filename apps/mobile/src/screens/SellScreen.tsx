import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { createListing, uploadListingImage } from '../services/marketplaceService';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { Camera, ChevronDown } from 'lucide-react-native';

export const SellScreen = () => {
    const navigation = useNavigation<any>();
    const [loading, setLoading] = useState(false);

    // Form State
    const [cropName, setCropName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [price, setPrice] = useState('');
    const [unit, setUnit] = useState('kg');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState<string | null>(null);

    const units = ['kg', 'quintal', 'ton', 'piece', 'dozen'];

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleCreate = async () => {
        if (!cropName || !quantity || !price || !location) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        setLoading(true);
        try {
            // 1. Create Listing
            const payload = {
                cropName,
                quantity: parseFloat(quantity),
                unit,
                pricePerUnit: parseFloat(price),
                location,
                description,
            };

            const response = await createListing(payload);
            const listingId = response.data?.id;

            // 2. Upload Image if selected
            if (image && listingId) {
                await uploadListingImage(listingId, image);
            }

            Alert.alert('Success', 'Listing created successfully');
            navigation.goBack();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to create listing');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>Sell Your Crops</Text>

            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                {image ? (
                    <Image source={{ uri: image }} style={styles.image} />
                ) : (
                    <View style={styles.placeholder}>
                        <Camera size={40} color="#888" />
                        <Text style={styles.placeholderText}>Tap to add photo</Text>
                    </View>
                )}
            </TouchableOpacity>

            <View style={styles.form}>
                <Text style={styles.label}>Crop Name *</Text>
                <TextInput style={styles.input} value={cropName} onChangeText={setCropName} placeholder="e.g. Potato" />

                <View style={styles.row}>
                    <View style={styles.flex1}>
                        <Text style={styles.label}>Quantity *</Text>
                        <TextInput
                            style={styles.input}
                            value={quantity}
                            onChangeText={setQuantity}
                            placeholder="0.0"
                            keyboardType="numeric"
                        />
                    </View>
                    <View style={styles.flex1}>
                        <Text style={styles.label}>Unit</Text>
                        <View style={styles.picker}>
                            {/* Simple Unit Selector for now */}
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {units.map(u => (
                                    <TouchableOpacity
                                        key={u}
                                        style={[styles.unitChip, unit === u && styles.activeChip]}
                                        onPress={() => setUnit(u)}
                                    >
                                        <Text style={[styles.chipText, unit === u && styles.activeChipText]}>{u}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                </View>

                <Text style={styles.label}>Price per {unit} (Rs.) *</Text>
                <TextInput
                    style={styles.input}
                    value={price}
                    onChangeText={setPrice}
                    placeholder="0.0"
                    keyboardType="numeric"
                />

                <Text style={styles.label}>Location *</Text>
                <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="District, City" />

                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Describe your produce..."
                    multiline
                    numberOfLines={4}
                />

                {loading ? (
                    <ActivityIndicator size="large" color="#16a34a" />
                ) : (
                    <TouchableOpacity style={styles.button} onPress={handleCreate}>
                        <Text style={styles.buttonText}>Publish Listing</Text>
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 16, backgroundColor: '#fff' },
    header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#16a34a' },
    imagePicker: { height: 200, backgroundColor: '#f0fdf4', borderRadius: 12, marginBottom: 20, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#ccc' },
    image: { width: '100%', height: '100%' },
    placeholder: { alignItems: 'center' },
    placeholderText: { marginTop: 10, color: '#888' },
    form: { gap: 16 },
    label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 4 },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#fafafa' },
    textArea: { height: 100, textAlignVertical: 'top' },
    row: { flexDirection: 'row', gap: 12 },
    flex1: { flex: 1 },
    button: { backgroundColor: '#16a34a', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    picker: { flexDirection: 'row', height: 50, alignItems: 'center' },
    unitChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#eee', marginRight: 8 },
    activeChip: { backgroundColor: '#16a34a' },
    chipText: { color: '#333', fontSize: 12 },
    activeChipText: { color: '#fff' }
});
