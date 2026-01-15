import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
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

export default function SpellingScreen() {
    const router = useRouter();
    const [words, setWords] = useState<Word[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    const [userInput, setUserInput] = useState('');
    const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
    const inputRef = useRef<TextInput>(null);

    useEffect(() => {
        loadWords();
    }, []);

    const loadWords = async () => {
        setLoading(true);
        const data = await wordRepository.getWords('en-vi');
        setWords(shuffleArray([...data]));
        setLoading(false);
    };

    const currentWord = words[currentIndex];

    const handleCheck = () => {
        if (!userInput.trim()) return;

        const isMatch = userInput.trim().toLowerCase() === currentWord.english.toLowerCase();
        setStatus(isMatch ? 'correct' : 'incorrect');
        Keyboard.dismiss();
    };

    const handleNext = () => {
        if (currentIndex < words.length - 1) {
            setCurrentIndex(prev => prev + 1);
            resetState();
        } else {
            // Did finish all words
            // Simple reset for now or navigate back
            router.back();
        }
    };

    const resetState = () => {
        setUserInput('');
        setStatus('idle');
        // Keep keyboard open or re-focus? 
        // User requested "no toggle keyboard", relying on autoFocus might not work perfectly without a timeout on Android, 
        // but on iOS usually fine if we don't dismiss.
        // However, I dismissed it on 'Check' to show result clearly. 
        // Let's try to focus again.
        setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
    };

    // Masking logic: Replace the target word in the example sentence with underscores
    const getMaskedSentence = (word: Word) => {
        if (!word) return '';
        const regex = new RegExp(`\\b${word.english}\\b`, 'gi');
        return word.example.replace(regex, '______');
    };

    if (loading || !currentWord) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#8B5CF6" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-purple-50">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                {/* Header */}
                <View className="flex-row items-center px-4 py-2 bg-purple-50 z-10">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2 bg-white rounded-full shadow-sm">
                        <Ionicons name="arrow-back" size={24} color="#5B21B6" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-800">Spelling Practice</Text>
                    <View className="flex-1 items-end">
                        <Text className="text-purple-600 font-medium">{currentIndex + 1}/{words.length}</Text>
                    </View>
                </View>

                <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }} keyboardShouldPersistTaps="handled">

                    {/* Question Card */}
                    <View className="bg-white rounded-3xl p-6 shadow-sm border border-purple-100 mb-8 items-center">
                        <Text className="text-gray-500 font-medium uppercase tracking-wider mb-4">Translate & Spell</Text>

                        <Text className="text-3xl font-bold text-gray-800 text-center mb-6 leading-tight">
                            {currentWord.vietnamese}
                        </Text>

                        <View className="bg-purple-50 w-full p-4 rounded-xl">
                            <Text className="text-lg text-purple-900 text-center font-medium opacity-80 italic">
                                "{status === 'idle' ? getMaskedSentence(currentWord) : currentWord.example}"
                            </Text>
                            <Text className="text-xs text-center text-purple-400 mt-2">({currentWord.exampleMeaning})</Text>
                        </View>
                    </View>

                    {/* Input Area */}
                    <View className="mb-6">
                        <Text className="ml-2 mb-2 text-gray-600 font-medium">Type the English word:</Text>
                        <TextInput
                            ref={inputRef}
                            value={userInput}
                            onChangeText={(text) => {
                                setUserInput(text);
                                if (status !== 'idle') setStatus('idle'); // Reset status if user types again
                            }}
                            placeholder="Type here..."
                            autoCapitalize="none"
                            editable={status === 'idle' || status === 'incorrect'}
                            className={`
                        w-full bg-white p-4 rounded-xl text-xl font-bold border-2 
                        ${status === 'idle' ? 'border-purple-200 text-gray-800' : ''}
                        ${status === 'correct' ? 'border-green-500 text-green-600 bg-green-50' : ''}
                        ${status === 'incorrect' ? 'border-red-500 text-red-600 bg-red-50' : ''}
                    `}
                            onSubmitEditing={status === 'idle' ? handleCheck : handleNext}
                        />
                    </View>

                    {/* Feedback Area */}
                    {status !== 'idle' && (
                        <Animated.View entering={FadeInDown} className={`rounded-xl p-4 mb-6 flex-row items-center ${status === 'correct' ? 'bg-green-100' : 'bg-red-100'}`}>
                            <Ionicons
                                name={status === 'correct' ? 'checkmark-circle' : 'alert-circle'}
                                size={28}
                                color={status === 'correct' ? '#15803D' : '#B91C1C'}
                            />
                            <View className="ml-3 flex-1">
                                <Text className={`font-bold text-lg ${status === 'correct' ? 'text-green-800' : 'text-red-800'}`}>
                                    {status === 'correct' ? 'Correct!' : 'Incorrect'}
                                </Text>
                                {status === 'incorrect' && (
                                    <Text className="text-red-600 font-medium mt-1">
                                        Answer: <Text className="font-bold">{currentWord.english}</Text>
                                    </Text>
                                )}
                            </View>
                        </Animated.View>
                    )}

                    {/* Action Button */}
                    <TouchableOpacity
                        onPress={status === 'idle' ? handleCheck : handleNext}
                        className={`
                    w-full py-4 rounded-2xl shadow-md flex-row justify-center items-center
                    ${status === 'idle' ? 'bg-purple-600' : ''}
                    ${status === 'correct' ? 'bg-green-600' : ''}
                    ${status === 'incorrect' ? 'bg-purple-600' : ''}
                `}
                    >
                        <Text className="text-white font-bold text-xl mr-2">
                            {status === 'idle' ? 'Check Answer' : 'Next Word'}
                        </Text>
                        <Ionicons
                            name={status === 'idle' ? 'checkmark' : 'arrow-forward'}
                            size={24}
                            color="white"
                        />
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
