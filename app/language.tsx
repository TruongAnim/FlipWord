import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SUPPORTED_LANGUAGES } from '../data/repositories/SettingsRepository';
import { useLanguage } from '../contexts/LanguageContext';

export default function LanguageScreen() {
    const router = useRouter();
    const { language, setLanguage } = useLanguage();

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row items-center px-4 py-3 bg-white border-b border-gray-200 shadow-sm z-10">
                <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
                    <Ionicons name="arrow-back" size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800">Language</Text>
            </View>

            <ScrollView className="flex-1 bg-gray-50">
                <View className="mt-4 bg-white border-y border-gray-200">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                        <TouchableOpacity
                            key={lang.code}
                            onPress={() => setLanguage(lang.code)}
                            className="flex-row items-center justify-between p-4 border-b border-gray-100 last:border-b-0"
                        >
                            <View className="flex-row items-center">
                                <Text className="text-2xl mr-4">{lang.flag}</Text>
                                <Text className="text-base font-medium text-gray-800">{lang.name}</Text>
                            </View>
                            {language === lang.code && (
                                <Ionicons name="checkmark" size={24} color="#3B82F6" />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
