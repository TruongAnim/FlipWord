import { DUMMY_WORDS } from '../dummyData';
import { Word } from '../models/Word';

export interface WordRepository {
    getWords(): Promise<Word[]>;
}

export class LocalWordRepository implements WordRepository {
    async getWords(): Promise<Word[]> {
        // Simulate network delay
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([...DUMMY_WORDS]);
            }, 500);
        });
    }
}

export const wordRepository = new LocalWordRepository();
