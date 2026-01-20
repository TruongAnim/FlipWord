import { settingsRepository } from '../data/repositories/SettingsRepository';
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
    runOnJS
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
    const router = useRouter();
    const progress = useSharedValue(0);
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.8);

    const checkLanguageAndNavigate = async () => {
        const hasLanguage = await settingsRepository.isLanguageSet();
        if (hasLanguage) {
            router.replace('/home');
        } else {
            router.replace('/language?initial=true');
        }
    };

    useEffect(() => {
        // Start animations
        opacity.value = withTiming(1, { duration: 800 });
        scale.value = withTiming(1, {
            duration: 800,
            easing: Easing.out(Easing.back(1.5))
        });

        // Progress bar animation
        progress.value = withTiming(width * 0.7, {
            duration: 1200,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        }, (finished) => {
            if (finished) {
                runOnJS(checkLanguageAndNavigate)();
            }
        });
    }, []);

    const animatedLogoStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
            transform: [{ scale: scale.value }],
        };
    });

    const animatedProgressStyle = useAnimatedStyle(() => {
        return {
            width: progress.value,
        };
    });

    return (
        <SafeAreaView className="flex-1 bg-white items-center justify-between py-12">
            <StatusBar style="dark" />

            {/* Top Spacer */}
            <View />

            {/* Center Content: Logo & Name */}
            <Animated.View style={[styles.centerContainer, animatedLogoStyle]}>
                <View className="w-32 h-32 bg-white rounded-3xl shadow-lg shadow-blue-200 items-center justify-center mb-6 border border-blue-50">
                    {/* Using the icon as logo */}
                    <Image
                        source={require('../assets/images/icon.png')}
                        style={{ width: 100, height: 100, borderRadius: 20 }}
                        contentFit="contain"
                    />
                </View>

                <Text className="text-4xl font-extrabold text-blue-600 tracking-tighter">
                    FlipWord
                </Text>
                <Text className="text-slate-400 font-medium text-lg mt-2 tracking-wide">
                    Master Vocabulary Daily
                </Text>
            </Animated.View>

            {/* Footer: Progress Bar */}
            <View className="mb-10 w-full items-center">
                <View className="flex-row items-center mb-3">
                    <Text className="text-slate-400 text-xs font-semibold uppercase tracking-widest mr-2">Loading values</Text>
                </View>

                {/* Progress Track */}
                <View className="h-2 bg-slate-100 rounded-full overflow-hidden" style={{ width: width * 0.7 }}>
                    {/* Progress Indicator */}
                    <Animated.View className="h-full bg-blue-500 rounded-full" style={animatedProgressStyle} />
                </View>

                <Text className="text-slate-300 text-[10px] mt-4">
                    v1.0.0
                </Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    centerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});
