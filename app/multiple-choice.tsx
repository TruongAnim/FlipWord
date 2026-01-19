import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Word } from '../data/models/Word';
import { wordRepository } from '../data/repositories/WordRepository';
import { GameTimer } from '../components/GameTimer';
import { GameConfig } from '../constants/GameConfig';

const shuffleArray = (array: any[]) => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
};

interface Question {
    targetWord: Word;
    options: string[]; // List of 4 vietnamese meanings
    correctOption: string;
}

export default function MultipleChoiceScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Game State
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [score, setScore] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);

    useEffect(() => {
        loadGame();
    }, []);

    const loadGame = async () => {
        setLoading(true);
        const allWords = await wordRepository.getWords('en-vi');

        const shuffledWords = shuffleArray([...allWords]);
        const targetWords = shuffledWords.slice(0, GameConfig.MULTIPLE_CHOICE_COUNT);

        const newQuestions: Question[] = targetWords.map((targetWord) => {
            // Pick 3 random distractors
            const otherWords = allWords.filter(w => w.id !== targetWord.id);
            const distractors = shuffleArray(otherWords).slice(0, 3).map(w => w.vietnamese.split(',')[0].trim());

            // Primary meaning of target word
            const targetMeaning = targetWord.vietnamese.split(',')[0].trim();

            const options = shuffleArray([targetMeaning, ...distractors]);

            return {
                targetWord,
                options,
                correctOption: targetMeaning
            };
        });

        setQuestions(newQuestions);
        setLoading(false);
    };

    const handleSelectOption = (option: string) => {
        if (selectedOption !== null) return;

        setSelectedOption(option);
        const currentQuestion = questions[currentIndex];
        const correct = option === currentQuestion.correctOption;

        setIsCorrect(correct);
        if (correct) {
            setScore(prev => prev + 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            resetRoundState();
        } else {
            setIsCompleted(true);
        }
    };

    const resetRoundState = () => {
        setSelectedOption(null);
        setIsCorrect(null);
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    if (isCompleted) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center p-6">
                <View className="items-center w-full max-w-sm">
                    <View className="mb-8 p-6 bg-teal-50 rounded-full">
                        <Ionicons name="trophy" size={80} color="#0D9488" />
                    </View>

                    <Text className="text-3xl font-bold text-gray-800 mb-2">Quiz Complete!</Text>
                    <Text className="text-gray-500 text-center mb-8">You have finished the quiz.</Text>

                    <View className="items-center bg-teal-50 p-6 rounded-2xl w-full mb-8">
                        <Text className="text-gray-600 mb-1">Your Score</Text>
                        <Text className="text-5xl font-bold text-teal-600">{score} / {questions.length}</Text>
                    </View>

                    <TouchableOpacity
                        className="w-full bg-teal-600 py-4 rounded-xl shadow-md flex-row justify-center items-center"
                        onPress={() => router.back()}
                    >
                        <Ionicons name="home" size={20} color="white" style={{ marginRight: 8 }} />
                        <Text className="text-white font-bold text-lg">Back to Home</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const currentQuestion = questions[currentIndex];

    return (
        <SafeAreaView className="flex-1 bg-teal-50">
            {/* Header */}
            <View className="flex-row items-center px-4 py-2 bg-teal-50 z-10">
                <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2 bg-white rounded-full shadow-sm">
                    <Ionicons name="arrow-back" size={24} color="#0D9488" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800">Quick Quiz</Text>
                <View className="flex-1 items-end">
                    <Text className="text-teal-600 font-medium text-lg">{currentIndex + 1}/{questions.length}</Text>
                </View>
            </View>

            {/* Timer Bar */}
            <GameTimer
                duration={GameConfig.MULTIPLE_CHOICE_DURATION}
                onTimeout={() => setIsCompleted(true)}
                isRunning={!loading && !isCompleted}
            />

            <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>

                {/* Question Card */}
                <View className="bg-white rounded-3xl p-8 shadow-md border-b-4 border-gray-100 mb-8 min-h-[160px] justify-center items-center">
                    <Text className="text-4xl text-gray-800 font-bold text-center tracking-wide">
                        {currentQuestion.targetWord.english}
                    </Text>
                    <Text className="text-gray-400 mt-2 font-medium uppercase tracking-wider text-xs">Choose the meaning</Text>
                </View>

                {/* Example Reveal Area */}
                {selectedOption !== null && (
                    <View className="bg-white/60 rounded-xl p-4 mb-8 border border-white/50">
                        <Text className="text-teal-900 font-medium text-lg italic text-center mb-1">
                            "{currentQuestion.targetWord.example}"
                        </Text>
                        <Text className="text-teal-500 text-sm text-center">
                            ({currentQuestion.targetWord.exampleMeaning})
                        </Text>
                    </View>
                )}

                {/* Options */}
                <View className="space-y-4">
                    {currentQuestion.options.map((option, index) => {
                        let buttonStyle = "bg-white border-b-4 border-gray-200";
                        let textStyle = "text-gray-700";
                        const isSelected = selectedOption === option;

                        if (selectedOption !== null) {
                            if (option === currentQuestion.correctOption) {
                                buttonStyle = "bg-green-100 border-b-4 border-green-500";
                                textStyle = "text-green-700 font-bold";
                            } else if (isSelected) {
                                buttonStyle = "bg-orange-100 border-b-4 border-orange-500";
                                textStyle = "text-orange-700 font-bold";
                            } else {
                                buttonStyle = "bg-gray-50 border-gray-100 opacity-60";
                                textStyle = "text-gray-400";
                            }
                        }

                        return (
                            <TouchableOpacity
                                key={index}
                                disabled={selectedOption !== null}
                                onPress={() => handleSelectOption(option)}
                                className={`p-4 rounded-xl flex-row items-center justify-center ${buttonStyle}`}
                            >
                                <View className="absolute left-4 w-8 h-8 rounded-full border-2 border-current justify-center items-center opacity-30">
                                    <Text className="font-bold text-sm">
                                        {String.fromCharCode(65 + index)}
                                    </Text>
                                </View>
                                <Text className={`text-xl ${textStyle}`}>{option}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

            </ScrollView>

            {/* Next Button Footer */}
            {selectedOption !== null && (
                <View className="p-4 bg-white border-t border-gray-100 absolute bottom-0 w-full pb-8 shadow-lg">
                    <TouchableOpacity
                        onPress={handleNext}
                        className={`w-full py-4 rounded-xl flex-row justify-center items-center ${isCorrect ? 'bg-green-500' : 'bg-teal-500' // Teal on incorrect
                            }`}
                    >
                        <Text className="text-white font-bold text-xl mr-2">Next Word</Text>
                        <Ionicons name="arrow-forward" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}
