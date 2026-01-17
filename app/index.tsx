import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* App Bar */}
            <View className="flex-row justify-between items-center px-6 py-4 bg-white shadow-sm">
                <View className="flex-row items-center gap-2">
                    <View className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center">
                        <Ionicons name="book" size={24} color="white" />
                    </View>
                    <Text className="text-2xl font-bold text-gray-800">FlipWord</Text>
                </View>
                <TouchableOpacity className="p-2 bg-gray-100 rounded-full">
                    <Ionicons name="settings-outline" size={24} color="#374151" />
                </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView className="flex-1 px-4 pt-6">
                <Text className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">Features</Text>

                {/* Feature Card: Flashcard (En-Vi) */}
                <TouchableOpacity
                    onPress={() => router.push('/flashcard?mode=en-vi')}
                    className="bg-white rounded-2xl p-4 shadow-sm mb-4 border border-gray-100 flex-row items-center"
                >
                    <View className="w-16 h-16 bg-blue-100 rounded-xl items-center justify-center mr-4">
                        <Ionicons name="documents-outline" size={32} color="#3B82F6" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-lg font-bold text-gray-800 mb-1">Eng - Viet</Text>
                        <Text className="text-gray-500 text-sm">Learn words (English to Vietnamese)</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>

                {/* Feature Card: Flashcard (Vi-En) */}
                <TouchableOpacity
                    onPress={() => router.push('/flashcard?mode=vi-en')}
                    className="bg-white rounded-2xl p-4 shadow-sm mb-4 border border-gray-100 flex-row items-center"
                >
                    <View className="w-16 h-16 bg-orange-100 rounded-xl items-center justify-center mr-4">
                        <Ionicons name="repeat-outline" size={32} color="#F97316" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-lg font-bold text-gray-800 mb-1">Viet - Eng</Text>
                        <Text className="text-gray-500 text-sm">Ôn tập (Vietnamese to English)</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>

                {/* Feature Card: Spelling Practice */}
                <TouchableOpacity
                    onPress={() => router.push('/spelling')}
                    className="bg-white rounded-2xl p-4 shadow-sm mb-4 border border-gray-100 flex-row items-center"
                >
                    <View className="w-16 h-16 bg-purple-100 rounded-xl items-center justify-center mr-4">
                        <Ionicons name="create-outline" size={32} color="#8B5CF6" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-lg font-bold text-gray-800 mb-1">Spelling</Text>
                        <Text className="text-gray-500 text-sm">Practice writing words</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>

                {/* Feature Card: Fill in the Blank */}
                <TouchableOpacity
                    onPress={() => router.push('/fill-blank')}
                    className="bg-white rounded-2xl p-4 shadow-sm mb-4 border border-gray-100 flex-row items-center"
                >
                    <View className="w-16 h-16 bg-blue-100 rounded-xl items-center justify-center mr-4">
                        <Ionicons name="text-outline" size={32} color="#2563EB" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-lg font-bold text-gray-800 mb-1">Fill in the Blank</Text>
                        <Text className="text-gray-500 text-sm">Complete the sentence</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>

                {/* Feature Card: Placeholder */}
                <TouchableOpacity
                    disabled
                    className="bg-gray-100 rounded-2xl p-4 mb-4 border border-gray-100 flex-row items-center opacity-60"
                >
                    <View className="w-16 h-16 bg-gray-200 rounded-xl items-center justify-center mr-4">
                        <Ionicons name="lock-closed-outline" size={32} color="#9CA3AF" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-lg font-bold text-gray-500 mb-1">Coming Soon</Text>
                        <Text className="text-gray-400 text-sm">More features ahead</Text>
                    </View>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}
