import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SwipeDeck from '../components/Flashcard/SwipeDeck';
import { GameTimer } from '../components/GameTimer';
import { GameConfig } from '../constants/GameConfig';
import { Word } from '../data/models/Word';
import { wordRepository } from '../data/repositories/WordRepository';

const shuffleArray = (array: Word[]) => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
};

import { useLocalSearchParams } from 'expo-router';

export default function FlashcardScreen() {
    const router = useRouter();
    const { mode } = useLocalSearchParams<{ mode: 'en-vi' | 'vi-en' }>();
    const currentMode = mode || 'en-vi';

    const [words, setWords] = useState<Word[]>([]);
    const [loading, setLoading] = useState(true);
    const [rememberedCount, setRememberedCount] = useState(0);
    const [forgotCount, setForgotCount] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);

    useEffect(() => {
        loadWords();
    }, [currentMode]);

    const loadWords = async () => {
        setLoading(true);
        const data = await wordRepository.getWords(currentMode);
        setWords(shuffleArray([...data]));
        setLoading(false);
    };

    const handleSwipeRight = (word: Word) => {
        setRememberedCount(prev => prev + 1);
    };

    const handleSwipeLeft = (word: Word) => {
        setForgotCount(prev => prev + 1);
    };

    const handleFinish = () => {
        setIsCompleted(true);
    };

    const handleTimeout = () => {
        setIsCompleted(true);
    };

    if (isCompleted) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center p-6">
                <View className="items-center w-full max-w-sm">
                    <View className="mb-8 p-6 bg-blue-50 rounded-full">
                        <Ionicons name="trophy" size={80} color="#F59E0B" />
                    </View>

                    <Text className="text-3xl font-bold text-gray-800 mb-2">Well Done!</Text>
                    <Text className="text-gray-500 text-center mb-8">You have completed your session.</Text>

                    <View className="flex-row justify-between w-full mb-8">
                        <View className="items-center bg-green-50 p-4 rounded-2xl flex-1 mr-2">
                            <Text className="text-3xl font-bold text-green-600">{rememberedCount}</Text>
                            <Text className="text-green-700 font-medium">Remembered</Text>
                        </View>
                        <View className="items-center bg-red-50 p-4 rounded-2xl flex-1 ml-2">
                            <Text className="text-3xl font-bold text-red-600">{forgotCount}</Text>
                            <Text className="text-red-700 font-medium">Forgot</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        className="w-full bg-blue-500 py-4 rounded-xl shadow-md flex-row justify-center items-center"
                        onPress={() => router.back()}
                    >
                        <Ionicons name="home" size={20} color="white" style={{ marginRight: 8 }} />
                        <Text className="text-white font-bold text-lg">Back to Home</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="flex-row items-center px-4 py-2 justify-between">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
                        <Ionicons name="arrow-back" size={24} color="#374151" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-800">
                        {currentMode === 'en-vi' ? 'Essential Flashcards' : 'Active Recall'}
                    </Text>
                </View>
                <View className="flex-row items-center gap-2">
                    <Text className="text-blue-600 font-medium">
                        {rememberedCount + forgotCount}/{words.length}
                    </Text>
                </View>
            </View>

            {/* Timer Bar */}
            <GameTimer
                duration={GameConfig.FLASHCARD_DURATION}
                onTimeout={handleTimeout}
                isRunning={!loading && !isCompleted}
            />

            <View className="flex-1 relative">
                {loading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#3B82F6" />
                    </View>
                ) : (
                    <SwipeDeck
                        words={words}
                        onSwipeRight={handleSwipeRight}
                        onSwipeLeft={handleSwipeLeft}
                        onFinish={handleFinish}
                        displayMode={currentMode}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}
