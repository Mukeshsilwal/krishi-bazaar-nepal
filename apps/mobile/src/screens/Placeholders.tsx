import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Placeholder = ({ title }: { title: string }) => (
    <View style={styles.container}>
        <Text style={styles.text}>{title}</Text>
        <Text style={styles.subtext}>Coming Soon</Text>
    </View>
);

export const FinanceScreen = () => <Placeholder title="Finance & Insurance" />;

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
    text: { fontSize: 24, fontWeight: 'bold', color: '#333' },
    subtext: { fontSize: 16, color: '#666', marginTop: 8 }
});
