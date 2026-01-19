import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface GameTimerProps {
    duration: number; // in seconds
    onTimeout: () => void;
    isRunning?: boolean;
}

export const GameTimer: React.FC<GameTimerProps> = ({ duration, onTimeout, isRunning = true }) => {
    const [timeLeft, setTimeLeft] = useState(duration);

    useEffect(() => {
        if (!isRunning) return;

        if (timeLeft <= 0) {
            onTimeout();
            return;
        }

        const timerId = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerId);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerId);
    }, [timeLeft, isRunning, onTimeout]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    // Determine color based on time left (urgency)
    const getColor = () => {
        if (timeLeft < 30) return 'text-red-600 bg-red-50 border-red-200';
        if (timeLeft < 60) return 'text-orange-600 bg-orange-50 border-orange-200';
        return 'text-blue-600 bg-blue-50 border-blue-200';
    };

    const style = getColor();

    return (
        <View className="w-full items-center py-2 bg-white">
            <View className={`flex-row items-center px-6 py-2 rounded-full border ${style.split(' ').slice(1).join(' ')}`}>
                <Ionicons
                    name="time"
                    size={20}
                    color={timeLeft < 30 ? '#DC2626' : timeLeft < 60 ? '#EA580C' : '#2563EB'}
                    style={{ marginRight: 8 }}
                />
                <Text className={`font-mono text-xl font-bold ${style.split(' ')[0]}`}>
                    {formatTime(timeLeft)}
                </Text>
            </View>
        </View>
    );
};
