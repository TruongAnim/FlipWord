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

// Interface for a single question round
interface Question {
    targetWord: Word;
    options: string[]; // List of 4 english words
    correctOption: string;
}

export default function FillBlankScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Game State
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null); // null: not answered, true: correct, false: incorrect
    const [score, setScore] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);

    useEffect(() => {
        loadGame();
    }, []);

    const loadGame = async () => {
        setLoading(true);
        const allWords = await wordRepository.getWords('en-vi'); // Mode doesn't strictly matter here as we use single source now

        // Shuffle words to get random questions
        const shuffledWords = shuffleArray([...allWords]);

        // Generate questions
        const newQuestions: Question[] = shuffledWords.map((targetWord) => {
            // Pick 3 random distractors distinct from target
            const otherWords = allWords.filter(w => w.id !== targetWord.id);
            const distractors = shuffleArray(otherWords).slice(0, 3).map(w => w.english);

            const options = shuffleArray([targetWord.english, ...distractors]);

            return {
                targetWord,
                options,
                correctOption: targetWord.english
            };
        });

        setQuestions(newQuestions);
        setLoading(false);
    };

    const handleSelectOption = (option: string) => {
        if (selectedOption !== null) return; // Prevent re-selection

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

    // Helper to get sentence parts
    const getSentenceParts = (word: Word) => {
        const regex = new RegExp(`\\b${word.english}\\b`, 'i');
        const match = word.example.match(regex);

        if (!match) {
            // Fallback if regex fails (shouldn't happen with valid data)
            return {
                before: word.example,
                target: '',
                after: ''
            };
        }

        const index = match.index!;
        const before = word.example.slice(0, index);
        const target = word.example.slice(index, index + word.english.length); // Keep original casing
        const after = word.example.slice(index + word.english.length);

        return { before, target, after };
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
                    <View className="mb-8 p-6 bg-blue-50 rounded-full">
                        <Ionicons name="star" size={80} color="#F59E0B" />
                    </View>

                    <Text className="text-3xl font-bold text-gray-800 mb-2">Practice Complete!</Text>
                    <Text className="text-gray-500 text-center mb-8">You have finished all sentences.</Text>

                    <View className="items-center bg-blue-50 p-6 rounded-2xl w-full mb-8">
                        <Text className="text-gray-600 mb-1">Your Score</Text>
                        <Text className="text-5xl font-bold text-blue-600">{score} / {questions.length}</Text>
                    </View>

                    <TouchableOpacity
                        className="w-full bg-blue-600 py-4 rounded-xl shadow-md flex-row justify-center items-center"
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
    const { before, target, after } = getSentenceParts(currentQuestion.targetWord);

    return (
        <SafeAreaView className="flex-1 bg-blue-50">
            {/* Header */}
            <View className="flex-row items-center px-4 py-2 bg-blue-50 z-10">
                <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2 bg-white rounded-full shadow-sm">
                    <Ionicons name="arrow-back" size={24} color="#1E40AF" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800">Context Master</Text>
                <View className="flex-1 items-end">
                    <Text className="text-blue-600 font-medium">{currentIndex + 1}/{questions.length}</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>

                {/* Sentence Card */}
                <View className="bg-white rounded-3xl p-6 shadow-md border-b-4 border-gray-100 mb-8 min-h-[200px] justify-center">
                    <Text className="text-lg text-gray-500 font-medium mb-6 text-center italic">
                        "{currentQuestion.targetWord.exampleMeaning}"
                    </Text>

                    <View className="flex-row flex-wrap justify-center items-end">
                        <Text className="text-2xl text-gray-800 font-medium leading-10 text-center">
                            {before}
                            {selectedOption !== null && isCorrect ? (
                                <Text className="text-green-600 font-bold underline decoration-2 decoration-green-500">
                                    {target}
                                </Text>
                            ) : (
                                <Text className="text-blue-400 font-bold">_______</Text>
                            )}
                            {after}
                        </Text>
                    </View>
                </View>

                {/* Options */}
                <View className="space-y-4">
                    {currentQuestion.options.map((option, index) => {
                        let buttonStyle = "bg-white border-b-4 border-gray-200";
                        let textStyle = "text-gray-700";
                        const isSelected = selectedOption === option;

                        if (selectedOption !== null) {
                            if (option === currentQuestion.correctOption) {
                                // Correct answer always turns green if game over for this round
                                buttonStyle = "bg-green-100 border-b-4 border-green-500";
                                textStyle = "text-green-700 font-bold";
                            } else if (isSelected) {
                                // Wrong selection
                                buttonStyle = "bg-orange-100 border-b-4 border-orange-500";
                                textStyle = "text-orange-700 font-bold";
                            } else {
                                // Unselected and not correct -> fade out
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
                        <Text className="text-white font-bold text-xl mr-2">Next Question</Text>
                        <Ionicons name="arrow-forward" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}
