import { DUMMY_WORDS } from '../dummyData';
import { DUMMY_WORDS_VI_EN } from '../dummyDataViEn';
import { Word } from '../models/Word';

export interface WordRepository {
    getWords(mode: 'en-vi' | 'vi-en'): Promise<Word[]>;
}

export class LocalWordRepository implements WordRepository {
    async getWords(mode: 'en-vi' | 'vi-en' = 'en-vi'): Promise<Word[]> {
        // Simulate network delay
        return new Promise((resolve) => {
            setTimeout(() => {
                const data = mode === 'vi-en' ? DUMMY_WORDS_VI_EN : DUMMY_WORDS;
                resolve([...data]);
            }, 500);
        });
    }
}

export const wordRepository = new LocalWordRepository();
