import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_KEY = 'flipword_language';

export type LanguageCode = 'vi' | 'fr' | 'es' | 'pt' | 'de';

export const SUPPORTED_LANGUAGES: { code: LanguageCode; name: string; flag: string }[] = [
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

export const settingsRepository = {
    async getLanguage(): Promise<LanguageCode> {
        try {
            const lang = await AsyncStorage.getItem(LANGUAGE_KEY);
            return (lang as LanguageCode) || 'vi';
        } catch (e) {
            return 'vi';
        }
    },

    async setLanguage(lang: LanguageCode) {
        try {
            await AsyncStorage.setItem(LANGUAGE_KEY, lang);
        } catch (e) {
            console.error(e);
        }
    },

    async isLanguageSet(): Promise<boolean> {
        try {
            const lang = await AsyncStorage.getItem(LANGUAGE_KEY);
            return lang !== null;
        } catch (e) {
            return false;
        }
    }
};
