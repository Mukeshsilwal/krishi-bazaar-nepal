import React from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export const ProfileScreen = () => {
    const { signOut } = useAuth();
    const navigation = useNavigation<any>();

    const handleLogout = async () => {
        try {
            await signOut();
        } catch (error) {
            Alert.alert('Error', 'Failed to log out');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>My Profile</Text>
            </View>

            <View style={styles.menu}>
                <Button title="My Finances" onPress={() => navigation.navigate('Finance')} color="#16a34a" />
                <View style={{ height: 10 }} />
                <Button title="Help & Support" onPress={() => navigation.navigate('Support')} color="#16a34a" />
                <View style={{ height: 10 }} />
                <Button title="Logout" onPress={handleLogout} color="#dc2626" />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20, alignItems: 'center', backgroundColor: '#fff' },
    header: { marginBottom: 40, alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
    menu: { width: '100%', maxWidth: 300 }
});
