import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getLoans, getPolicies, getAllSubsidies } from '../services/financeService';
import { useAuth } from '../context/AuthContext';
import { Landmark, Shield, Coins } from 'lucide-react-native';

export const FinanceScreen = () => {
    const { userData } = useAuth(); // Assuming userData has id if needed, but service uses context
    const [activeTab, setActiveTab] = useState('loans');
    const [loans, setLoans] = useState([]);
    const [policies, setPolicies] = useState([]);
    const [subsidies, setSubsidies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Fetch all data in parallel
            // Note: If endpoints don't exist yet, this might fail. 
            // We should handle that gracefully or mock if backend isn't ready.
            // For now, attempting to fetch.
            const [loanData, policyData, subsidyData] = await Promise.all([
                getLoans(''),
                getPolicies(''),
                getAllSubsidies()
            ]);
            setLoans(loanData);
            setPolicies(policyData);
            setSubsidies(subsidyData);
        } catch (error) {
            console.error("Finance load error", error);
            // Fallback to empty if api fails (e.g. 404)
        } finally {
            setLoading(false);
        }
    };

    const renderTabButton = (id: string, label: string, Icon: any) => (
        <TouchableOpacity
            style={[styles.tabBtn, activeTab === id && styles.activeTabBtn]}
            onPress={() => setActiveTab(id)}
        >
            <Icon size={20} color={activeTab === id ? '#16a34a' : '#666'} />
            <Text style={[styles.tabText, activeTab === id && styles.activeTabText]}>{label}</Text>
        </TouchableOpacity>
    );

    const renderLoans = () => (
        <View style={styles.section}>
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Apply for Loan</Text>
                <Text style={styles.cardDesc}>Get low-interest agricultural loans from our partner banks.</Text>
                <TouchableOpacity style={styles.primaryBtn}>
                    <Text style={styles.primaryBtnText}>Check Eligibility</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.headerTitle}>Your Loans</Text>
            {loans.length === 0 ? (
                <Text style={styles.emptyText}>No active loans</Text>
            ) : (
                loans.map((loan: any, index) => (
                    <View key={index} style={styles.itemCard}>
                        <View>
                            <Text style={styles.itemTitle}>{loan.purpose}</Text>
                            <Text style={styles.itemSub}>{loan.provider} • Rs. {loan.amount}</Text>
                        </View>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{loan.status}</Text>
                        </View>
                    </View>
                ))
            )}
        </View>
    );

    const renderInsurance = () => (
        <View style={styles.section}>
            <View style={[styles.card, { borderColor: '#bfdbfe' }]}>
                <Text style={styles.cardTitle}>Crop Insurance</Text>
                <Text style={styles.cardDesc}>Protect your crops against weather damage and pests.</Text>
                <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: '#2563eb' }]}>
                    <Text style={styles.primaryBtnText}>Get Quote</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.headerTitle}>Your Policies</Text>
            {policies.length === 0 ? (
                <Text style={styles.emptyText}>No active policies</Text>
            ) : (
                policies.map((policy: any, index) => (
                    <View key={index} style={styles.itemCard}>
                        <View>
                            <Text style={styles.itemTitle}>{policy.cropName} Insurance</Text>
                            <Text style={styles.itemSub}>Cover: Rs. {policy.coverageAmount}</Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: '#dcfce7' }]}>
                            <Text style={[styles.badgeText, { color: '#166534' }]}>{policy.status}</Text>
                        </View>
                    </View>
                ))
            )}
        </View>
    );

    const renderSubsidies = () => (
        <View style={styles.section}>
            {subsidies.map((subsidy: any, index) => (
                <View key={index} style={styles.subsidyCard}>
                    <View style={styles.rowBetween}>
                        <Text style={styles.govText}>{subsidy.govtBody}</Text>
                        <Text style={styles.amountText}>Rs. {subsidy.amount}</Text>
                    </View>
                    <Text style={styles.subsidyTitle}>{subsidy.title}</Text>
                    <Text style={styles.subsidyDesc}>{subsidy.description}</Text>
                    <Text style={styles.deadline}>Deadline: {new Date(subsidy.deadline).toLocaleDateString()}</Text>
                    <TouchableOpacity style={styles.outlineBtn}>
                        <Text style={styles.outlineBtnText}>View Details</Text>
                    </TouchableOpacity>
                </View>
            ))}
            {subsidies.length === 0 && <Text style={styles.emptyText}>No subsidies available currently.</Text>}
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.tabs}>
                {renderTabButton('loans', 'Loans', Landmark)}
                {renderTabButton('insurance', 'Insurance', Shield)}
                {renderTabButton('subsidies', 'Subsidies', Coins)}
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#16a34a" />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.content}>
                    {activeTab === 'loans' && renderLoans()}
                    {activeTab === 'insurance' && renderInsurance()}
                    {activeTab === 'subsidies' && renderSubsidies()}
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9f9' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    tabs: { flexDirection: 'row', backgroundColor: '#fff', elevation: 2 },
    tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent', flexDirection: 'row', justifyContent: 'center', gap: 6 },
    activeTabBtn: { borderBottomColor: '#16a34a' },
    tabText: { fontWeight: '600', color: '#666' },
    activeTabText: { color: '#16a34a' },
    content: { padding: 16 },
    section: { gap: 16 },
    card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#dcfce7', elevation: 1 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
    cardDesc: { color: '#666', marginBottom: 12 },
    primaryBtn: { backgroundColor: '#16a34a', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
    primaryBtnText: { color: '#fff', fontWeight: 'bold' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 12, marginBottom: 8 },
    itemCard: { backgroundColor: '#fff', padding: 12, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 1 },
    itemTitle: { fontSize: 16, fontWeight: '600' },
    itemSub: { color: '#666', fontSize: 12 },
    badge: { backgroundColor: '#fef9c3', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    badgeText: { fontSize: 10, fontWeight: 'bold', color: '#854d0e', textTransform: 'uppercase' },
    emptyText: { textAlign: 'center', color: '#999', marginTop: 20 },
    subsidyCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, elevation: 1, marginBottom: 12 },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    govText: { fontSize: 10, fontWeight: 'bold', color: '#16a34a', textTransform: 'uppercase' },
    amountText: { fontSize: 16, fontWeight: 'bold', color: '#15803d' },
    subsidyTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    subsidyDesc: { color: '#555', fontSize: 14, marginBottom: 8 },
    deadline: { fontSize: 12, color: '#ef4444', marginBottom: 12 },
    outlineBtn: { borderWidth: 1, borderColor: '#16a34a', paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
    outlineBtnText: { color: '#16a34a', fontWeight: 'bold' }
});
