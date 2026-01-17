import React from 'react';
import { StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';
import { Word } from '../../data/models/Word';

interface FlipCardProps {
    word: Word;
    displayMode?: 'en-vi' | 'vi-en';
}

export default function FlipCard({ word, displayMode = 'en-vi' }: FlipCardProps) {
    const isFlipped = useSharedValue(0);

    const handlePress = () => {
        isFlipped.value = withTiming(isFlipped.value ? 0 : 1, { duration: 300 });
    };

    const frontAnimatedStyle = useAnimatedStyle(() => {
        const rotateValue = interpolate(isFlipped.value, [0, 1], [0, 180]);
        return {
            transform: [
                { rotateY: `${rotateValue}deg` },
            ],
            backfaceVisibility: 'hidden',
        };
    });

    const backAnimatedStyle = useAnimatedStyle(() => {
        const rotateValue = interpolate(isFlipped.value, [0, 1], [180, 360]);
        return {
            transform: [
                { rotateY: `${rotateValue}deg` },
            ],
            backfaceVisibility: 'hidden',
        };
    });

    const FrontContent = () => {
        if (displayMode === 'en-vi') {
            return <Text className="text-4xl font-bold text-gray-800 text-center">{word.english}</Text>;
        }
        return <Text className="text-4xl font-bold text-gray-800 text-center">{word.vietnamese.split(',')[0].trim()}</Text>;
    };

    const BackContent = () => {
        if (displayMode === 'en-vi') {
            return (
                <>
                    <Text className="text-3xl font-bold text-white mb-2 text-center">{word.vietnamese.split(',')[0].trim()}</Text>
                    <View className="w-16 h-1 bg-white/30 rounded-full my-4" />
                    <Text className="text-lg text-white font-medium text-center italic">"{word.example}"</Text>
                    <Text className="text-sm text-blue-100 text-center mt-2">({word.exampleMeaning})</Text>
                </>
            )
        }
        return (
            <>
                <Text className="text-3xl font-bold text-white mb-2 text-center">{word.english}</Text>
                <View className="w-16 h-1 bg-white/30 rounded-full my-4" />
                <Text className="text-lg text-white font-medium text-center italic">"{word.example}"</Text>
                <Text className="text-sm text-blue-100 text-center mt-2">({word.exampleMeaning})</Text>
            </>
        )
    };

    return (
        <TouchableWithoutFeedback onPress={handlePress}>
            <View className="w-full h-96 relative">
                <Animated.View
                    style={[styles.card, frontAnimatedStyle]}
                    className="absolute w-full h-full bg-white rounded-3xl shadow-xl items-center justify-center p-6 border-2 border-blue-50"
                >
                    <FrontContent />
                    <Text className="text-gray-400 mt-4 text-sm font-medium uppercase tracking-widest">Tap to flip</Text>
                </Animated.View>

                <Animated.View
                    style={[styles.card, backAnimatedStyle]}
                    className="absolute w-full h-full bg-blue-500 rounded-3xl shadow-xl items-center justify-center p-6"
                >
                    <BackContent />
                </Animated.View>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    card: {
        backfaceVisibility: 'hidden',
    }
})
