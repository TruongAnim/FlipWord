import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import { trackingRepository } from '../data/repositories/TrackingRepository';

export default function SettingsScreen() {
    const router = useRouter();

    const openUrl = async (url: string) => {
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert("Error", "Could not open this URL");
            }
        } catch (e) {
            Alert.alert("Error", "Failed to open link");
        }
    };

    const handleClearData = async () => {
        Alert.alert(
            "Clear Data",
            "Are you sure you want to delete all tracking data? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        await trackingRepository.clearData();
                        Alert.alert("Success", "Data cleared successfully");
                    }
                }
            ]
        );
    };

    const SettingItem = ({ icon, title, subtitle, onPress, isDestructive = false }: { icon: keyof typeof Ionicons.glyphMap, title: string, subtitle?: string, onPress: () => void, isDestructive?: boolean }) => (
        <TouchableOpacity
            onPress={onPress}
            className="flex-row items-center p-4 bg-white border-b border-gray-100"
        >
            <View className={`w-8 items-center`}>
                <Ionicons name={icon} size={24} color={isDestructive ? '#EF4444' : '#4B5563'} />
            </View>
            <View className="flex-1 ml-3">
                <Text className={`text-base font-medium ${isDestructive ? 'text-red-500' : 'text-gray-800'}`}>
                    {title}
                </Text>
                {subtitle && (
                    <Text className="text-gray-400 text-xs mt-0.5">{subtitle}</Text>
                )}
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row items-center px-4 py-3 bg-white">
                <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
                    <Ionicons name="arrow-back" size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800">Settings</Text>
            </View>

            <View className="flex-1 bg-gray-50">
                <ScrollView className="flex-1">
                    <View className="mt-4 bg-white border-y border-gray-100">
                        <SettingItem
                            icon="earth"
                            title="Language"
                            onPress={() => router.push('/language' as any)}
                        />
                        <SettingItem
                            icon="shield-checkmark-outline"
                            title="Privacy Policy"
                            onPress={() => openUrl('https://google.com')}
                        />
                        <SettingItem
                            icon="document-text-outline"
                            title="Terms of Use"
                            onPress={() => openUrl('https://google.com')}
                        />
                        <SettingItem
                            icon="chatbubble-ellipses-outline"
                            title="Feedback"
                            onPress={() => openUrl('mailto:support@example.com')}
                        />
                    </View>

                    <View className="mt-6 bg-white border-y border-gray-200">
                        <SettingItem
                            icon="trash-outline"
                            title="Clear Data"
                            subtitle="This will reset all your progress"
                            isDestructive
                            onPress={handleClearData}
                        />
                    </View>
                </ScrollView>

                <View className="items-center py-6">
                    <Text className="text-gray-400">
                        Version {Constants.expoConfig?.version || '1.0.0'}
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
}
