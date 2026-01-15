import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    Extrapolation,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { Word } from '../../data/models/Word';
import FlipCard from './FlipCard';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface SwipeDeckProps {
    words: Word[];
    onSwipeRight: (word: Word) => void;
    onSwipeLeft: (word: Word) => void;
    onFinish?: () => void;
}

export default function SwipeDeck({ words, onSwipeRight, onSwipeLeft, onFinish }: SwipeDeckProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const scale = useSharedValue(1);

    // Reset function to be called when index changes
    const resetPosition = () => {
        translateX.value = 0;
        translateY.value = 0;
        scale.value = 1;
    };

    const handleNextCard = (direction: 'left' | 'right') => {
        const currentWord = words[currentIndex];
        if (direction === 'right') {
            onSwipeRight(currentWord);
        } else {
            onSwipeLeft(currentWord);
        }

        if (currentIndex < words.length - 1) {
            setCurrentIndex((prev) => prev + 1);
            resetPosition();
        } else {
            if (onFinish) onFinish();
        }
    };

    const gesture = Gesture.Pan()
        .onUpdate((event) => {
            translateX.value = event.translationX;
            translateY.value = event.translationY;
            // Slight scale down when swiping
            scale.value = interpolate(
                Math.abs(event.translationX),
                [0, SCREEN_WIDTH / 2],
                [1, 0.95],
                Extrapolation.CLAMP
            );
        })
        .onEnd((event) => {
            if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
                // Swipe detected
                const direction = event.translationX > 0 ? 'right' : 'left';
                const targetX = direction === 'right' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;

                translateX.value = withTiming(targetX, { duration: 300 }, () => {
                    runOnJS(handleNextCard)(direction);
                });
            } else {
                // Return to center
                translateX.value = withSpring(0);
                translateY.value = withSpring(0);
                scale.value = withSpring(1);
            }
        });

    const cardStyle = useAnimatedStyle(() => {
        const rotate = interpolate(
            translateX.value,
            [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
            [-15, 0, 15]
        );

        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { rotate: `${rotate}deg` },
                { scale: scale.value }
            ],
        };
    });

    const nextCardStyle = useAnimatedStyle(() => {
        const s = interpolate(
            Math.abs(translateX.value),
            [0, SCREEN_WIDTH * 0.8],
            [0.9, 1],
            Extrapolation.CLAMP
        );
        return {
            transform: [{ scale: s }],
            opacity: s
        }
    })

    // Overlay opacity styles
    const likeOpacityStyle = useAnimatedStyle(() => ({
        opacity: interpolate(translateX.value, [0, SCREEN_WIDTH / 4], [0, 1])
    }));

    const nopeOpacityStyle = useAnimatedStyle(() => ({
        opacity: interpolate(translateX.value, [-SCREEN_WIDTH / 4, 0], [1, 0])
    }));


    if (currentIndex >= words.length) {
        return (
            <View className="flex-1 items-center justify-center p-6">
                <View className="bg-white p-8 rounded-3xl items-center shadow-lg w-full">
                    <Ionicons name="checkmark-circle" size={64} color="#10B981" />
                    <Text className="text-2xl font-bold text-gray-800 mt-4 text-center">All Done!</Text>
                    <Text className="text-gray-500 text-center mt-2">You've reviewed all cards for today.</Text>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1 items-center justify-center">

            {/* Next Card (Behind) */}
            {currentIndex < words.length - 1 && (
                <Animated.View style={[styles.cardContainer, nextCardStyle]} className="absolute">
                    <FlipCard word={words[currentIndex + 1]} />
                </Animated.View>
            )}

            {/* Top Card */}
            <GestureDetector gesture={gesture}>
                <Animated.View style={[styles.cardContainer, cardStyle]}>
                    <FlipCard word={words[currentIndex]} />

                    {/* Like Overlay */}
                    <Animated.View style={[styles.overlay, { left: 40, top: 40, borderColor: '#10B981', transform: [{ rotate: '-30deg' }] }, likeOpacityStyle]}>
                        <Text className="text-4xl font-extrabold text-green-500 bg-transparent">KNOW</Text>
                    </Animated.View>

                    {/* Nope Overlay */}
                    <Animated.View style={[styles.overlay, { right: 40, top: 40, borderColor: '#EF4444', transform: [{ rotate: '30deg' }] }, nopeOpacityStyle]}>
                        <Text className="text-4xl font-extrabold text-red-500 bg-transparent">FORGOT</Text>
                    </Animated.View>

                </Animated.View>
            </GestureDetector>

            <View className="absolute bottom-10 flex-row gap-8 w-full justify-center">
                <Text className="text-gray-400 font-medium">{currentIndex + 1} / {words.length}</Text>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        width: SCREEN_WIDTH * 0.9,
        alignItems: 'center',
        justifyContent: 'center',
    },
    overlay: {
        position: 'absolute',
        borderWidth: 4,
        borderRadius: 12,
        paddingHorizontal: 8,
        zIndex: 10
    }
});
