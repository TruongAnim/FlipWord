import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Word } from '../data/models/Word';
import { wordRepository } from '../data/repositories/WordRepository';

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
    options: string[]; // List of 4 English words
    correctOption: string;
}

export default function ReverseMultipleChoiceScreen() {
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

        const newQuestions: Question[] = shuffledWords.map((targetWord) => {
            // Pick 3 random distractors
            const otherWords = allWords.filter(w => w.id !== targetWord.id);
            const distractors = shuffleArray(otherWords).slice(0, 3).map(w => w.english);

            // Target option is the English word
            const targetOption = targetWord.english;

            const options = shuffleArray([targetOption, ...distractors]);

            return {
                targetWord,
                options,
                correctOption: targetOption
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
                <ActivityIndicator size="large" color="#F97316" />
            </View>
        );
    }

    if (isCompleted) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center p-6">
                <View className="items-center w-full max-w-sm">
                    <View className="mb-8 p-6 bg-orange-50 rounded-full">
                        <Ionicons name="trophy" size={80} color="#F97316" />
                    </View>

                    <Text className="text-3xl font-bold text-gray-800 mb-2">Quiz Complete!</Text>
                    <Text className="text-gray-500 text-center mb-8">You have finished the quiz.</Text>

                    <View className="items-center bg-orange-50 p-6 rounded-2xl w-full mb-8">
                        <Text className="text-gray-600 mb-1">Your Score</Text>
                        <Text className="text-5xl font-bold text-orange-600">{score} / {questions.length}</Text>
                    </View>

                    <TouchableOpacity
                        className="w-full bg-orange-600 py-4 rounded-xl shadow-md flex-row justify-center items-center"
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
        <SafeAreaView className="flex-1 bg-orange-50">
            {/* Header */}
            <View className="flex-row items-center px-4 py-2 bg-orange-50 z-10">
                <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2 bg-white rounded-full shadow-sm">
                    <Ionicons name="arrow-back" size={24} color="#EA580C" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800">Word Hunter</Text>
                <View className="flex-1 items-end">
                    <Text className="text-orange-600 font-medium">{currentIndex + 1}/{questions.length}</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>

                {/* Question Card */}
                <View className="bg-white rounded-3xl p-8 shadow-md border-b-4 border-gray-100 mb-8 min-h-[160px] justify-center items-center">
                    <Text className="text-3xl text-gray-800 font-bold text-center tracking-wide leading-tight">
                        {currentQuestion.targetWord.vietnamese.split(',')[0].trim()}
                    </Text>
                    <Text className="text-gray-400 mt-4 font-medium uppercase tracking-wider text-xs">Choose the English word</Text>
                </View>

                {/* Example Reveal Area */}
                {selectedOption !== null && (
                    <View className="bg-white/60 rounded-xl p-4 mb-8 border border-white/50">
                        <Text className="text-orange-900 font-medium text-lg italic text-center mb-1">
                            "{currentQuestion.targetWord.example}"
                        </Text>
                        <Text className="text-orange-700 text-sm text-center">
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
                                buttonStyle = "bg-red-100 border-b-4 border-red-500";
                                textStyle = "text-red-700 font-bold";
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
                        className={`w-full py-4 rounded-xl flex-row justify-center items-center ${isCorrect ? 'bg-green-500' : 'bg-orange-500'
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
