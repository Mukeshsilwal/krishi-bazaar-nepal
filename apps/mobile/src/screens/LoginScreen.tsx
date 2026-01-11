import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { login, verifyOtp } from '../services/authService'; // Keeping authService for specific calls if needed, or better use API directly? 
// Actually, verifiedOtp returns the token which signIn needs. 
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export const LoginScreen = () => {
    const [identifier, setIdentifier] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'LOGIN' | 'OTP'>('LOGIN');
    const [loading, setLoading] = useState(false);

    const { signIn } = useAuth();
    const navigation = useNavigation<any>();

    const handleLogin = async () => {
        if (!identifier) {
            Alert.alert('Error', 'Please enter Email or Mobile Number');
            return;
        }
        setLoading(true);
        try {
            await login(identifier);
            setStep('OTP');
            Alert.alert('OTP Sent', 'Please check your email/phone for OTP.');
        } catch (error: any) {
            console.error(error);
            Alert.alert('Login Failed', error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        if (!otp) return;
        setLoading(true);
        try {
            const authData = await verifyOtp(identifier, otp);
            if (authData.accessToken) {
                await signIn(authData.accessToken);
                // No need to navigate manually, AuthNavigator switches stack
            }
        } catch (error: any) {
            Alert.alert('Verification Failed', error.response?.data?.message || 'Invalid OTP');
            if (error.response?.data?.errorCode === 'ACTIVE_SESSION_EXISTS') {
                Alert.alert('Session Error', 'You are logged in on another device.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Krishi Bazaar Login</Text>

            {step === 'LOGIN' ? (
                <>
                    <TextInput
                        style={styles.input}
                        placeholder="Mobile Number or Email"
                        value={identifier}
                        onChangeText={setIdentifier}
                        autoCapitalize="none"
                    />
                    {loading ? <ActivityIndicator size="large" color="#16a34a" /> : <Button title="Send OTP" color="#16a34a" onPress={handleLogin} />}

                    <View style={styles.registerLink}>
                        <Text>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={styles.linkText}>Register</Text>
                        </TouchableOpacity>
                    </View>
                </>
            ) : (
                <>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter OTP"
                        value={otp}
                        onChangeText={setOtp}
                        keyboardType="numeric"
                    />
                    {loading ? <ActivityIndicator size="large" color="#16a34a" /> : <Button title="Verify OTP" color="#16a34a" onPress={handleVerify} />}
                    <View style={{ marginTop: 10 }}>
                        <Button title="Back" color="gray" onPress={() => setStep('LOGIN')} />
                    </View>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, textAlign: 'center', color: '#16a34a' },
    input: { borderWidth: 1, borderColor: '#ddd', padding: 12, marginBottom: 15, borderRadius: 8, fontSize: 16 },
    registerLink: { flexDirection: 'row', marginTop: 20, justifyContent: 'center' },
    linkText: { color: '#16a34a', fontWeight: 'bold' }
});
