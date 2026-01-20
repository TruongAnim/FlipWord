import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Word } from '../data/models/Word';
import { wordRepository } from '../data/repositories/WordRepository';
import { trackingRepository } from '../data/repositories/TrackingRepository';
import { GameTimer } from '../components/GameTimer';
import { GameConfig } from '../constants/GameConfig';

import { useLanguage } from '../contexts/LanguageContext';

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
    const { getWordDefinition, getWordExampleMeaning, language } = useLanguage();
    const [words, setWords] = useState<Word[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    const [userInput, setUserInput] = useState('');
    const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
    const [correctCount, setCorrectCount] = useState(0);
    const [incorrectCount, setIncorrectCount] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const inputRef = useRef<TextInput>(null);
    const startTimeRef = useRef<number>(Date.now());

    useEffect(() => {
        loadWords();
        startTimeRef.current = Date.now();
    }, [language]);

    const loadWords = async () => {
        setLoading(true);
        const data = await wordRepository.getWords('en-vi');
        setWords(shuffleArray([...data]).slice(0, GameConfig.SPELLING_COUNT));
        setLoading(false);
    };

    const currentWord = words[currentIndex];

    const handleCheck = () => {
        if (!userInput.trim()) return;

        const isMatch = userInput.trim().toLowerCase() === currentWord.english.toLowerCase();
        setStatus(isMatch ? 'correct' : 'incorrect');

        if (isMatch) {
            setCorrectCount(prev => prev + 1);
            trackingRepository.logAttempt(currentWord.id, true, 'spelling');
        } else {
            setIncorrectCount(prev => prev + 1);
            trackingRepository.logAttempt(currentWord.id, false, 'spelling');
        }

        Keyboard.dismiss();
    };

    const handleNext = () => {
        if (currentIndex < words.length - 1) {
            setCurrentIndex(prev => prev + 1);
            resetState();
        } else {
            const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
            trackingRepository.logSession(duration, 'spelling');
            setIsCompleted(true);
        }
    };

    const resetState = () => {
        setUserInput('');
        setStatus('idle');
        setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
    };

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

    if (isCompleted) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center p-6">
                <View className="items-center w-full max-w-sm">
                    <View className="mb-8 p-6 bg-purple-50 rounded-full">
                        <Ionicons name="medal" size={80} color="#8B5CF6" />
                    </View>

                    <Text className="text-3xl font-bold text-gray-800 mb-2">Excellent Work!</Text>
                    <Text className="text-gray-500 text-center mb-8">You have completed your spelling practice.</Text>

                    <View className="flex-row justify-between w-full mb-8">
                        <View className="items-center bg-green-50 p-4 rounded-2xl flex-1 mr-2">
                            <Text className="text-3xl font-bold text-green-600">{correctCount}</Text>
                            <Text className="text-green-700 font-medium">Correct</Text>
                        </View>
                        <View className="items-center bg-red-50 p-4 rounded-2xl flex-1 ml-2">
                            <Text className="text-3xl font-bold text-red-600">{incorrectCount}</Text>
                            <Text className="text-red-700 font-medium">Incorrect</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        className="w-full bg-purple-600 py-4 rounded-xl shadow-md flex-row justify-center items-center"
                        onPress={() => router.back()}
                    >
                        <Ionicons name="home" size={20} color="white" style={{ marginRight: 8 }} />
                        <Text className="text-white font-bold text-lg">Back to Home</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // Generate underscores for hint
    const hintUnderscores = Array(currentWord.english.length).fill('_').join(' ');

    return (
        <SafeAreaView className="flex-1 bg-purple-50">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                {/* Header */}
                <View className="flex-row items-center px-4 py-2 bg-purple-50 z-10">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2 bg-white rounded-full shadow-sm">
                        <Ionicons name="arrow-back" size={24} color="#5B21B6" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-800">Spelling Bee</Text>
                    <View className="flex-1 items-end">
                        <Text className="text-purple-600 font-medium text-lg">{currentIndex + 1}/{words.length}</Text>
                    </View>
                </View>

                {/* Timer Bar */}
                <GameTimer
                    duration={GameConfig.SPELLING_DURATION}
                    onTimeout={() => {
                        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
                        trackingRepository.logSession(duration, 'spelling');
                        setIsCompleted(true);
                    }}
                    isRunning={!loading && !isCompleted}
                />

                <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }} keyboardShouldPersistTaps="handled">

                    {/* Question Card */}
                    <View className="bg-white rounded-3xl p-6 shadow-sm border border-purple-100 mb-8 items-center">

                        {/* Status / Hint Header */}
                        <View className="flex-row items-center justify-center mb-4 h-10">
                            {status === 'idle' ? (
                                <Text className="text-2xl font-mono text-gray-400 tracking-widest">{hintUnderscores}</Text>
                            ) : (
                                <View className="flex-row items-center">
                                    <Text className={`text-2xl font-bold mr-2 ${status === 'correct' ? 'text-green-600' : 'text-red-600'}`}>
                                        {currentWord.english}
                                    </Text>
                                    <Ionicons
                                        name={status === 'correct' ? 'checkmark-circle' : 'alert-circle'}
                                        size={28}
                                        color={status === 'correct' ? '#15803D' : '#B91C1C'}
                                    />
                                </View>
                            )}
                        </View>

                        <Text className="text-3xl font-bold text-gray-800 text-center mb-6 leading-tight">
                            {getWordDefinition(currentWord).split(',')[0].trim()}
                        </Text>

                        <View className="bg-purple-50 w-full p-4 rounded-xl">
                            <Text className="text-lg text-purple-900 text-center font-medium opacity-80 italic">
                                "{status === 'idle' ? getMaskedSentence(currentWord) : currentWord.example}"
                            </Text>
                            <Text className="text-xs text-center text-purple-400 mt-2">({getWordExampleMeaning(currentWord)})</Text>
                        </View>
                    </View>

                    {/* Input Area */}
                    <View className="mb-6 flex-1 justify-end">
                        <Text className="ml-2 mb-2 text-gray-600 font-medium">Type the English word:</Text>
                        <TextInput
                            ref={inputRef}
                            value={userInput}
                            onChangeText={(text) => {
                                setUserInput(text);
                                if (status !== 'idle') setStatus('idle');
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

                        {/* Action Button - Placed directly below input to prevent pushing */}
                        <View className="mt-6 h-16">
                            <TouchableOpacity
                                onPress={status === 'idle' ? handleCheck : handleNext}
                                className={`
                            w-full h-full rounded-2xl shadow-md flex-row justify-center items-center
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
                        </View>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
