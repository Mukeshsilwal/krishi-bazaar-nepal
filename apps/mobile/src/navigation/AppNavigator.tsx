import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, ShoppingCart, User, Sprout, MessageCircle } from 'lucide-react-native';

import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { MarketplaceScreen } from '../screens/MarketplaceScreen';
import { ListingDetailScreen } from '../screens/ListingDetailScreen';
import { OrdersScreen } from '../screens/OrdersScreen';
import { KnowledgeScreen } from '../screens/KnowledgeScreen';
import { ArticleDetailScreen } from '../screens/ArticleDetailScreen';
import { ColdStorageScreen } from '../screens/ColdStorageScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SellScreen } from '../screens/SellScreen';
import { MarketPriceScreen } from '../screens/MarketPriceScreen';
import { AgricultureCalendarScreen } from '../screens/AgricultureCalendarScreen';
import { ChatListScreen } from '../screens/ChatListScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { NotificationScreen } from '../screens/NotificationScreen';
import { FinanceScreen } from '../screens/FinanceScreen';
import { SupportScreen } from '../screens/SupportScreen';
import { useAuth } from '../context/AuthContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabNavigator() {
    return (
        <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: '#16a34a' }}>
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{ tabBarIcon: ({ color }: { color: string }) => <Home color={color} size={24} /> }}
            />
            <Tab.Screen
                name="MarketplaceTab"
                component={MarketplaceScreen}
                options={{ title: 'Bazaar', tabBarIcon: ({ color }: { color: string }) => <Sprout color={color} size={24} /> }}
            />
            <Tab.Screen
                name="OrdersTab"
                component={OrdersScreen}
                options={{ title: 'Orders', tabBarIcon: ({ color }: { color: string }) => <ShoppingCart color={color} size={24} /> }}
            />
            <Tab.Screen
                name="ProfileTab"
                component={ProfileScreen}
                options={{ title: 'Profile', tabBarIcon: ({ color }: { color: string }) => <User color={color} size={24} /> }}
            />
        </Tab.Navigator>
    );
}

export const AppNavigator = () => {
    const { isLoading, userToken } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#16a34a" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {userToken ? (
                    <Stack.Group>
                        <Stack.Screen name="Main" component={MainTabNavigator} />
                        <Stack.Screen name="ListingDetail" component={ListingDetailScreen} options={{ headerShown: true, title: 'Listing Details' }} />
                        <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} options={{ headerShown: true, title: 'Article' }} />
                        <Stack.Screen name="ColdStorage" component={ColdStorageScreen} options={{ headerShown: true, title: 'Cold Storage' }} />

                        <Stack.Screen name="Sell" component={SellScreen} options={{ headerShown: true, title: 'Sell Crops' }} />
                        <Stack.Screen name="Prices" component={MarketPriceScreen} options={{ headerShown: true, title: 'Market Prices' }} />
                        <Stack.Screen name="AgricultureCalendar" component={AgricultureCalendarScreen} options={{ headerShown: true, title: 'Agriculture Calendar' }} />
                        <Stack.Screen name="Learn" component={KnowledgeScreen} options={{ headerShown: true, title: 'Agriculture Advisory' }} />
                        <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: true }} />
                        <Stack.Screen name="Notifications" component={NotificationScreen} options={{ headerShown: true, title: 'Notifications' }} />


                        <Stack.Screen name="Finance" component={FinanceScreen} options={{ headerShown: true, title: 'Finance' }} />
                        <Stack.Screen name="Support" component={SupportScreen} options={{ headerShown: true, title: 'Help & Support' }} />
                    </Stack.Group>
                ) : (
                    <Stack.Group>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                    </Stack.Group>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};
