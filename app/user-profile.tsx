import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from "react-native-chart-kit";
import { SafeAreaView } from 'react-native-safe-area-context';
import { trackingRepository, ProgressRecord, SessionRecord } from '../data/repositories/TrackingRepository';

const POSITIVE_QUOTES = [
    "You have studied for {minutes} minutes! Consistency is key.",
    "Wow! {minutes} minutes of learning. Keep it up!",
    "Great job! You've invested {minutes} minutes in yourself.",
    "{minutes} minutes learned. Every minute counts!",
    "You are doing great! {minutes} minutes of focus."
];

const ZERO_QUOTES = [
    "Ready to start? Let's learn a few words now!",
    "A journey of a thousand miles begins with a single step.",
    "Spend just 5 minutes today to build your habit.",
    "Learning is waiting for you. Let's go!",
    "No time like the present to start learning."
];

type TimeFilter = 'all' | 'last_7_days' | 'last_week' | 'last_30_days' | 'last_month';

const FILTERS: { label: string; value: TimeFilter }[] = [
    { label: 'All', value: 'all' },
    { label: '7 Days', value: 'last_7_days' },
    { label: 'Week', value: 'last_week' },
    { label: '30 Days', value: 'last_30_days' },
    { label: 'Month', value: 'last_month' },
];

