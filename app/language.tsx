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
    const [selectedCode, setSelectedCode] = React.useState(language);

    const hasChanges = selectedCode !== language;

    const handleSave = () => {
        if (hasChanges) {
            setLanguage(selectedCode);
            router.back();
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-sm z-10">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
                        <Ionicons name="arrow-back" size={24} color="#374151" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-800">Language</Text>
                </View>

                <TouchableOpacity
                    onPress={handleSave}
                    disabled={!hasChanges}
                    className="p-2"
                >
                    <Ionicons
                        name="checkmark"
                        size={28}
                        color={hasChanges ? "#3B82F6" : "#9CA3AF"}
                    />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 bg-gray-50">
                <View className="mt-4 pb-4">
                    {SUPPORTED_LANGUAGES.map((lang) => {
                        const isSelected = selectedCode === lang.code;
                        return (
                            <TouchableOpacity
                                key={lang.code}
                                onPress={() => setSelectedCode(lang.code)}
                                activeOpacity={0.7}
                                className={`flex-row items-center justify-between p-4 mb-3 mx-4 rounded-xl border ${isSelected
                                        ? 'bg-blue-50 border-blue-500 shadow-sm'
                                        : 'bg-white border-gray-200 shadow-sm'
                                    }`}
                            >
                                <View className="flex-row items-center flex-1">
                                    <Text className="text-3xl mr-4">{lang.flag}</Text>
                                    <Text className={`text-base font-semibold ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
                                        English {'<->'} {lang.name}
                                    </Text>
                                </View>

                                <Ionicons
                                    name={isSelected ? "radio-button-on" : "radio-button-off"}
                                    size={24}
                                    color={isSelected ? "#3B82F6" : "#D1D5DB"}
                                />
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
