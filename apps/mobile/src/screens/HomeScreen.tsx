import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShoppingBasket, Sprout, TrendingUp, GraduationCap, Truck, Wallet, Bell, Menu } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const ActionButton = ({ icon: Icon, label, labelEn, color, onPress }: any) => (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
        <View style={[styles.iconContainer, { backgroundColor: color }]}>
            <Icon size={24} color="#fff" />
        </View>
        <Text style={styles.actionLabel}>{label}</Text>
        <Text style={styles.actionLabelEn}>{labelEn}</Text>
    </TouchableOpacity>
);

export const HomeScreen = () => {
    const navigation = useNavigation<any>();

    const actions = [
        { icon: ShoppingBasket, label: "बेच्नुहोस्", labelEn: "Sell Crops", color: "#16a34a", target: "Sell" },
        { icon: Sprout, label: "किन्नुहोस्", labelEn: "Buy Crops", color: "#2563eb", target: "Marketplace" },
        { icon: TrendingUp, label: "बजार मूल्य", labelEn: "Market Price", color: "#ca8a04", target: "MarketButtons" }, // Custom handling
        { icon: GraduationCap, label: "सिक्नुहोस्", labelEn: "Learn", color: "#9333ea", target: "Learn" },
        { icon: Truck, label: "ढुवानी", labelEn: "Transport", color: "#57534e", target: "Shipment" },
        { icon: Wallet, label: "वित्त", labelEn: "Finance", color: "#0891b2", target: "Finance" },
    ];

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>नमस्ते, किसान साथी 🙏</Text>
                    <Text style={styles.subtitle}>आज तपाई के गर्न चाहनुहुन्छ?</Text>
                </View>
                <View style={styles.headerIcons}>
                    <TouchableOpacity style={styles.iconBtn}><Bell size={24} color="#333" /></TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Hero Banner (Mock) */}
                <View style={styles.heroBanner}>
                    <Text style={styles.heroText}>आजको बजार भाउ हेर्नुहोस्</Text>
                    <Text style={styles.heroSubText}>कालीमाटी फलफूल तथा तरकारी बजार</Text>
                </View>

                {/* Quick Actions Grid */}
                <Text style={styles.sectionTitle}>छिटो पहुँच (Quick Actions)</Text>
                <View style={styles.grid}>
                    {actions.map((action, index) => (
                        <ActionButton
                            key={index}
                            icon={action.icon}
                            label={action.label}
                            labelEn={action.labelEn}
                            color={action.color}
                            onPress={() => {
                                if (action.target === "MarketButtons") {
                                    navigation.navigate("Prices");
                                } else if (action.target === "Marketplace") {
                                    navigation.navigate("MarketplaceTab");
                                } else {
                                    navigation.navigate(action.target);
                                }
                            }}
                        />
                    ))}
                </View>

                {/* Featured / Recent */}
                <Text style={styles.sectionTitle}>तपाईंको लागि सिफारिस</Text>
                <View style={styles.promoCard}>
                    <Text style={styles.promoTitle}>आधुनिक कृषि तालिम</Text>
                    <Text style={styles.promoDesc}>नयाँ प्रविधि सिक्नुहोस् र उब्जनी बढाउनुहोस्</Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' },
    greeting: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    subtitle: { fontSize: 14, color: '#666' },
    headerIcons: { flexDirection: 'row', gap: 15 },
    iconBtn: { padding: 5 },
    scrollContent: { padding: 20 },

    heroBanner: { backgroundColor: '#16a34a', padding: 20, borderRadius: 16, marginBottom: 24, alignItems: 'center' },
    heroText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    heroSubText: { color: '#dcfce7', fontSize: 14, marginTop: 4 },

    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#111', marginBottom: 12 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
    actionCard: { width: '30%', backgroundColor: '#fff', padding: 12, borderRadius: 12, alignItems: 'center', elevation: 2, flexGrow: 1 },
    iconContainer: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    actionLabel: { fontSize: 12, fontWeight: 'bold', color: '#333' },
    actionLabelEn: { fontSize: 10, color: '#666' },

    promoCard: { backgroundColor: '#e0f2fe', padding: 16, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#0ea5e9' },
    promoTitle: { fontSize: 16, fontWeight: 'bold', color: '#0369a1' },
    promoDesc: { fontSize: 12, color: '#0284c7', marginTop: 4 }
});
