import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getCalendarEvents } from '../services/calendarService';
import { Calendar as CalendarIcon } from 'lucide-react-native';

export const AgricultureCalendarScreen = () => {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            const data = await getCalendarEvents();
            const items = data.data || data || [];
            setEvents(items);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const renderEvent = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.header}>
                <CalendarIcon size={20} color="#16a34a" />
                <Text style={styles.title}>{item.title}</Text>
            </View>
            <Text style={styles.date}>{item.date}</Text>
            <Text style={styles.description}>{item.description}</Text>
            {item.category && <Text style={styles.category}>{item.category}</Text>}
        </View>
    );

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#16a34a" style={styles.loader} />
            ) : (
                <FlatList
                    data={events}
                    renderItem={renderEvent}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={styles.empty}>No calendar events found.</Text>}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    loader: { flex: 1, justifyContent: 'center' },
    list: { padding: 16, gap: 12 },
    card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, elevation: 2 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    title: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    date: { fontSize: 14, color: '#666', marginBottom: 4 },
    description: { fontSize: 14, color: '#444', marginBottom: 8 },
    category: { fontSize: 12, color: '#16a34a', fontWeight: 'bold', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#f0fdf4', borderRadius: 12 },
    empty: { textAlign: 'center', marginTop: 40, color: '#666' },
});