export default function UserProfileScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<TimeFilter>('all');

    const [stats, setStats] = useState({
        wordsLearned: 0,
        sessionsCompleted: 0,
        timeStudiedMinutes: 0,
        todayMinutes: 0, // New Field
        wordsRemembered: 0,
        wordsMastered: 0,
    });
    const [chartData, setChartData] = useState({
        labels: [] as string[],
        wordsData: [] as number[],
        sessionsData: [] as number[]
    });
    const [quote, setQuote] = useState("");

    const getRandomQuote = (minutes: number) => {
        const list = minutes > 0 ? POSITIVE_QUOTES : ZERO_QUOTES;
        return list[Math.floor(Math.random() * list.length)].replace("{minutes}", minutes.toString());
    };

    useEffect(() => {
        loadStats();
    }, [filter]);

    const loadStats = async () => {
        setLoading(true);
        const { attempts, sessions } = await trackingRepository.getStats('all'); // Fetch all, filter locally

        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        let cutoffTime = 0;

        if (filter === 'last_7_days') cutoffTime = now - (7 * oneDay);
        if (filter === 'last_week') cutoffTime = now - (7 * oneDay);
        if (filter === 'last_30_days') cutoffTime = now - (30 * oneDay);
        if (filter === 'last_month') cutoffTime = now - (30 * oneDay);

        const filteredAttempts = attempts.filter(a => a.timestamp >= cutoffTime);
        const filteredSessions = sessions.filter(s => s.timestamp >= cutoffTime);

        // 1. Time Studied in Minutes (Filtered)
        const sessionsCount = filteredSessions.length;
        const totalSeconds = filteredSessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);
        const timeStudiedMinutes = Math.floor(totalSeconds / 60);

        // Calculate Today's Minutes
        const startOfToday = new Date().setHours(0, 0, 0, 0);
        const todaySessions = sessions.filter(s => s.timestamp >= startOfToday);
        const todaySeconds = todaySessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);
        const todayMinutes = Math.floor(todaySeconds / 60);

        // Update Quote based on the Filtered Time (or could be today, but user asked for filtered context primarily in banner, 
        // but let's base 'motivation' on the filtered view result).
        setQuote(getRandomQuote(timeStudiedMinutes));

        // Word Aggregation
        const wordMap = new Map<string, number>(); // wordId -> correct count

        filteredAttempts.forEach(a => {
            if (a.isCorrect) {
                const current = wordMap.get(a.wordId) || 0;
                wordMap.set(a.wordId, current + 1);
            }
        });

        // 2. Words Learned (>= 1 correct)
        // 3. Words Remembered (>= 3 correct)
        // 4. Words Mastered (>= 5 correct)
        let learned = 0;
        let remembered = 0;
        let mastered = 0;

        wordMap.forEach((count) => {
            if (count >= 1) learned++;
            if (count >= 3) remembered++;
            if (count >= 5) mastered++;
        });



        setStats({
            wordsLearned: learned,
            sessionsCompleted: sessionsCount,
            timeStudiedMinutes,
            todayMinutes,
            wordsRemembered: remembered,
            wordsMastered: mastered
        });

        // 5. Chart Data (Last 7 Days)
        const labels: string[] = [];
        const wordsData: number[] = [];
        const sessionsData: number[] = [];
        const daysMap = new Map<string, { words: Set<string>, sessions: number }>();

        // Initialize last 7 days map
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
            const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });

            labels.push(dayLabel);
            daysMap.set(dateStr, { words: new Set(), sessions: 0 });
        }

        // Process Attempts for Words Learned (Unique per day)
        attempts.forEach(a => {
            const dateStr = new Date(a.timestamp).toISOString().split('T')[0];
            if (daysMap.has(dateStr)) {
                if (a.isCorrect) {
                    daysMap.get(dateStr)?.words.add(a.wordId);
                }
            }
        });

        // Process Sessions
        sessions.forEach(s => {
            const dateStr = new Date(s.timestamp).toISOString().split('T')[0];
            if (daysMap.has(dateStr)) {
                const entry = daysMap.get(dateStr);
                if (entry) entry.sessions += 1;
            }
        });

        // Flatten to arrays
        // We iterate based on the init loop order, but map keys iteration order is insertion order in simple cases, 
        // better to re-iterate the 7 days to match labels index.
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const entry = daysMap.get(dateStr);
            wordsData.push(entry ? entry.words.size : 0);
            sessionsData.push(entry ? entry.sessions : 0);
        }

        setChartData({
            labels,
            wordsData,
            sessionsData
        });

        setLoading(false);
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-2 mb-4">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2 bg-gray-50 rounded-full shadow-sm">
                        <Ionicons name="arrow-back" size={24} color="#374151" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-800">Profile</Text>
                </View>
                <TouchableOpacity onPress={() => router.push('/settings' as any)} className="p-2 bg-gray-50 rounded-full shadow-sm">
                    <Ionicons name="settings-outline" size={24} color="#374151" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40, paddingTop: 12 }}>

                {/* User Info */}
                <View className="items-center mb-8">
                    <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center border-4 border-white shadow-md mb-4">
                        <Ionicons name="person" size={48} color="#3B82F6" />
                    </View>
                    <Text className="text-2xl font-bold text-gray-800">Learner</Text>
                    <Text className="text-gray-500">Keep up the good work!</Text>
                </View>

                {/* Filters - Temporarily Disabled */}
                {/* <View className="flex-row mb-8 bg-gray-50 p-1 rounded-xl">
                    {FILTERS.map((f) => (
                        <TouchableOpacity
                            key={f.value}
                            onPress={() => setFilter(f.value)}
                            className={`flex-1 py-2 rounded-lg items-center ${filter === f.value ? 'bg-white shadow-sm' : ''}`}
                        >
                            <Text className={`font-bold text-xs ${filter === f.value ? 'text-blue-600' : 'text-gray-400'}`}>
                                {f.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View> */}

                {/* Time Studied Banner */}
                {/* Time Studied Banner */}
                <View className={`w-full p-6 rounded-3xl mb-8 shadow-sm border ${stats.timeStudiedMinutes > 0 ? 'bg-purple-100 border-purple-200' : 'bg-gray-100 border-gray-200'}`}>
                    <Text className={`text-lg font-bold mb-4 ${stats.timeStudiedMinutes > 0 ? 'text-purple-800' : 'text-gray-700'}`}>
                        {quote}
                    </Text>

                    <View className="flex-row divide-x divide-gray-300">
                        {/* Filtered Period Stats */}
                        <View className="flex-1 pr-4">
                            <Text className="text-gray-500 text-xs uppercase font-bold mb-1">
                                {filter === 'all' ? 'All Time' : 'Selected Period'}
                            </Text>
                            <View className="flex-row items-baseline">
                                <Text className={`text-3xl font-extrabold mr-1 ${stats.timeStudiedMinutes > 0 ? 'text-purple-900' : 'text-gray-400'}`}>
                                    {stats.timeStudiedMinutes}
                                </Text>
                                <Text className="text-gray-500 font-medium">min</Text>
                            </View>
                        </View>

                        {/* Today Stats */}
                        <View className="flex-1 pl-4">
                            <Text className="text-gray-500 text-xs uppercase font-bold mb-1">Today</Text>
                            <View className="flex-row items-baseline">
                                <Text className={`text-3xl font-extrabold mr-1 ${stats.todayMinutes > 0 ? 'text-blue-900' : 'text-gray-400'}`}>
                                    {stats.todayMinutes}
                                </Text>
                                <Text className="text-gray-500 font-medium">min</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Stats Grid */}
                <View className="flex-row flex-wrap gap-4 mb-8">
                    {/* Words Learned */}
                    <View className="w-[47%] bg-blue-50 p-4 rounded-2xl border border-blue-100">
                        <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mb-3">
                            <Ionicons name="book" size={20} color="#2563EB" />
                        </View>
                        <Text className="text-3xl font-bold text-gray-800 mb-1">{stats.wordsLearned}</Text>
                        <Text className="text-gray-500 text-xs font-medium">Words Learned</Text>
                    </View>

                    {/* Sessions Completed (Replaced Time Studied) */}
                    <View className="w-[47%] bg-purple-50 p-4 rounded-2xl border border-purple-100">
                        <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mb-3">
                            <Ionicons name="layers" size={20} color="#7C3AED" />
                        </View>
                        <Text className="text-3xl font-bold text-gray-800 mb-1">{stats.sessionsCompleted}</Text>
                        <Text className="text-gray-500 text-xs font-medium">Sessions Done</Text>
                    </View>

                    {/* Words Remembered */}
                    <View className="w-[47%] bg-orange-50 p-4 rounded-2xl border border-orange-100">
                        <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mb-3">
                            <Ionicons name="flame" size={20} color="#EA580C" />
                        </View>
                        <Text className="text-3xl font-bold text-gray-800 mb-1">{stats.wordsRemembered}</Text>
                        <Text className="text-gray-500 text-xs font-medium">Remembered (3+)</Text>
                    </View>

                    {/* Words Mastered */}
                    <View className="w-[47%] bg-green-50 p-4 rounded-2xl border border-green-100">
                        <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mb-3">
                            <Ionicons name="medal" size={20} color="#16A34A" />
                        </View>
                        <Text className="text-3xl font-bold text-gray-800 mb-1">{stats.wordsMastered}</Text>
                        <Text className="text-gray-500 text-xs font-medium">Mastered (5+)</Text>
                    </View>
                </View>

                {/* Activity Chart */}
                <View className="bg-white pl-2 pr-4 py-4 rounded-2xl border border-gray-100 shadow-sm mb-8">
                    <Text className="text-lg font-bold text-gray-800 mb-4 ml-2">
                        Last 7 Days Activity
                    </Text>

                    <View style={{ overflow: "hidden" }}>
                        {chartData.labels.length > 0 ? (
                            <LineChart
                                data={{
                                    labels: chartData.labels,
                                    datasets: [
                                        {
                                            data: chartData.wordsData,
                                            color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
                                            strokeWidth: 2,
                                        },
                                        {
                                            data: chartData.sessionsData,
                                            color: (opacity = 1) => `rgba(124, 58, 237, ${opacity})`,
                                            strokeWidth: 2,
                                        },
                                    ],
                                    legend: ["Words Learned", "Sessions Done"],
                                }}
                                width={Dimensions.get("window").width - 20}
                                height={220}
                                chartConfig={{
                                    backgroundColor: "#ffffff",
                                    backgroundGradientFrom: "#ffffff",
                                    backgroundGradientTo: "#ffffff",
                                    decimalPlaces: 0,
                                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                                    style: {
                                        borderRadius: 16,
                                    },
                                    propsForDots: {
                                        r: "4",
                                        strokeWidth: "2",
                                        stroke: "#fff",
                                    },
                                }}
                                bezier
                                style={{
                                    marginVertical: 0,
                                    borderRadius: 16,
                                    marginLeft: -32,
                                }}
                            />
                        ) : (
                            <View className="h-[220px] items-center justify-center">
                                <Text className="text-gray-400">
                                    Not enough data to display chart
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
