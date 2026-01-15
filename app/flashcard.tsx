import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SwipeDeck from '../components/Flashcard/SwipeDeck';
import { Word } from '../data/models/Word';
import { wordRepository } from '../data/repositories/WordRepository';

export default function FlashcardScreen() {
    const router = useRouter();
    const [words, setWords] = useState<Word[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWords();
    }, []);

    const loadWords = async () => {
        setLoading(true);
        const data = await wordRepository.getWords();
        setWords(data);
        setLoading(false);
    };

    const handleSwipeRight = (word: Word) => {
        console.log(`Remembered: ${word.english}`);
    };

    const handleSwipeLeft = (word: Word) => {
        console.log(`Forgot: ${word.english}`);
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="flex-row items-center px-4 py-2">
                <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
                    <Ionicons name="arrow-back" size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800">Flashcards</Text>
            </View>

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
                        onFinish={() => {
                            // Could navigate back or show a retry button here
                            console.log("Finished all cards");
                        }}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}
