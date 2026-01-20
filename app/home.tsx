import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';

export default function HomeScreen() {
    const router = useRouter();
    const [avatarUri, setAvatarUri] = React.useState<string | null>(null);

    useFocusEffect(
        React.useCallback(() => {
            loadAvatar();
        }, [])
    );

    const loadAvatar = async () => {
        try {
            const savedUri = await AsyncStorage.getItem('user_avatar_uri');
            if (savedUri) {
                setAvatarUri(savedUri);
            }
        } catch (error) {
            console.error('Failed to load avatar:', error);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* App Bar */}
            <View className="flex-row justify-between items-start px-6 pt-4 pb-6 bg-white border-b border-gray-100">
                <View>
                    <View className="flex-row items-center gap-2 mb-1">
                        <View className="w-8 h-8 bg-blue-600 rounded-lg items-center justify-center shadow-sm">
                            <Ionicons name="book" size={18} color="white" />
                        </View>
                        <Text className="text-2xl font-extrabold text-slate-800 tracking-tight">FlipWord</Text>
                    </View>
                    <Text className="text-slate-500 font-medium text-sm mt-2">Master your vocabulary daily</Text>
                </View>
                <TouchableOpacity
                    className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center border border-white shadow-sm overflow-hidden"
                    onPress={() => router.push('/user-profile')}
                >
                    {avatarUri ? (
                        <Image
                            source={{ uri: avatarUri }}
                            style={{ width: '100%', height: '100%' }}
                            contentFit="cover"
                        />
                    ) : (
                        <Ionicons name="person" size={20} color="#2563EB" />
                    )}
                </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView className="flex-1 bg-gray-50 px-4 pt-6" contentContainerStyle={{ paddingBottom: 40 }}>

                {/* Feature Card: Flashcard (En-Vi) */}
                <TouchableOpacity
                    onPress={() => router.push('/flashcard?mode=en-vi')}
                    className="bg-white rounded-2xl p-4 shadow-sm mb-4 border border-gray-100 flex-row items-center"
                >
                    <View className="w-16 h-16 bg-blue-50 rounded-xl items-center justify-center mr-4 border border-blue-100">
                        <Ionicons name="library-outline" size={30} color="#3B82F6" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-lg font-bold text-gray-800 mb-0.5">Essential Flashcards</Text>
                        <Text className="text-gray-500 text-sm">Build your vocabulary foundation</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
                </TouchableOpacity>

                {/* Feature Card: Flashcard (Vi-En) */}
                <TouchableOpacity
                    onPress={() => router.push('/flashcard?mode=vi-en')}
                    className="bg-white rounded-2xl p-4 shadow-sm mb-4 border border-gray-100 flex-row items-center"
                >
                    <View className="w-16 h-16 bg-orange-50 rounded-xl items-center justify-center mr-4 border border-orange-100">
                        <Ionicons name="refresh-circle-outline" size={32} color="#F97316" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-lg font-bold text-gray-800 mb-0.5">Active Recall</Text>
                        <Text className="text-gray-500 text-sm">Strengthen your memory</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
                </TouchableOpacity>

                {/* Feature Card: Spelling Practice */}
                <TouchableOpacity
                    onPress={() => router.push('/spelling')}
                    className="bg-white rounded-2xl p-4 shadow-sm mb-4 border border-gray-100 flex-row items-center"
                >
                    <View className="w-16 h-16 bg-purple-50 rounded-xl items-center justify-center mr-4 border border-purple-100">
                        <Ionicons name="pencil-outline" size={30} color="#8B5CF6" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-lg font-bold text-gray-800 mb-0.5">Spelling Bee</Text>
                        <Text className="text-gray-500 text-sm">Master correct writing</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
                </TouchableOpacity>

                {/* Feature Card: Fill in the Blank */}
                <TouchableOpacity
                    onPress={() => router.push('/fill-blank')}
                    className="bg-white rounded-2xl p-4 shadow-sm mb-4 border border-gray-100 flex-row items-center"
                >
                    <View className="w-16 h-16 bg-indigo-50 rounded-xl items-center justify-center mr-4 border border-indigo-100">
                        <Ionicons name="bulb-outline" size={30} color="#6366F1" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-lg font-bold text-gray-800 mb-0.5">Context Master</Text>
                        <Text className="text-gray-500 text-sm">Learn usage in sentences</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
                </TouchableOpacity>

                {/* Feature Card: Multiple Choice */}
                <TouchableOpacity
                    onPress={() => router.push('/multiple-choice')}
                    className="bg-white rounded-2xl p-4 shadow-sm mb-4 border border-gray-100 flex-row items-center"
                >
                    <View className="w-16 h-16 bg-teal-50 rounded-xl items-center justify-center mr-4 border border-teal-100">
                        <Ionicons name="checkmark-circle-outline" size={30} color="#14B8A6" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-lg font-bold text-gray-800 mb-0.5">Quick Quiz</Text>
                        <Text className="text-gray-500 text-sm">Fast meaning check</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
                </TouchableOpacity>

                {/* Feature Card: Reverse Multiple Choice */}
                <TouchableOpacity
                    onPress={() => router.push('/reverse-multiple-choice')}
                    className="bg-white rounded-2xl p-4 shadow-sm mb-4 border border-gray-100 flex-row items-center"
                >
                    <View className="w-16 h-16 bg-amber-50 rounded-xl items-center justify-center mr-4 border border-amber-100">
                        <Ionicons name="search-outline" size={30} color="#F59E0B" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-lg font-bold text-gray-800 mb-0.5">Word Hunter</Text>
                        <Text className="text-gray-500 text-sm">Find the English term</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
                </TouchableOpacity>

                {/* Feature Card: Word Match */}
                <TouchableOpacity
                    onPress={() => router.push('/word-match')}
                    className="bg-white rounded-2xl p-4 shadow-sm mb-4 border border-gray-100 flex-row items-center"
                >
                    <View className="w-16 h-16 bg-pink-50 rounded-xl items-center justify-center mr-4 border border-pink-100">
                        <Ionicons name="magnet-outline" size={30} color="#EC4899" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-lg font-bold text-gray-800 mb-0.5">Power Matching</Text>
                        <Text className="text-gray-500 text-sm">Connect pairs rapidly</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}
