import React, { createContext, useContext, useEffect, useState } from 'react';
import { LanguageCode, settingsRepository, SUPPORTED_LANGUAGES } from '../data/repositories/SettingsRepository';
import { Word } from '../data/models/Word';

interface LanguageContextType {
    language: LanguageCode;
    setLanguage: (lang: LanguageCode) => Promise<void>;
    getWordDefinition: (word: Word) => string;
    getWordExampleMeaning: (word: Word) => string;
}

const LanguageContext = createContext<LanguageContextType>({
    language: 'vi',
    setLanguage: async () => { },
    getWordDefinition: () => '',
    getWordExampleMeaning: () => '',
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [language, setLanguageState] = useState<LanguageCode>('vi');

    useEffect(() => {
        loadLanguage();
    }, []);

    const loadLanguage = async () => {
        const lang = await settingsRepository.getLanguage();
        setLanguageState(lang);
    };

    const setLanguage = async (lang: LanguageCode) => {
        setLanguageState(lang);
        await settingsRepository.setLanguage(lang);
    };

    const getWordDefinition = (word: Word): string => {
        switch (language) {
            case 'fr': return word.french || word.vietnamese || '';
            case 'es': return word.spanish || word.vietnamese || '';
            case 'pt': return word.portuguese || word.vietnamese || '';
            case 'de': return word.german || word.vietnamese || '';
            case 'vi': default: return word.vietnamese;
        }
    };

    const getWordExampleMeaning = (word: Word): string => {
        switch (language) {
            case 'fr': return word.exampleMeaningFrench || word.exampleMeaning;
            case 'es': return word.exampleMeaningSpanish || word.exampleMeaning;
            case 'pt': return word.exampleMeaningPortuguese || word.exampleMeaning;
            case 'de': return word.exampleMeaningGerman || word.exampleMeaning;
            case 'vi': default: return word.exampleMeaning;
        }
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, getWordDefinition, getWordExampleMeaning }}>
            {children}
        </LanguageContext.Provider>
    );
};
