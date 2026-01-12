import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const RegisterScreen = () => {
    const navigation = useNavigation<any>();
    const { signIn } = useAuth();

    // Form State
    const [fullName, setFullName] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('FARMER'); // Default to Farmer
    const [district, setDistrict] = useState('');
    const [ward, setWard] = useState('');
    const [landSize, setLandSize] = useState('');

    // UI State
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'REGISTER' | 'OTP'>('REGISTER');
    const [otp, setOtp] = useState('');

    const handleRegister = async () => {
        if (!fullName || !mobileNumber || !district) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/register', {
                name: fullName, // Backend expects 'name', Web uses 'name' in formData
                mobileNumber,
                email, // Optional but good to have
                role, // FARMER or BUYER
                district,
                ward,
                landSize: role === 'FARMER' ? landSize : undefined
            });
            setStep('OTP');
            Alert.alert('Success', 'OTP sent to your mobile');
        } catch (error: any) {
            console.error(error);
            Alert.alert('Registration Failed', error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) return;
        setLoading(true);
        try {
            const response = await api.post('/auth/verify-otp', {
                identifier: mobileNumber, // Assuming backend uses mobile/email as identifier for verification
                otp
            });

            const { accessToken } = response.data.data;
            if (accessToken) {
                await signIn(accessToken);
                // Navigation will automatically switch to Main stack via AuthContext
            }
        } catch (error: any) {
            Alert.alert('Verification Failed', error.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Create Account</Text>

            {step === 'REGISTER' ? (
                <>
                    <TextInput
                        style={styles.input}
                        placeholder="Full Name *"
                        value={fullName}
                        onChangeText={setFullName}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Mobile Number *"
                        value={mobileNumber}
                        onChangeText={setMobileNumber}
                        keyboardType="phone-pad"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Email (Optional)"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="District *"
                        value={district}
                        onChangeText={setDistrict}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Ward"
                        value={ward}
                        onChangeText={setWard}
                        keyboardType="numeric"
                    />

                    <View style={styles.roleContainer}>
                        <Text style={styles.label}>I am a:</Text>
                        <View style={styles.roleButtons}>
                            <TouchableOpacity
                                style={[styles.roleButton, role === 'FARMER' && styles.activeRole]}
                                onPress={() => setRole('FARMER')}
                            >
                                <Text style={[styles.roleText, role === 'FARMER' && styles.activeRoleText]}>Farmer</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.roleButton, role === 'BUYER' && styles.activeRole]}
                                onPress={() => setRole('BUYER')}
                            >
                                <Text style={[styles.roleText, role === 'BUYER' && styles.activeRoleText]}>Buyer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {role === 'FARMER' && (
                        <TextInput
                            style={styles.input}
                            placeholder="Land Size (Ropani)"
                            value={landSize}
                            onChangeText={setLandSize}
                            keyboardType="numeric"
                        />
                    )}

                    {loading ? (
                        <ActivityIndicator size="large" color="#16a34a" />
                    ) : (
                        <Button title="Register" color="#16a34a" onPress={handleRegister} />
                    )}

                    <View style={styles.loginLink}>
                        <Text>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.linkText}>Login</Text>
                        </TouchableOpacity>
                    </View>
                </>
            ) : (
                <>
                    <Text style={styles.subtitle}>Enter OTP sent to {mobileNumber}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter OTP"
                        value={otp}
                        onChangeText={setOtp}
                        keyboardType="numeric"
                    />
                    {loading ? (
                        <ActivityIndicator size="large" color="#16a34a" />
                    ) : (
                        <Button title="Verify OTP" color="#16a34a" onPress={handleVerifyOtp} />
                    )}
                    <Button title="Back" color="gray" onPress={() => setStep('REGISTER')} />
                </>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flexGrow: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#16a34a' },
    subtitle: { fontSize: 16, marginBottom: 20, textAlign: 'center', color: '#666' },
    input: { borderWidth: 1, borderColor: '#ddd', padding: 12, marginBottom: 15, borderRadius: 8, fontSize: 16 },
    label: { fontSize: 16, marginBottom: 10, fontWeight: '500' },
    roleContainer: { marginBottom: 20 },
    roleButtons: { flexDirection: 'row', gap: 10 },
    roleButton: { flex: 1, padding: 12, borderWidth: 1, borderColor: '#16a34a', borderRadius: 8, alignItems: 'center' },
    activeRole: { backgroundColor: '#16a34a' },
    roleText: { color: '#16a34a', fontWeight: 'bold' },
    activeRoleText: { color: '#fff' },
    loginLink: { flexDirection: 'row', marginTop: 20, justifyContent: 'center' },
    linkText: { color: '#16a34a', fontWeight: 'bold' }
});
