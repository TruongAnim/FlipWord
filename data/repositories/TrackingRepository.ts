import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ProgressRecord {
    id: string;
    wordId: string;
    timestamp: number;
    isCorrect: boolean;
    feature: string;
}

export interface SessionRecord {
    id: string;
    timestamp: number;
    durationSeconds: number;
    feature: string;
}

const ATTEMPTS_KEY = 'flipword_attempts';
const SESSIONS_KEY = 'flipword_sessions';

export const trackingRepository = {
    async logAttempt(wordId: string, isCorrect: boolean, feature: string) {
        const record: ProgressRecord = {
            id: Date.now().toString() + Math.random().toString(),
            wordId,
            timestamp: Date.now(),
            isCorrect,
            feature
        };

        try {
            const existing = await AsyncStorage.getItem(ATTEMPTS_KEY);
            const attempts = existing ? JSON.parse(existing) : [];
            attempts.push(record);
            await AsyncStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
            return record;
        } catch (e) {
            console.error('Failed to log attempt', e);
        }
    },

    async logSession(durationSeconds: number, feature: string) {
        const record: SessionRecord = {
            id: Date.now().toString() + Math.random().toString(),
            timestamp: Date.now(),
            durationSeconds,
            feature
        };

        try {
            const existing = await AsyncStorage.getItem(SESSIONS_KEY);
            const sessions = existing ? JSON.parse(existing) : [];
            sessions.push(record);
            await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
            return record;
        } catch (e) {
            console.error('Failed to log session', e);
        }
    },

    async getStats(filter: 'all' | 'last_7_days' | 'last_week' | 'last_30_days' | 'last_month') {
        // Need basic date utils here.
        // For MVP, just fetching all and calculating in memory for now.
        try {
            const attemptsJson = await AsyncStorage.getItem(ATTEMPTS_KEY) || '[]';
            const sessionsJson = await AsyncStorage.getItem(SESSIONS_KEY) || '[]';

            const attempts: ProgressRecord[] = JSON.parse(attemptsJson);
            const sessions: SessionRecord[] = JSON.parse(sessionsJson);

            return { attempts, sessions };
        } catch (e) {
            console.error(e);
            return { attempts: [], sessions: [] };
        }
    },

    // For debugging/reset
    async clearData() {
        await AsyncStorage.multiRemove([ATTEMPTS_KEY, SESSIONS_KEY]);
    }
};
