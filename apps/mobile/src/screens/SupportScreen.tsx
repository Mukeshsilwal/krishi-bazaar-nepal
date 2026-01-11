import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { submitFeedback } from '../services/supportService'; // Ensure this service is created
import { MessageSquare, Send } from 'lucide-react-native';

export const SupportScreen = ({ navigation }) => {
    const [type, setType] = useState('ISSUE');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!message.trim()) {
            Alert.alert('Error', 'Please enter a message');
            return;
        }

        setSubmitting(true);
        try {
            await submitFeedback(type, message);
            Alert.alert('Success', 'Feedback submitted successfully!');
            setMessage('');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', 'Failed to submit feedback');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <MessageSquare size={32} color="#16a34a" />
                <Text style={styles.title}>Help & Support</Text>
                <Text style={styles.subtitle}>Have a suggestion or facing an issue? Let us know.</Text>
            </View>

            <View style={styles.form}>
                <Text style={styles.label}>Feedback Type</Text>
                <View style={styles.typeRow}>
                    {['ISSUE', 'SUGGESTION', 'OTHER'].map(t => (
                        <TouchableOpacity
                            key={t}
                            style={[styles.typeBtn, type === t && styles.activeTypeBtn]}
                            onPress={() => setType(t)}
                        >
                            <Text style={[styles.typeText, type === t && styles.activeTypeText]}>{t}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.label}>Message</Text>
                <TextInput
                    style={styles.textArea}
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Describe your issue or suggestion..."
                    multiline
                    textAlignVertical="top"
                />

                <TouchableOpacity
                    style={[styles.submitBtn, submitting && styles.disabledBtn]}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Send size={20} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.btnText}>Submit Feedback</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
    header: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
    title: { fontSize: 24, fontWeight: 'bold', marginTop: 10, color: '#333' },
    subtitle: { color: '#666', textAlign: 'center', marginTop: 5 },
    form: { backgroundColor: '#fff', padding: 20, borderRadius: 12, elevation: 2 },
    label: { fontWeight: '600', marginBottom: 8, color: '#333' },
    typeRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    typeBtn: { flex: 1, padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, alignItems: 'center' },
    activeTypeBtn: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
    typeText: { fontSize: 12, color: '#666' },
    activeTypeText: { color: '#fff', fontWeight: 'bold' },
    textArea: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, height: 150, padding: 12, marginBottom: 20, backgroundColor: '#fafafa' },
    submitBtn: { backgroundColor: '#16a34a', padding: 16, borderRadius: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    disabledBtn: { opacity: 0.7 },
    btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
