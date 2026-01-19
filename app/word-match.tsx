import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View, Vibration, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

interface MatchItem {
    id: string; // The Word ID
    text: string;
    side: 'english' | 'vietnamese';
}

const MATCH_FADE_OUT_DURATION = 4000;
const NEW_WORD_FADE_IN_DURATION = 300;

export default function WordMatchScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    // Data Queues
    const remainingWordsRef = useRef<any[]>([]); // Queue of words

    // Slots (Fixed size 6)
    // We store the MatchItem directly. If null, slot is empty.
    const [englishSlots, setEnglishSlots] = useState<(MatchItem | null)[]>([]);
    const [vietnameseSlots, setVietnameseSlots] = useState<(MatchItem | null)[]>([]);

    // Game State
    const [selectedItem, setSelectedItem] = useState<MatchItem | null>(null);
    const [fadingIds, setFadingIds] = useState<Set<string>>(new Set());
    const [mistakes, setMistakes] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [totalPairs, setTotalPairs] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);

    // Animation Opacity Map: ID -> Animated.Value
    // We use a ref to hold animated values to persist them across renders without re-initializing
    const opacityMap = useRef<Map<string, Animated.Value>>(new Map()).current;

    useEffect(() => {
        loadGame();
    }, []);

    const getOpacity = (id: string) => {
        if (!opacityMap.has(id)) {
            opacityMap.set(id, new Animated.Value(1));
        }
        return opacityMap.get(id)!;
    };

    const loadGame = async () => {
        setLoading(true);
        const allWords = await wordRepository.getWords('en-vi');
        setTotalPairs(allWords.length);

        // Shuffle all words
        const shuffledAll = shuffleArray([...allWords]);

        // Take first 6 for initial slots
        const initialWords = shuffledAll.slice(0, 6);
        remainingWordsRef.current = shuffledAll.slice(6);

        // Setup initial slots
        // We shuffle the initial 6 so the left/right don't align perfectly at start?
        // Actually, we want Random Slots. 
        // English[0] might match Vietnamese[3].

        const eng: MatchItem[] = initialWords.map(w => ({ id: w.id, text: w.english, side: 'english' }));
        const vi: MatchItem[] = initialWords.map(w => ({ id: w.id, text: w.vietnamese.split(',')[0].trim(), side: 'vietnamese' }));

        setEnglishSlots(shuffleArray([...eng]));
        setVietnameseSlots(shuffleArray([...vi]));

        setFadingIds(new Set());
        setMistakes(0);
        setCorrectCount(0);
        setSelectedItem(null);
        opacityMap.clear();
        setLoading(false);
    };

    const handleSelect = (item: MatchItem) => {
        // Ignore if fading or already matched logic handled by UI removal
        if (fadingIds.has(item.id)) return;

        if (!selectedItem) {
            setSelectedItem(item);
            return;
        }

        if (selectedItem.side === item.side && selectedItem.id === item.id) {
            setSelectedItem(null);
            return;
        }

        if (selectedItem.side === item.side) {
            setSelectedItem(item);
            return;
        }

        if (selectedItem.id === item.id) {
            handleMatch(item.id);
        } else {
            handleMismatch();
        }
    };

    const handleMatch = (id: string) => {
        setSelectedItem(null);
        setCorrectCount(prev => prev + 1);

        // Start Fade Out
        const anim = getOpacity(id);

        // Mark as fading to disable interaction and trigger blue style
        setFadingIds(prev => new Set(prev).add(id));

        Animated.timing(anim, {
            toValue: 0,
            duration: MATCH_FADE_OUT_DURATION,
            useNativeDriver: true
        }).start(() => {
            replaceWord(id);
        });
    };

    const replaceWord = (oldId: string) => {
        // Remove from fading
        setFadingIds(prev => {
            const next = new Set(prev);
            next.delete(oldId);
            return next;
        });

        // Check if game over (no new words and slots empty)
        // Actually we check if all are matched.

        // Get new word
        const newWordData = remainingWordsRef.current.shift();

        let shouldComplete = false;

        const updateSlot = (slots: (MatchItem | null)[], side: 'english' | 'vietnamese') => {
            return slots.map(slot => {
                if (slot && slot.id === oldId) {
                    if (newWordData) {
                        // Replace with new word
                        const newItem: MatchItem = side === 'english'
                            ? { id: newWordData.id, text: newWordData.english, side }
                            : { id: newWordData.id, text: newWordData.vietnamese.split(',')[0].trim(), side };

                        // Reset opacity for new ID
                        getOpacity(newWordData.id).setValue(0);
                        Animated.timing(getOpacity(newWordData.id), {
                            toValue: 1,
                            duration: NEW_WORD_FADE_IN_DURATION,
                            useNativeDriver: true
                        }).start();

                        return newItem;
                    } else {
                        return null; // Empty slot
                    }
                }
                return slot;
            });
        };

        const newEng = updateSlot(englishSlots, 'english');
        const newVi = updateSlot(vietnameseSlots, 'vietnamese');

        setEnglishSlots(newEng);
        setVietnameseSlots(newVi);

        // Check completion
        // If no items left in slots
        const allNull = newEng.every(s => s === null) && newVi.every(s => s === null);
        if (allNull) {
            setIsCompleted(true);
        }

        // Cleanup old opacity
        opacityMap.delete(oldId);
    };

    const handleMismatch = () => {
        setMistakes(prev => prev + 1);
        Vibration.vibrate();
        setSelectedItem(null);
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color="#EC4899" />
            </View>
        );
    }

    if (isCompleted) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center p-6">
                <View className="items-center w-full max-w-sm">
                    <View className="mb-8 p-6 bg-pink-50 rounded-full">
                        <Ionicons name="heart" size={80} color="#EC4899" />
                    </View>

                    <Text className="text-3xl font-bold text-gray-800 mb-2">All Clear!</Text>
                    <Text className="text-gray-500 text-center mb-8">You matched all {totalPairs} pairs.</Text>

                    <View className="flex-row justify-between w-full mb-8 space-x-4">
                        <View className="flex-1 items-center bg-green-50 p-4 rounded-2xl">
                            <Text className="text-gray-600 mb-1">Correct</Text>
                            <Text className="text-3xl font-bold text-green-600">{correctCount}</Text>
                        </View>

                        <View className="flex-1 items-center bg-red-50 p-4 rounded-2xl">
                            <Text className="text-gray-600 mb-1">Mistakes</Text>
                            <Text className="text-3xl font-bold text-red-600">{mistakes}</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        className="w-full bg-pink-600 py-4 rounded-xl shadow-md flex-row justify-center items-center"
                        onPress={() => router.back()}
                    >
                        <Ionicons name="home" size={20} color="white" style={{ marginRight: 8 }} />
                        <Text className="text-white font-bold text-lg">Back to Home</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const renderCard = (item: MatchItem | null, index: number) => {
        if (!item) {
            // Empty placeholder to keep layout stable
            return <View key={`empty-${index}`} className="h-24 m-1" />;
        }

        const isSelected = selectedItem?.side === item.side && selectedItem?.id === item.id;
        const isFading = fadingIds.has(item.id);
        const opacity = getOpacity(item.id);

        let bgStyle = "bg-white";
        let borderStyle = "border-pink-100";
        let textStyle = "text-gray-700";

        if (isFading) {
            bgStyle = "bg-blue-100";
            borderStyle = "border-blue-500";
            textStyle = "text-blue-800 font-bold";
        } else if (isSelected) {
            bgStyle = "bg-pink-100";
            borderStyle = "border-pink-500";
            textStyle = "text-pink-700 font-bold";
        }

        return (
            <Animated.View
                key={item.id}
                style={{ opacity }}
                className="flex-1"
            >
                <TouchableOpacity
                    onPress={() => handleSelect(item)}
                    disabled={isFading}
                    className={`h-24 justify-center items-center rounded-xl border-2 shadow-sm p-2 m-1 ${bgStyle} ${borderStyle}`}
                >
                    <Text className={`text-center font-medium ${textStyle} ${item.text.length > 15 ? 'text-xs' : 'text-sm'}`}>
                        {item.text}
                    </Text>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-pink-50">
            {/* Header */}
            <View className="flex-row items-center px-4 py-2 bg-pink-50 z-10 justify-between">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2 bg-white rounded-full shadow-sm">
                        <Ionicons name="arrow-back" size={24} color="#DB2777" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-800 ml-2">Power Matching</Text>
                </View>

                <View className="flex-row space-x-2">
                    <View className="bg-white px-3 py-1 rounded-full border border-red-100">
                        <Text className="text-red-500 font-bold text-xs">Mistakes: {mistakes}</Text>
                    </View>
                    <View className="bg-white px-3 py-1 rounded-full border border-green-100">
                        <Text className="text-green-600 font-bold text-xs">Correct: {correctCount}/{totalPairs}</Text>
                    </View>
                </View>
            </View>

            <View className="flex-1 p-4 flex-row">
                {/* Left Column (English) */}
                <View className="flex-1 pr-1">
                    {englishSlots.map((item, index) => renderCard(item, index))}
                </View>

                {/* Right Column (Vietnamese) */}
                <View className="flex-1 pl-1">
                    {vietnameseSlots.map((item, index) => renderCard(item, index))}
                </View>
            </View>

        </SafeAreaView>
    );
}
